<?php

namespace App\Entity;

use App\Repository\PizzaRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Context;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PizzaRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Pizza
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['pizza:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Groups(['pizza:read', 'pizza:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['pizza:read', 'pizza:write'])]
    private ?string $description = null;

    /**
     * Prix en dirhams (DH), stocké en DECIMAL pour éviter les erreurs d'arrondi.
     * Accepte 50, 58.5 ou "58.50" en entrée ; toujours renvoyé en texte ("58.50").
     */
    #[ORM\Column(type: Types::DECIMAL, precision: 8, scale: 2)]
    #[Groups(['pizza:read', 'pizza:write'])]
    #[Context(denormalizationContext: [AbstractObjectNormalizer::DISABLE_TYPE_ENFORCEMENT => true])]
    #[Assert\NotBlank]
    #[Assert\Regex(pattern: '/^\d{1,6}(\.\d{1,2})?$/', message: 'Prix invalide (ex : 45 ou 45.50).')]
    private ?string $price = null;

    /** Nom du fichier image (stocké dans public/uploads/pizzas). */
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['pizza:read', 'pizza:write'])]
    private ?string $image = null;

    #[ORM\Column(name: 'is_available')]
    #[Groups(['pizza:read', 'pizza:write'])]
    #[SerializedName('isAvailable')]
    private bool $available = true;

    #[ORM\Column]
    #[Groups(['pizza:admin'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['pizza:admin'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = $this->createdAt;
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getPrice(): ?string
    {
        return $this->price;
    }

    public function setPrice(string|int|float $price): static
    {
        $this->price = is_numeric($price) ? number_format((float) $price, 2, '.', '') : (string) $price;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): static
    {
        $this->image = $image;

        return $this;
    }

    public function isAvailable(): bool
    {
        return $this->available;
    }

    public function setAvailable(bool $available): static
    {
        $this->available = $available;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
