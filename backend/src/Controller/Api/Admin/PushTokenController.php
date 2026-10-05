<?php

namespace App\Controller\Api\Admin;

use App\Dto\PushTokenRequest;
use App\Entity\PushToken;
use App\Entity\User;
use App\Http\JsonPayloadMapper;
use App\Repository\PushTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/** Téléphones du patron qui reçoivent les notifications de nouvelles réservations. */
#[Route('/api/admin/push-tokens', name: 'api_admin_push_token_')]
final class PushTokenController extends AbstractController
{
    public function __construct(
        private readonly JsonPayloadMapper $mapper,
        private readonly PushTokenRepository $tokens,
        private readonly EntityManagerInterface $em,
    ) {
    }

    /** Idempotent : l'app l'appelle à chaque connexion / ouverture. */
    #[Route('', name: 'register', methods: ['PUT'])]
    public function register(Request $request, #[CurrentUser] User $user): Response
    {
        $token = $this->mapper->map($request, PushTokenRequest::class)->token;

        $pushToken = $this->tokens->findOneBy(['token' => $token]);
        if (null === $pushToken) {
            $this->em->persist(new PushToken($token, $user));
        } else {
            $pushToken->assignTo($user);
        }
        $this->em->flush();

        return new Response(status: Response::HTTP_NO_CONTENT);
    }

    #[Route('', name: 'unregister', methods: ['DELETE'])]
    public function unregister(Request $request): Response
    {
        $this->tokens->deleteTokens([$this->mapper->map($request, PushTokenRequest::class)->token]);

        return new Response(status: Response::HTTP_NO_CONTENT);
    }
}
