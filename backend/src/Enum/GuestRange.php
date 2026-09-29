<?php

namespace App\Enum;

/** Tranches de nombre d'invités proposées dans le formulaire (sinon : nombre exact). */
enum GuestRange: string
{
    case UpTo10 = '1-10';
    case From10To20 = '10-20';
    case From20To50 = '20-50';
    case From50To100 = '50-100';
    case Over100 = '100+';
}
