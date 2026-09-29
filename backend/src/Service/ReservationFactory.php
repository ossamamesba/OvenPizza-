<?php

namespace App\Service;

use App\Dto\ReservationRequest;
use App\Entity\Reservation;
use App\Entity\ReservationItem;
use App\Repository\PackRepository;
use App\Repository\PizzaRepository;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Exception\ValidationFailedException;

/**
 * Transforme une demande validée en réservation, en vérifiant les règles du pack :
 * pack actif, pizzas du pack et disponibles, nombre de variétés maximum.
 */
final class ReservationFactory
{
    public function __construct(
        private readonly PackRepository $packs,
        private readonly PizzaRepository $pizzas,
    ) {
    }

    public function create(ReservationRequest $request): Reservation
    {
        $violations = new ConstraintViolationList();
        $fail = static fn (string $path, string $message) => $violations->add(new ConstraintViolation($message, null, [], $request, $path, null));

        $pack = $this->packs->find($request->packId);
        if (null === $pack || !$pack->isActive()) {
            $fail('packId', 'Ce pack n’est pas disponible.');
            throw new ValidationFailedException($request, $violations);
        }

        $pizzaIds = array_column($request->items, 'pizzaId');
        if (\count($pizzaIds) !== \count(array_unique($pizzaIds))) {
            $fail('items', 'Chaque pizza ne doit apparaître qu’une fois.');
        }
        if (\count($pizzaIds) > $pack->getMaxVarieties()) {
            $fail('items', \sprintf('Ce pack permet de choisir %d variétés au maximum.', $pack->getMaxVarieties()));
        }

        $reservation = (new Reservation())
            ->setCustomerName(trim((string) $request->customerName))
            ->setPhone(trim((string) $request->phone))
            ->setDate($request->date)
            ->setTime($request->time)
            ->setCity($request->city)
            ->setAddress(trim((string) $request->address))
            ->setGuestRange($request->guestRange)
            ->setNumberOfPeople($request->numberOfPeople)
            ->setNotes(null !== $request->notes && '' !== trim($request->notes) ? trim($request->notes) : null)
            ->setPack($pack);

        foreach ($request->items as $item) {
            $pizza = $this->pizzas->find($item['pizzaId']);
            if (null === $pizza || $pizza->getPack() !== $pack || !$pizza->isAvailable()) {
                $fail('items', 'Une des pizzas choisies n’est pas disponible dans ce pack.');
                continue;
            }
            $reservation->addItem(new ReservationItem($pizza, $item['quantity']));
        }

        if (\count($violations) > 0) {
            throw new ValidationFailedException($request, $violations);
        }

        return $reservation;
    }
}
