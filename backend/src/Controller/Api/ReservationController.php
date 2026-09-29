<?php

namespace App\Controller\Api;

use App\Dto\ReservationRequest;
use App\Http\JsonPayloadMapper;
use App\Service\ReservationFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/** Réservation du traiteur pour un événement, envoyée par le site client (voir ReservationRequest). */
#[Route('/api/reservations', name: 'api_reservation_')]
final class ReservationController extends AbstractController
{
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, JsonPayloadMapper $mapper, ReservationFactory $factory, EntityManagerInterface $em): JsonResponse
    {
        $reservation = $factory->create($mapper->map($request, ReservationRequest::class));

        $em->persist($reservation);
        $em->flush();

        return $this->json($reservation, Response::HTTP_CREATED, context: ['groups' => ['reservation:read']]);
    }
}
