<?php

namespace App\Entity;

use App\Repository\PackRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Context;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Formule du traiteur (ex. Pack Classic, Pack Premium) : un prix et une liste de pizzas au choix.
 * Prix et contenu modifiables par le patron (dashboard / app), jamais dans le code.
 */
#[ORM\Entity(repositoryClass: PackRepository::class)]
class Pack
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['pack:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Groups(['pack:read', 'pack:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['pack:read', 'pack:write'])]
    private ?string $description = null;

    /** Prix en DH (par pizza). Accepte 100, 99.5 ou "100.00" ; toujours renvoyé en texte. */
    #[ORM\Column(type: Types::DECIMAL, precision: 8, scale: 2)]
    #[Groups(['pack:read', 'pack:write'])]
    #[Context(denormalizationContext: [AbstractObjectNormalizer::DISABLE_TYPE_ENFORCEMENT => true])]
    #[Assert\NotBlank]
    #[Assert\Regex(pattern: '/^\d{1,6}(\.\d{1,2})?$/', message: 'Prix invalide (ex : 100 ou 99.50).')]
    private ?string $price = null;

    /** Nombre maximum de variétés de pizzas que le client peut choisir. */
    #[ORM\Column(type: Types::SMALLINT)]
    #[Groups(['pack:read', 'pack:write'])]
    #[Assert\Range(min: 1, max: 20)]
    private int $maxVarieties = 3;

    #[ORM\Column(name: 'is_active')]
    #[Groups(['pack:read', 'pack:write'])]
    #[SerializedName('isActive')]
    private bool $active = true;

    /** Ordre d'affichage (le plus petit en premier). */
    #[ORM\Column(type: Types::SMALLINT)]
    #[Groups(['pack:read', 'pack:write'])]
    private int $position = 0;

    /** @var Collection<int, Pizza> */
    #[ORM\OneToMany(targetEntity: Pizza::class, mappedBy: 'pack')]
    #[ORM\OrderBy(['name' => 'ASC'])]
    private Collection $pizzas;

    public function __construct()
    {
        $this->pizzas = new ArrayCollection();
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

    public function getMaxVarieties(): int
    {
        return $this->maxVarieties;
    }

    public function setMaxVarieties(int $maxVarieties): static
    {
        $this->maxVarieties = $maxVarieties;

        return $this;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function setActive(bool $active): static
    {
        $this->active = $active;

        return $this;
    }

    public function getPosition(): int
    {
        return $this->position;
    }

    public function setPosition(int $position): static
    {
        $this->position = $position;

        return $this;
    }

    /** @return Collection<int, Pizza> */
    public function getPizzas(): Collection
    {
        return $this->pizzas;
    }

    /** @return list<Pizza> pizzas proposées aux clients dans ce pack */
    #[Groups(['pack:pizzas'])]
    #[SerializedName('pizzas')]
    public function getAvailablePizzas(): array
    {
        return array_values($this->pizzas->filter(static fn (Pizza $p) => $p->isAvailable())->toArray());
    }

    #[Groups(['pack:admin'])]
    public function getPizzaCount(): int
    {
        return $this->pizzas->count();
    }
}
