<?php

namespace App\DataFixtures;

use App\Entity\Pizza;
use App\Entity\Reservation;
use App\Enum\ReservationStatus;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/** Données de démonstration (développement uniquement) : doctrine:fixtures:load */
class AppFixtures extends Fixture
{
    private const PIZZAS = [
        ['Margherita', 'Sauce tomate, mozzarella, basilic frais.', 45, true],
        ['Reine', 'Sauce tomate, mozzarella, jambon de dinde, champignons.', 55, true],
        ['Quatre Fromages', 'Mozzarella, gorgonzola, emmental, parmesan.', 65, true],
        ['Végétarienne', 'Poivrons, oignons, olives, champignons, tomates cerises.', 55, true],
        ['Pepperoni', 'Sauce tomate, mozzarella, pepperoni de bœuf.', 60, true],
        ['Fruits de Mer', 'Crevettes, calamars, moules, ail, persil.', 80, false],
    ];

    public function load(ObjectManager $manager): void
    {
        foreach (self::PIZZAS as [$name, $description, $price, $available]) {
            $manager->persist((new Pizza())
                ->setName($name)
                ->setDescription($description)
                ->setPrice($price)
                ->setAvailable($available));
        }

        $reservations = [
            ['Karim Alaoui', '0612345678', '+1 day', '20:00', 4, ReservationStatus::Pending],
            ['Salma Bennani', '0698765432', '+2 days', '19:30', 2, ReservationStatus::Accepted],
            ['Youssef Idrissi', '0655443322', '+3 days', '21:00', 6, ReservationStatus::Pending],
        ];
        foreach ($reservations as [$name, $phone, $day, $time, $people, $status]) {
            $manager->persist((new Reservation())
                ->setCustomerName($name)
                ->setPhone($phone)
                ->setDate(new \DateTimeImmutable('today '.$day))
                ->setTime(\DateTimeImmutable::createFromFormat('!H:i', $time))
                ->setNumberOfPeople($people)
                ->setStatus($status));
        }

        $manager->flush();
    }
}
