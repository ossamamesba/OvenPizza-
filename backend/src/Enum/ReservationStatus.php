<?php

namespace App\Enum;

enum ReservationStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Refused = 'refused';
}
