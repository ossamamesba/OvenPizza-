<?php

namespace App\Notification;

/** Notification affichée sur les téléphones du patron. */
final class PushMessage
{
    /** @param array<string, scalar> $data lu par l'app quand le patron touche la notification */
    public function __construct(
        public readonly string $title,
        public readonly string $body,
        public readonly array $data = [],
    ) {
    }
}
