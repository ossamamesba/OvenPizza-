<?php

namespace App\Controller\Api\Admin;

use App\Entity\Pack;
use App\Http\JsonPayloadMapper;
use App\Repository\PackRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/** Gestion des packs par le patron : nom, prix, nombre de variétés, visibilité. */
#[Route('/api/admin/packs', name: 'api_admin_pack_')]
final class PackController extends AbstractController
{
    private const READ = ['groups' => ['pack:read', 'pack:admin']];
    private const WRITE = ['pack:write'];

    public function __construct(
        private readonly JsonPayloadMapper $mapper,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(PackRepository $packs): JsonResponse
    {
        return $this->json($packs->findAllOrdered(), context: self::READ);
    }

    #[Route('/{id<\d+>}', name: 'show', methods: ['GET'])]
    public function show(Pack $pack): JsonResponse
    {
        return $this->json($pack, context: self::READ);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $pack = $this->mapper->map($request, Pack::class, self::WRITE);
        $this->em->persist($pack);
        $this->em->flush();

        return $this->json($pack, Response::HTTP_CREATED, context: self::READ);
    }

    #[Route('/{id<\d+>}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Pack $pack, Request $request): JsonResponse
    {
        $this->mapper->map($request, $pack, self::WRITE);
        $this->em->flush();

        return $this->json($pack, context: self::READ);
    }

    /** Les pizzas du pack restent au menu (sans pack) ; les réservations gardent le nom et le prix du pack. */
    #[Route('/{id<\d+>}', name: 'delete', methods: ['DELETE'])]
    public function delete(Pack $pack): Response
    {
        $this->em->remove($pack);
        $this->em->flush();

        return new Response(status: Response::HTTP_NO_CONTENT);
    }
}
