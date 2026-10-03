<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gesdinet\JWTRefreshTokenBundle\Entity\RefreshToken as BaseRefreshToken;

/**
 * Jeton de renouvellement (app mobile) : échangé contre un nouveau JWT sur POST /api/token/refresh,
 * pour que le patron reste connecté sans retaper son mot de passe. Usage unique, valable 30 jours.
 */
#[ORM\Entity]
#[ORM\Table(name: 'refresh_tokens')]
class RefreshToken extends BaseRefreshToken
{
}
