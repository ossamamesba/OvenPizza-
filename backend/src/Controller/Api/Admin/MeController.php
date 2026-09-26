<?php

namespace App\Controller\Api\Admin;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/** Infos du patron connecté (vérifier que le jeton est toujours valide au démarrage des apps). */
final class MeController extends AbstractController
{
    #[Route('/api/admin/me', name: 'api_admin_me', methods: ['GET'])]
    public function __invoke(#[CurrentUser] User $user): JsonResponse
    {
        return $this->json($user, context: ['groups' => ['user:read']]);
    }
}
