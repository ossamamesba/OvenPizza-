<?php

namespace App\Notification;

/** Envoie une notification à tous les téléphones enregistrés du patron. Ne lève jamais d'exception. */
interface PushNotifier
{
    public function notifyOwners(PushMessage $message): void;
}
