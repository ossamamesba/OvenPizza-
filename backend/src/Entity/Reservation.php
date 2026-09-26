<?php

namespace App\Entity;

use App\Enum\ReservationStatus;
use App\Repository\ReservationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Context;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Normalizer\DateTimeNormalizer;
use Symfony\Component\Validator\Constraints as Assert;

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
    #[Groups(['reservation:read', 'reservation:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    private ?string $customerName = null;

    #[ORM\Column(length: 20)]
    #[Groups(['reservation:read', 'reservation:write'])]
    #[Assert\NotBlank]
    #[Assert\Regex(pattern: '/^\+?[0-9 ]{8,20}$/', message: 'Numéro de téléphone invalide.')]
    private ?string $phone = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups(['reservation:read', 'reservation:write'])]
    #[Context(normalizationContext: [DateTimeNormalizer::FORMAT_KEY => 'Y-m-d'], denormalizationContext: [DateTimeNormalizer::FORMAT_KEY => '!Y-m-d'])]
    #[Assert\NotNull]
    #[Assert\GreaterThanOrEqual('today')]
    private ?\DateTimeImmutable $date = null;

    #[ORM\Column(type: Types::TIME_IMMUTABLE)]
    #[Groups(['reservation:read', 'reservation:write'])]
    #[Context(normalizationContext: [DateTimeNormalizer::FORMAT_KEY => 'H:i'], denormalizationContext: [DateTimeNormalizer::FORMAT_KEY => '!H:i'])]
    #[Assert\NotNull]
    private ?\DateTimeImmutable $time = null;

    #[ORM\Column(type: Types::SMALLINT)]
    #[Groups(['reservation:read', 'reservation:write'])]
    #[Assert\NotNull]
    #[Assert\Range(min: 1, max: 30)]
    private ?int $numberOfPeople = null;

    #[ORM\Column(length: 20, enumType: ReservationStatus::class)]
    #[Groups(['reservation:read'])]
    private ReservationStatus $status = ReservationStatus::Pending;

    #[ORM\Column]
    #[Groups(['reservation:admin'])]
    private ?\DateTimeImmutable $createdAt = null;

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

    public function setNumberOfPeople(int $numberOfPeople): static
    {
        $this->numberOfPeople = $numberOfPeople;

        return $this;
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
