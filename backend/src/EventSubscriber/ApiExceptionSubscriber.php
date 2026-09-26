<?php

namespace App\EventSubscriber;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Validator\Exception\ValidationFailedException;

/**
 * Renvoie toutes les erreurs de /api au même format JSON :
 * { "error": "message", "violations": { "champ": ["message"] } }
 */
final class ApiExceptionSubscriber implements EventSubscriberInterface
{
    private const MESSAGES = [
        Response::HTTP_UNAUTHORIZED => 'Authentification requise.',
        Response::HTTP_FORBIDDEN => 'Accès refusé.',
        Response::HTTP_NOT_FOUND => 'Ressource introuvable.',
        Response::HTTP_METHOD_NOT_ALLOWED => 'Méthode non autorisée.',
    ];

    public function __construct(
        #[Autowire('%kernel.debug%')] private readonly bool $debug,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        // Priorité 0 : après le listener de sécurité (priorité 1), qui convertit les refus d'accès en 401/403.
        return [KernelEvents::EXCEPTION => ['onKernelException', 0]];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        if (!str_starts_with($event->getRequest()->getPathInfo(), '/api')) {
            return;
        }

        $exception = $event->getThrowable();
        $validation = $exception instanceof ValidationFailedException ? $exception : $exception->getPrevious();

        if ($validation instanceof ValidationFailedException) {
            $violations = [];
            foreach ($validation->getViolations() as $violation) {
                $violations[$violation->getPropertyPath()][] = $violation->getMessage();
            }
            $event->setResponse(new JsonResponse(
                ['error' => 'Données invalides.', 'violations' => $violations],
                Response::HTTP_UNPROCESSABLE_ENTITY,
            ));

            return;
        }

        if ($exception instanceof HttpExceptionInterface) {
            $status = $exception->getStatusCode();
            $message = self::MESSAGES[$status] ?? $exception->getMessage();
            $event->setResponse(new JsonResponse(['error' => $message], $status, $exception->getHeaders()));

            return;
        }

        // En développement, on garde la page d'erreur détaillée de Symfony.
        if (!$this->debug) {
            $event->setResponse(new JsonResponse(['error' => 'Erreur interne du serveur.'], Response::HTTP_INTERNAL_SERVER_ERROR));
        }
    }
}
