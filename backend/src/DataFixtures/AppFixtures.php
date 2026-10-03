<?php

namespace App\DataFixtures;

use App\Entity\Pack;
use App\Entity\Pizza;
use App\Entity\Reservation;
use App\Entity\ReservationItem;
use App\Enum\GuestRange;
use App\Enum\ReservationStatus;
use App\Enum\ServiceCity;
use App\Service\PizzaImageStorage;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Données de démonstration (développement uniquement) : doctrine:fixtures:load
 * Packs et pizzas réels du traiteur (flyers « Pack Classic » et « Pack Premium »).
 * ⚠️ Descriptions à confirmer avec le patron. En production, tout se gère depuis le dashboard.
 */
class AppFixtures extends Fixture
{
    /** [nom, prix par pizza (DH), description, pizzas : [nom, description, photo dans fixtures/pizzas/]] */
    private const PACKS = [
        ['Pack Classic', 100, 'Nos grands classiques, parfaits pour tous les invités.', [
            ['Margherita', 'Sauce tomate, mozzarella fior di latte, basilic frais, huile d’olive.', 'margherita.jpg'],
            ['Pepperoni', 'Sauce tomate, mozzarella, pepperoni de bœuf.', 'pepperoni.jpg'],
            ['Chèvre Miel', 'Crème, mozzarella, fromage de chèvre, miel, noix, thym.', 'chevre-miel.jpg'],
            ['Nutella Pistache', 'Pizza dessert : pâte à tartiner Nutella, éclats de pistache.', 'nutella-pistache.jpg'],
        ]],
        ['Pack Premium', 150, 'Des recettes gourmandes aux produits d’exception.', [
            ['Quatre Fromages', 'Mozzarella, gorgonzola, emmental, parmesan.', 'quatre-fromages.jpg'],
            ['Truffe', 'Crème de truffe noire, mozzarella, roquette, jeunes pousses.', 'truffe.jpg'],
            ['Burrata', 'Sauce tomate, burrata crémeuse, tomates cerises, roquette, parmesan.', 'burrata.jpg'],
            ['Saumon', 'Crème, mozzarella, saumon fumé, câpres, oignon rouge, aneth.', 'saumon.jpg'],
        ]],
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

        /** @var array<string, Pack> $packs */
        $packs = [];
        /** @var array<string, Pizza> $pizzas */
        $pizzas = [];
        foreach (self::PACKS as $position => [$packName, $price, $packDescription, $packPizzas]) {
            $pack = (new Pack())->setName($packName)->setPrice($price)->setDescription($packDescription)->setPosition($position);
            $manager->persist($pack);
            $packs[$packName] = $pack;

            foreach ($packPizzas as [$name, $description, $photo]) {
                $pizza = (new Pizza())->setName($name)->setDescription($description)->setPack($pack);
                $this->images->storeCopy($pizza, $this->photosDir.'/'.$photo); // pizza neuve : pas d'ancienne photo
                $manager->persist($pizza);
                $pizzas[$name] = $pizza;
            }
        }

        $reservations = [
            ['Karim Alaoui', '0612345678', '+3 days', '20:00', ServiceCity::Casablanca, 'Villa 12, rue des Palmiers, Anfa', GuestRange::From20To50, null, 'Pack Classic', ['Margherita' => 15, 'Pepperoni' => 10, 'Nutella Pistache' => 5], ReservationStatus::Pending],
            ['Salma Bennani', '0698765432', '+6 days', '19:30', ServiceCity::Rabat, 'Résidence Les Orangers, Souissi', null, 12, 'Pack Premium', ['Burrata' => 4, 'Truffe' => 4, 'Saumon' => 4], ReservationStatus::Accepted],
            ['Youssef Idrissi', '0655443322', '+10 days', '21:00', ServiceCity::Casablanca, 'Salle des fêtes Al Andalous, Maârif', GuestRange::From50To100, null, 'Pack Classic', ['Margherita' => 30, 'Chèvre Miel' => 20], ReservationStatus::Pending],
        ];
        foreach ($reservations as [$name, $phone, $day, $time, $city, $address, $range, $people, $packName, $items, $status]) {
            $reservation = (new Reservation())
                ->setCustomerName($name)
                ->setPhone($phone)
                ->setDate(new \DateTimeImmutable('today '.$day))
                ->setTime(\DateTimeImmutable::createFromFormat('!H:i', $time))
                ->setCity($city)
                ->setAddress($address)
                ->setGuestRange($range)
                ->setNumberOfPeople($people)
                ->setPack($packs[$packName])
                ->setStatus($status);
            foreach ($items as $pizzaName => $quantity) {
                $reservation->addItem(new ReservationItem($pizzas[$pizzaName], $quantity));
            }
            $manager->persist($reservation);
        }

        $manager->flush();
    }
}
