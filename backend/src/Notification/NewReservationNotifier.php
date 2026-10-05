<?php

namespace App\Notification;

use App\Entity\Reservation;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Prévient le patron de chaque nouvelle réservation.
 * La réservation est retenue à son enregistrement, puis la notification part une fois la réponse
 * envoyée au client (kernel.terminate) : le site n'est jamais ralenti ni bloqué par l'envoi.
 * En ligne de commande (données de démo), kernel.terminate n'existe pas : rien n'est envoyé.
 */
#[AsEntityListener(event: Events::postPersist, entity: Reservation::class)]
#[AsEventListener(event: KernelEvents::TERMINATE, method: 'flush')]
final class NewReservationNotifier
{
    /** @var list<Reservation> */
    private array $pending = [];

    public function __construct(private readonly PushNotifier $notifier)
    {
    }

    public function postPersist(Reservation $reservation): void
    {
        $this->pending[] = $reservation;
    }

    public function flush(): void
    {
        $pending = $this->pending;
        $this->pending = [];

        foreach ($pending as $reservation) {
            $this->notifier->notifyOwners(self::messageFor($reservation));
        }
    }

    /** Ex. « Karim Benali · 12/10/2026 à 19:00 · Casablanca » / « Pack Classic · 30 pizzas ». */
    public static function messageFor(Reservation $reservation): PushMessage
    {
        $when = sprintf('%s à %s', $reservation->getDate()?->format('d/m/Y'), $reservation->getTime()?->format('H:i'));
        $pizzas = $reservation->getTotalPizzas();

        return new PushMessage(
            title: 'Nouvelle réservation 🍕',
            body: implode(' · ', array_filter([
                $reservation->getCustomerName(),
                $when,
                ucfirst((string) $reservation->getCity()?->value),
            ]))."\n".implode(' · ', array_filter([
                $reservation->getPackName(),
                sprintf('%d pizza%s', $pizzas, $pizzas > 1 ? 's' : ''),
            ])),
            data: ['type' => 'reservation', 'reservationId' => (int) $reservation->getId()],
        );
    }
}
