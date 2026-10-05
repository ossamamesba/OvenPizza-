<?php

namespace App\Entity;

use App\Repository\PushTokenRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Téléphone du patron qui reçoit les notifications (jeton Expo, ex. « ExponentPushToken[xxx] »).
 * Enregistré à la connexion dans l'app mobile, supprimé à la déconnexion ou quand Expo le déclare invalide.
 */
#[ORM\Entity(repositoryClass: PushTokenRepository::class)]
#[ORM\Table(name: 'push_token')]
class PushToken
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    private string $token;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    public function __construct(string $token, User $user)
    {
        $this->token = $token;
        $this->assignTo($user);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    /** Un téléphone appartient au dernier compte qui s'y est connecté. */
    public function assignTo(User $user): void
    {
        $this->user = $user;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
