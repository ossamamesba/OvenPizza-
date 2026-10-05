<?php

namespace App\DataFixtures;

use App\Entity\Reservation;
use App\Entity\ReservationItem;
use App\Enum\GuestRange;
use App\Enum\ReservationStatus;
use App\Enum\ServiceCity;
use App\Service\CatalogSeeder;
use App\Service\PizzaImageStorage;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

/**
 * Données de démonstration (développement uniquement) : doctrine:fixtures:load
 * Le catalogue réel (voir CatalogSeeder) + quelques réservations fictives.
 */
class AppFixtures extends Fixture
{
    public function __construct(
        private readonly PizzaImageStorage $images,
        private readonly CatalogSeeder $catalog,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        // Les pizzas viennent d'être supprimées : on supprime aussi leurs anciennes photos.
        $this->images->removeAll();

        ['packs' => $packs, 'pizzas' => $pizzas] = $this->catalog->seed();

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
