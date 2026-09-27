<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Purger\PurgerFactory;
use Doctrine\Common\DataFixtures\Purger\ORMPurger;
use Doctrine\Common\DataFixtures\Purger\PurgerInterface;
use Doctrine\ORM\EntityManagerInterface;

/**
 * doctrine:fixtures:load vide toutes les tables… sauf `user` :
 * le compte du patron n'est jamais supprimé par les données de démo.
 * Remplace le « purger » par défaut du bundle (voir config/services.yaml).
 */
final class KeepUsersPurgerFactory implements PurgerFactory
{
    public function createForEntityManager(
        ?string $emName,
        EntityManagerInterface $em,
        array $excluded = [],
        bool $purgeWithTruncate = false,
    ): PurgerInterface {
        $purger = new ORMPurger($em, [...$excluded, '`user`']);
        $purger->setPurgeMode($purgeWithTruncate ? ORMPurger::PURGE_MODE_TRUNCATE : ORMPurger::PURGE_MODE_DELETE);

        return $purger;
    }
}
