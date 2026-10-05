<?php

namespace App\Repository;

use App\Entity\PushToken;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PushToken>
 */
class PushTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PushToken::class);
    }

    /** @return list<string> */
    public function findAllTokens(): array
    {
        return array_column(
            $this->createQueryBuilder('t')->select('t.token')->getQuery()->getScalarResult(),
            'token',
        );
    }

    /** @param list<string> $tokens */
    public function deleteTokens(array $tokens): void
    {
        if ([] === $tokens) {
            return;
        }

        $this->createQueryBuilder('t')
            ->delete()
            ->where('t.token IN (:tokens)')
            ->setParameter('tokens', $tokens)
            ->getQuery()
            ->execute();
    }
}
