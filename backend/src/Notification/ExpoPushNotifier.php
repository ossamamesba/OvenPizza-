<?php

namespace App\Notification;

use App\Repository\PushTokenRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Envoi via le service gratuit d'Expo (https://docs.expo.dev/push-notifications/sending-notifications/),
 * qui relaie vers Google (Android) ou Apple (iPhone).
 * Les téléphones désinstallés ou déconnectés (« DeviceNotRegistered ») sont oubliés automatiquement.
 */
final class ExpoPushNotifier implements PushNotifier
{
    /** Limite d'Expo par requête. */
    private const BATCH_SIZE = 100;

    /** Canal Android créé par l'app mobile (son + bannière). */
    private const ANDROID_CHANNEL = 'reservations';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly PushTokenRepository $tokens,
        private readonly LoggerInterface $logger,
        #[Autowire(env: 'EXPO_PUSH_URL')]
        private readonly string $endpoint,
    ) {
    }

    public function notifyOwners(PushMessage $message): void
    {
        foreach (array_chunk($this->tokens->findAllTokens(), self::BATCH_SIZE) as $batch) {
            $this->sendBatch($batch, $message);
        }
    }

    /** @param list<string> $tokens */
    private function sendBatch(array $tokens, PushMessage $message): void
    {
        $payload = array_map(static fn (string $token): array => [
            'to' => $token,
            'title' => $message->title,
            'body' => $message->body,
            'data' => (object) $message->data,
            'sound' => 'default',
            'priority' => 'high',
            'channelId' => self::ANDROID_CHANNEL,
        ], $tokens);

        try {
            $tickets = $this->httpClient->request('POST', $this->endpoint, [
                'json' => $payload,
                'headers' => ['Accept' => 'application/json'],
                'timeout' => 10,
            ])->toArray()['data'] ?? [];
        } catch (ExceptionInterface $e) {
            $this->logger->error('Notification Expo non envoyée : {error}', ['error' => $e->getMessage()]);

            return;
        }

        // Un ticket par message, dans le même ordre que les jetons envoyés.
        $invalid = [];
        foreach ($tickets as $i => $ticket) {
            if ('error' !== ($ticket['status'] ?? null)) {
                continue;
            }
            if ('DeviceNotRegistered' === ($ticket['details']['error'] ?? null) && isset($tokens[$i])) {
                $invalid[] = $tokens[$i];
            } else {
                $this->logger->warning('Notification Expo refusée : {message}', ['message' => $ticket['message'] ?? '?']);
            }
        }
        $this->tokens->deleteTokens($invalid);
    }
}
