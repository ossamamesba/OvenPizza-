<?php

namespace App\Controller\Api\Admin;

use App\Entity\Reservation;
use App\Enum\ReservationStatus;
use App\Repository\ReservationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;

/** Gestion des réservations par le patron (dashboard web + application mobile). */
#[Route('/api/admin/reservations', name: 'api_admin_reservation_')]
final class ReservationController extends AbstractController
{
    private const READ = ['groups' => ['reservation:read', 'reservation:admin']];

    /** Filtres facultatifs : ?status=pending&date=2026-10-01 */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request, ReservationRepository $reservations): JsonResponse
    {
        $status = $request->query->get('status');
        $date = $request->query->get('date');

        $statusFilter = null !== $status
            ? (ReservationStatus::tryFrom($status) ?? throw new BadRequestHttpException('Statut inconnu.'))
            : null;
        $dateFilter = null !== $date
            ? (\DateTimeImmutable::createFromFormat('!Y-m-d', $date) ?: throw new BadRequestHttpException('Date invalide (format AAAA-MM-JJ).'))
            : null;

        return $this->json($reservations->findByFilters($statusFilter, $dateFilter), context: self::READ);
    }

    #[Route('/{id<\d+>}', name: 'show', methods: ['GET'])]
    public function show(Reservation $reservation): JsonResponse
    {
        return $this->json($reservation, context: self::READ);
    }

    /** Accepter / refuser : {"status": "accepted"} ou {"status": "refused"} */
    #[Route('/{id<\d+>}/status', name: 'update_status', methods: ['PATCH'])]
    public function updateStatus(Reservation $reservation, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        $status = ReservationStatus::tryFrom((string) (\is_array($payload) ? ($payload['status'] ?? '') : ''))
            ?? throw new BadRequestHttpException('Statut attendu : pending, accepted ou refused.');

        $reservation->setStatus($status);
        $em->flush();

        return $this->json($reservation, context: self::READ);
    }
}
