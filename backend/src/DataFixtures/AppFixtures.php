<?php

namespace App\DataFixtures;

use App\Entity\Pizza;
use App\Entity\Reservation;
use App\Enum\ReservationStatus;
use App\Service\PizzaImageStorage;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Données de démonstration (développement uniquement) : doctrine:fixtures:load
 * Menu réel du restaurant — ⚠️ prix et descriptions à confirmer avec le patron.
 * En production, le patron gère le menu depuis le dashboard ou l'app mobile.
 */
class AppFixtures extends Fixture
{
    /** [nom, description, prix (DH), disponible, photo dans fixtures/pizzas/] */
    private const PIZZAS = [
        ['Margherita', 'Sauce tomate, mozzarella fior di latte, basilic frais, huile d’olive.', 50, true, 'margherita.jpg'],
        ['Pepperoni', 'Sauce tomate, mozzarella, pepperoni de bœuf.', 65, true, 'pepperoni.jpg'],
        ['Chèvre Miel', 'Crème, mozzarella, fromage de chèvre, miel, noix, thym.', 70, true, 'chevre-miel.jpg'],
        ['Burrata', 'Sauce tomate, burrata crémeuse, tomates cerises, roquette, parmesan.', 85, true, 'burrata.jpg'],
        ['Truffe', 'Crème de truffe noire, mozzarella, roquette, jeunes pousses.', 95, true, 'truffe.jpg'],
    ];

    public function __construct(
        private readonly PizzaImageStorage $images,
        #[Autowire('%kernel.project_dir%/fixtures/pizzas')] private readonly string $photosDir,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        // Les pizzas viennent d'être supprimées : on supprime aussi leurs anciennes photos.
        $this->images->removeAll();

        foreach (self::PIZZAS as [$name, $description, $price, $available, $photo]) {
            $pizza = (new Pizza())
                ->setName($name)
                ->setDescription($description)
                ->setPrice($price)
                ->setAvailable($available);
            $this->images->storeCopy($pizza, $this->photosDir.'/'.$photo);
            $manager->persist($pizza);
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
