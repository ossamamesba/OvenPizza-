<?php

namespace App\Repository;

use App\Entity\Pizza;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Pizza>
 */
class PizzaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Pizza::class);
    }

    /** @return list<Pizza> pizzas visibles sur le site client */
    public function findAvailable(): array
    {
        return $this->findBy(['available' => true], ['name' => 'ASC']);
    }
}
