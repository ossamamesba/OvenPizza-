<?php

namespace App\Dto;

use App\Enum\GuestRange;
use App\Enum\ServiceCity;
use Symfony\Component\Serializer\Attribute\Context;
use Symfony\Component\Serializer\Normalizer\DateTimeNormalizer;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Données envoyées par le site client pour réserver le traiteur (POST /api/reservations).
 * Exemple :
 * {"customerName": "Salma", "phone": "0612345678", "date": "2026-10-10", "time": "20:00",
 *  "city": "casablanca", "address": "Villa 12, Anfa", "guestRange": "20-50", "notes": null,
 *  "packId": 1, "items": [{"pizzaId": 3, "quantity": 10}, {"pizzaId": 4, "quantity": 8}]}
 */
final class ReservationRequest
{
    #[Assert\NotBlank(message: 'Indiquez votre nom.')]
    #[Assert\Length(max: 100)]
    public ?string $customerName = null;

    #[Assert\NotBlank(message: 'Indiquez votre téléphone.')]
    #[Assert\Regex(pattern: '/^\+?[0-9 ]{8,20}$/', message: 'Numéro de téléphone invalide.')]
    public ?string $phone = null;

    #[Context([DateTimeNormalizer::FORMAT_KEY => '!Y-m-d'])]
    #[Assert\NotNull(message: 'Choisissez une date.')]
    #[Assert\GreaterThanOrEqual('today', message: 'La date doit être aujourd’hui ou plus tard.')]
    public ?\DateTimeImmutable $date = null;

    #[Context([DateTimeNormalizer::FORMAT_KEY => '!H:i'])]
    #[Assert\NotNull(message: 'Choisissez une heure.')]
    public ?\DateTimeImmutable $time = null;

    #[Assert\NotNull(message: 'Choisissez une ville.')]
    public ?ServiceCity $city = null;

    #[Assert\NotBlank(message: 'Indiquez l’adresse de l’événement.')]
    #[Assert\Length(max: 255)]
    public ?string $address = null;

    /** Tranche d'invités, OU nombre exact ci-dessous. */
    public ?GuestRange $guestRange = null;

    #[Assert\Range(min: 1, max: 2000)]
    public ?int $numberOfPeople = null;

    #[Assert\Length(max: 1000)]
    public ?string $notes = null;

    #[Assert\NotNull(message: 'Choisissez un pack.')]
    #[Assert\Positive]
    public ?int $packId = null;

    /** @var list<array{pizzaId: int, quantity: int}> */
    #[Assert\Count(min: 1, minMessage: 'Choisissez au moins une pizza.')]
    #[Assert\All([
        new Assert\Collection(
            fields: [
                'pizzaId' => [new Assert\NotNull(), new Assert\Type('int'), new Assert\Positive()],
                'quantity' => [new Assert\NotNull(), new Assert\Type('int'), new Assert\Range(min: 1, max: 500)],
            ],
        ),
    ])]
    public array $items = [];

    #[Assert\Callback]
    public function validateGuests(ExecutionContextInterface $context): void
    {
        if ((null === $this->guestRange) === (null === $this->numberOfPeople)) {
            $context->buildViolation('Choisissez une tranche d’invités ou indiquez le nombre exact.')
                ->atPath('numberOfPeople')
                ->addViolation();
        }
    }
}
