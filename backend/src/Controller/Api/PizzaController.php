<?php

namespace App\Controller\Api;

use App\Repository\PizzaRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

/** Menu public, utilisé par le site client. */
#[Route('/api/pizzas', name: 'api_pizza_')]
final class PizzaController extends AbstractController
{
    public function __construct(private readonly PizzaRepository $pizzas)
    {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json($this->pizzas->findAvailable(), context: ['groups' => ['pizza:read']]);
    }

    #[Route('/{id<\d+>}', name: 'show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $pizza = $this->pizzas->findOneBy(['id' => $id, 'available' => true])
            ?? throw new NotFoundHttpException();

        return $this->json($pizza, context: ['groups' => ['pizza:read']]);
    }
}
