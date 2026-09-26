<?php

namespace App\Controller\Api\Admin;

use App\Entity\Pizza;
use App\Http\JsonPayloadMapper;
use App\Repository\PizzaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/** Gestion du menu par le patron (dashboard web + application mobile). */
#[Route('/api/admin/pizzas', name: 'api_admin_pizza_')]
final class PizzaController extends AbstractController
{
    private const READ = ['groups' => ['pizza:read', 'pizza:admin']];
    private const WRITE = ['pizza:write'];

    public function __construct(
        private readonly JsonPayloadMapper $mapper,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(PizzaRepository $pizzas): JsonResponse
    {
        return $this->json($pizzas->findBy([], ['name' => 'ASC']), context: self::READ);
    }

    #[Route('/{id<\d+>}', name: 'show', methods: ['GET'])]
    public function show(Pizza $pizza): JsonResponse
    {
        return $this->json($pizza, context: self::READ);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $pizza = $this->mapper->map($request, Pizza::class, self::WRITE);

        $this->em->persist($pizza);
        $this->em->flush();

        return $this->json($pizza, Response::HTTP_CREATED, context: self::READ);
    }

    /** PUT : modification complète. PATCH : modification partielle (ex. {"isAvailable": false}). */
    #[Route('/{id<\d+>}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Pizza $pizza, Request $request): JsonResponse
    {
        $this->mapper->map($request, $pizza, self::WRITE);
        $this->em->flush();

        return $this->json($pizza, context: self::READ);
    }

    #[Route('/{id<\d+>}', name: 'delete', methods: ['DELETE'])]
    public function delete(Pizza $pizza): Response
    {
        $this->em->remove($pizza);
        $this->em->flush();

        return new Response(status: Response::HTTP_NO_CONTENT);
    }
}
