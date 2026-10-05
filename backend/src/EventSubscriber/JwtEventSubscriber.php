<?php

namespace App\EventSubscriber;

use App\Entity\User;
use Gesdinet\JWTRefreshTokenBundle\Event\RefreshAuthenticationFailureEvent;
use Gesdinet\JWTRefreshTokenBundle\Event\RefreshTokenNotFoundEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationFailureEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTExpiredEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTInvalidEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTNotFoundEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\TooManyLoginAttemptsAuthenticationException;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

/**
 * Adapte les réponses du bundle JWT au format commun de l'API ({"error": "..."})
 * et ajoute les infos du patron à la réponse du login.
 */
final class JwtEventSubscriber implements EventSubscriberInterface
{
    public function __construct(private readonly NormalizerInterface $normalizer)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            Events::AUTHENTICATION_SUCCESS => 'onAuthenticationSuccess',
            Events::AUTHENTICATION_FAILURE => 'onAuthenticationFailure',
            Events::JWT_NOT_FOUND => 'onJwtNotFound',
            Events::JWT_INVALID => 'onJwtInvalid',
            Events::JWT_EXPIRED => 'onJwtExpired',
            // Renouvellement du jeton (app mobile) refusé : jeton absent, inconnu, expiré ou déjà utilisé.
            'gesdinet.refresh_token_failure' => 'onRefreshFailure',
            'gesdinet.refresh_token_not_found' => 'onRefreshFailure',
        ];
    }

    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();
        if ($user instanceof User) {
            $event->setData($event->getData() + [
                'user' => $this->normalizer->normalize($user, context: ['groups' => ['user:read']]),
            ]);
        }
    }

    public function onAuthenticationFailure(AuthenticationFailureEvent $event): void
    {
        if ($event->getException() instanceof TooManyLoginAttemptsAuthenticationException) {
            $event->setResponse($this->error('Trop de tentatives. Réessayez dans 15 minutes.', Response::HTTP_TOO_MANY_REQUESTS));

            return;
        }

        // Même événement pour le login et le renouvellement du jeton (app mobile) : message adapté.
        $isRefresh = str_ends_with((string) $event->getRequest()?->getPathInfo(), '/token/refresh');
        $event->setResponse($this->error($isRefresh ? 'Session expirée, reconnectez-vous.' : 'Email ou mot de passe incorrect.'));
    }

    public function onJwtNotFound(JWTNotFoundEvent $event): void
    {
        $event->setResponse($this->error('Authentification requise.'));
    }

    public function onJwtInvalid(JWTInvalidEvent $event): void
    {
        $event->setResponse($this->error('Jeton invalide, reconnectez-vous.'));
    }

    public function onJwtExpired(JWTExpiredEvent $event): void
    {
        $event->setResponse($this->error('Session expirée, reconnectez-vous.'));
    }

    public function onRefreshFailure(RefreshAuthenticationFailureEvent|RefreshTokenNotFoundEvent $event): void
    {
        $event->setResponse($this->error('Session expirée, reconnectez-vous.'));
    }

    private function error(string $message, int $status = Response::HTTP_UNAUTHORIZED): JsonResponse
    {
        return new JsonResponse(['error' => $message], $status);
    }
}
