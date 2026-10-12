<?php

namespace App\Image;

/** Redimensionne et compresse une photo pour le web. */
interface ImageOptimizer
{
    /** Faux si le serveur ne sait pas optimiser (ex. extension PHP absente) : la photo est alors gardée telle quelle. */
    public function isSupported(): bool;

    /**
     * Écrit dans $destination une version WebP dont le plus grand côté fait au plus $maxSize pixels.
     *
     * @throws \RuntimeException si l'image est illisible
     */
    public function saveWebp(string $source, string $destination, int $maxSize): void;
}
