<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/** Corps de PUT/DELETE /api/admin/push-tokens envoyé par l'app mobile. */
final class PushTokenRequest
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    #[Assert\Regex(pattern: '/^Expo(nent)?PushToken\[[^\]]+\]$/', message: 'Jeton de notification invalide.')]
    public string $token = '';
}
