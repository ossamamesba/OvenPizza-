<?php

namespace App\Controller\Api;

use App\Entity\Reservation;
use App\Http\JsonPayloadMapper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/** Réservation en ligne, utilisée par le site client. */
#[Route('/api/reservations', name: 'api_reservation_')]
final class ReservationController extends AbstractController
{
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, JsonPayloadMapper $mapper, EntityManagerInterface $em): JsonResponse
    {
        $reservation = $mapper->map($request, Reservation::class, ['reservation:write']);

        $em->persist($reservation);
        $em->flush();

        return $this->json($reservation, Response::HTTP_CREATED, context: ['groups' => ['reservation:read']]);
    }
}
