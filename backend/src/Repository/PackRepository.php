<?php

namespace App\Repository;

use App\Entity\Pack;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Pack>
 */
class PackRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Pack::class);
    }

    /** @return list<Pack> */
    public function findAllOrdered(bool $activeOnly = false): array
    {
        return $this->findBy($activeOnly ? ['active' => true] : [], ['position' => 'ASC', 'name' => 'ASC']);
    }
}
