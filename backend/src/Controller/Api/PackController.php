<?php

namespace App\Controller\Api;

use App\Repository\PackRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/** Packs proposés sur le site client, avec leurs pizzas disponibles. */
final class PackController extends AbstractController
{
    #[Route('/api/packs', name: 'api_pack_list', methods: ['GET'])]
    public function list(PackRepository $packs): JsonResponse
    {
        return $this->json($packs->findAllOrdered(activeOnly: true), context: ['groups' => ['pack:read', 'pack:pizzas', 'pizza:read']]);
    }
}
