<?php

namespace App\Entity;

use App\Enum\GuestRange;
use App\Enum\ReservationStatus;
use App\Enum\ServiceCity;
use App\Repository\ReservationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Context;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Normalizer\DateTimeNormalizer;

#[ORM\Entity(repositoryClass: ReservationRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ORM\Index(name: 'idx_reservation_date_status', columns: ['date', 'status'])]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['reservation:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Groups(['reservation:read'])]
    private ?string $customerName = null;

    #[ORM\Column(length: 20)]
    #[Groups(['reservation:read'])]
    private ?string $phone = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups(['reservation:read'])]
    #[Context(normalizationContext: [DateTimeNormalizer::FORMAT_KEY => 'Y-m-d'], denormalizationContext: [DateTimeNormalizer::FORMAT_KEY => '!Y-m-d'])]
    private ?\DateTimeImmutable $date = null;

    #[ORM\Column(type: Types::TIME_IMMUTABLE)]
    #[Groups(['reservation:read'])]
    #[Context(normalizationContext: [DateTimeNormalizer::FORMAT_KEY => 'H:i'], denormalizationContext: [DateTimeNormalizer::FORMAT_KEY => '!H:i'])]
    private ?\DateTimeImmutable $time = null;

    /** Nombre exact d'invités (sinon, voir guestRange). */
    #[ORM\Column(type: Types::SMALLINT, nullable: true)]
    #[Groups(['reservation:read'])]
    private ?int $numberOfPeople = null;

    /** Tranche d'invités choisie par le client (si le nombre exact n'est pas connu). */
    #[ORM\Column(length: 10, nullable: true, enumType: GuestRange::class)]
    #[Groups(['reservation:read'])]
    private ?GuestRange $guestRange = null;

    #[ORM\Column(length: 20, nullable: true, enumType: ServiceCity::class)]
    #[Groups(['reservation:read'])]
    private ?ServiceCity $city = null;

    /** Adresse du lieu de l'événement. */
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['reservation:read'])]
    private ?string $address = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['reservation:read'])]
    private ?string $notes = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(onDelete: 'SET NULL')]
    private ?Pack $pack = null;

    /** Nom et prix du pack au moment de la demande (le pack peut changer ensuite). */
    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['reservation:read'])]
    private ?string $packName = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 8, scale: 2, nullable: true)]
    #[Groups(['reservation:read'])]
    private ?string $packPrice = null;

    /** @var Collection<int, ReservationItem> */
    #[ORM\OneToMany(targetEntity: ReservationItem::class, mappedBy: 'reservation', cascade: ['persist'], orphanRemoval: true)]
    #[Groups(['reservation:read'])]
    private Collection $items;

    #[ORM\Column(length: 20, enumType: ReservationStatus::class)]
    #[Groups(['reservation:read'])]
    private ReservationStatus $status = ReservationStatus::Pending;

    #[ORM\Column]
    #[Groups(['reservation:admin'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->items = new ArrayCollection();
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCustomerName(): ?string
    {
        return $this->customerName;
    }

    public function setCustomerName(string $customerName): static
    {
        $this->customerName = $customerName;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getDate(): ?\DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getTime(): ?\DateTimeImmutable
    {
        return $this->time;
    }

    public function setTime(\DateTimeImmutable $time): static
    {
        $this->time = $time;

        return $this;
    }

    public function getNumberOfPeople(): ?int
    {
        return $this->numberOfPeople;
    }

    public function setNumberOfPeople(?int $numberOfPeople): static
    {
        $this->numberOfPeople = $numberOfPeople;

        return $this;
    }

    public function getGuestRange(): ?GuestRange
    {
        return $this->guestRange;
    }

    public function setGuestRange(?GuestRange $guestRange): static
    {
        $this->guestRange = $guestRange;

        return $this;
    }

    public function getCity(): ?ServiceCity
    {
        return $this->city;
    }

    public function setCity(?ServiceCity $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;

        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;

        return $this;
    }

    public function getPack(): ?Pack
    {
        return $this->pack;
    }

    /** Associe le pack et mémorise son nom et son prix actuels. */
    public function setPack(Pack $pack): static
    {
        $this->pack = $pack;
        $this->packName = $pack->getName();
        $this->packPrice = $pack->getPrice();

        return $this;
    }

    public function getPackName(): ?string
    {
        return $this->packName;
    }

    public function getPackPrice(): ?string
    {
        return $this->packPrice;
    }

    /** @return Collection<int, ReservationItem> */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(ReservationItem $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setReservation($this);
        }

        return $this;
    }

    #[Groups(['reservation:read'])]
    public function getTotalPizzas(): int
    {
        return array_sum($this->items->map(static fn (ReservationItem $i) => $i->getQuantity())->toArray());
    }

    /** Estimation : nombre de pizzas × prix du pack (le patron confirme le prix final). */
    #[Groups(['reservation:read'])]
    public function getEstimatedTotal(): ?string
    {
        return null === $this->packPrice ? null : number_format($this->getTotalPizzas() * (float) $this->packPrice, 2, '.', '');
    }

    public function getStatus(): ReservationStatus
    {
        return $this->status;
    }

    public function setStatus(ReservationStatus $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
}
