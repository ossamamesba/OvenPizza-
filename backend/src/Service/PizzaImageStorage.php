<?php

namespace App\Service;

use App\Entity\Pizza;
use App\Image\ImageOptimizer;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Enregistre les photos des pizzas dans public/uploads/pizzas (servies par Nginx sur /uploads/pizzas/…).
 *
 * Chaque photo est optimisée en deux fichiers WebP : « abc.webp » (grande, 800 px) et « abc-thumb.webp »
 * (vignette, 240 px) ; seul « abc.webp » est enregistré en base. Voir pizzaImageUrl() dans shared/lib/format.ts.
 *
 * Cohérence fichiers ↔ base : ces méthodes ne suppriment jamais l'ancienne photo elles-mêmes.
 * Elles renvoient son nom, et l'appelant appelle deleteFile() APRÈS le flush réussi :
 * si la base refuse le changement, l'ancienne photo est toujours là.
 */
final class PizzaImageStorage
{
    private const FULL_SIZE = 800;
    private const THUMB_SIZE = 240;
    private const THUMB_SUFFIX = '-thumb';

    public function __construct(
        private readonly ImageOptimizer $optimizer,
        #[Autowire('%kernel.project_dir%/public/uploads/pizzas')] private readonly string $directory,
        private readonly Filesystem $filesystem = new Filesystem(),
    ) {
    }

    /** Pose une nouvelle photo envoyée. Renvoie le nom de l'ancienne photo (à supprimer après le flush). */
    public function store(Pizza $pizza, UploadedFile $file): ?string
    {
        return $this->swap($pizza, $this->save($file->getPathname(), $file->guessExtension() ?? 'jpg'));
    }

    /** Copie une image existante (ex. catalogue de départ). Renvoie le nom de l'ancienne photo. */
    public function storeCopy(Pizza $pizza, string $sourcePath): ?string
    {
        return $this->swap($pizza, $this->save($sourcePath, pathinfo($sourcePath, \PATHINFO_EXTENSION)));
    }

    /** Vrai si la photo est déjà au format optimisé (grande + vignette). */
    public function isOptimized(string $filename): bool
    {
        return str_ends_with($filename, '.webp') && is_file($this->directory.'/'.$this->thumbName($filename));
    }

    public function path(string $filename): string
    {
        return $this->directory.'/'.basename($filename);
    }

    /** Retire la photo de la pizza (sans toucher au fichier). Renvoie le nom du fichier à supprimer après le flush. */
    public function detach(Pizza $pizza): ?string
    {
        return $this->swap($pizza, null);
    }

    public function deleteFile(?string $filename): void
    {
        if (null !== $filename) {
            // basename() : on ne supprime jamais en dehors du dossier des photos.
            $this->filesystem->remove([$this->path($filename), $this->path($this->thumbName($filename))]);
        }
    }

    /** Supprime toutes les photos (utilisé uniquement par les données de démo, qui repartent de zéro). */
    public function removeAll(): void
    {
        $this->filesystem->remove($this->directory);
    }

    private function swap(Pizza $pizza, ?string $filename): ?string
    {
        $previous = $pizza->getImage();
        $pizza->setImage($filename);

        return $previous;
    }

    /** Écrit la photo (optimisée si possible) et renvoie le nom enregistré en base. */
    private function save(string $source, string $extension): string
    {
        $this->filesystem->mkdir($this->directory);
        $name = bin2hex(random_bytes(16));

        if (!$this->optimizer->isSupported()) {
            $filename = $name.'.'.strtolower($extension);
            $this->filesystem->copy($source, $this->path($filename));

            return $filename;
        }

        $filename = $name.'.webp';
        $this->optimizer->saveWebp($source, $this->path($filename), self::FULL_SIZE);
        $this->optimizer->saveWebp($source, $this->path($this->thumbName($filename)), self::THUMB_SIZE);

        return $filename;
    }

    private function thumbName(string $filename): string
    {
        return pathinfo($filename, \PATHINFO_FILENAME).self::THUMB_SUFFIX.'.webp';
    }
}
