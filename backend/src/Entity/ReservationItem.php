<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/** Une ligne de commande : une pizza et sa quantité. Le nom est copié pour garder l'historique. */
#[ORM\Entity]
class ReservationItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Reservation $reservation = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(onDelete: 'SET NULL')]
    private ?Pizza $pizza = null;

    #[ORM\Column(length: 100)]
    #[Groups(['reservation:read'])]
    private ?string $pizzaName = null;

    #[ORM\Column(type: Types::SMALLINT)]
    #[Groups(['reservation:read'])]
    private int $quantity = 1;

    public function __construct(Pizza $pizza, int $quantity)
    {
        $this->pizza = $pizza;
        $this->pizzaName = $pizza->getName();
        $this->quantity = $quantity;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getReservation(): ?Reservation
    {
        return $this->reservation;
    }

    public function setReservation(?Reservation $reservation): static
    {
        $this->reservation = $reservation;

        return $this;
    }

    public function getPizza(): ?Pizza
    {
        return $this->pizza;
    }

    #[Groups(['reservation:read'])]
    public function getPizzaId(): ?int
    {
        return $this->pizza?->getId();
    }

    public function getPizzaName(): ?string
    {
        return $this->pizzaName;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }
}
