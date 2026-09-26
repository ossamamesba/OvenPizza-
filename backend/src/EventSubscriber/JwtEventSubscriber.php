<?php

namespace App\EventSubscriber;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationFailureEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTExpiredEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTInvalidEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTNotFoundEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
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
        $event->setResponse($this->error('Email ou mot de passe incorrect.'));
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

    private function error(string $message): JsonResponse
    {
        return new JsonResponse(['error' => $message], Response::HTTP_UNAUTHORIZED);
    }
}
