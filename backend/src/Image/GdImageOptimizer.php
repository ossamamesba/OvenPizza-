<?php

namespace App\Image;

/** Optimisation avec l'extension GD de PHP (JPEG, PNG ou WebP → WebP). */
final class GdImageOptimizer implements ImageOptimizer
{
    private const QUALITY = 80;

    public function isSupported(): bool
    {
        return \function_exists('imagewebp');
    }

    public function saveWebp(string $source, string $destination, int $maxSize): void
    {
        $image = @imagecreatefromstring((string) @file_get_contents($source));
        if (false === $image) {
            throw new \RuntimeException('Image illisible.');
        }

        $image = $this->applyExifRotation($image, $source);
        imagepalettetotruecolor($image);

        $width = imagesx($image);
        $height = imagesy($image);
        $scale = min(1, $maxSize / max($width, $height));
        if ($scale < 1) {
            $resized = imagescale($image, max(1, (int) round($width * $scale)), max(1, (int) round($height * $scale)), \IMG_BICUBIC);
            if (false === $resized) {
                throw new \RuntimeException('Redimensionnement impossible.');
            }
            $image = $resized;
        }

        // Garde la transparence des PNG.
        imagealphablending($image, false);
        imagesavealpha($image, true);

        if (!imagewebp($image, $destination, self::QUALITY)) {
            throw new \RuntimeException('Enregistrement de la photo impossible.');
        }
    }

    /** Photos d'appareil : remet l'image droite selon l'orientation EXIF (sinon elle peut apparaître couchée). */
    private function applyExifRotation(\GdImage $image, string $source): \GdImage
    {
        if (!\function_exists('exif_read_data')) {
            return $image;
        }
        $orientation = @exif_read_data($source)['Orientation'] ?? 1;
        $angle = match ($orientation) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        return 0 === $angle ? $image : (imagerotate($image, $angle, 0) ?: $image);
    }
}
