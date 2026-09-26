<?php

namespace App\Repository;

use App\Entity\Reservation;
use App\Enum\ReservationStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Reservation>
 */
class ReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

    /** @return list<Reservation> */
    public function findByFilters(?ReservationStatus $status, ?\DateTimeImmutable $date): array
    {
        $qb = $this->createQueryBuilder('r')
            ->orderBy('r.date', 'ASC')
            ->addOrderBy('r.time', 'ASC');

        if (null !== $status) {
            $qb->andWhere('r.status = :status')->setParameter('status', $status);
        }
        if (null !== $date) {
            $qb->andWhere('r.date = :date')->setParameter('date', $date, 'date_immutable');
        }

        return $qb->getQuery()->getResult();
    }
}
