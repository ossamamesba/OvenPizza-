<?php

namespace App\Service;

use App\Entity\Pizza;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Enregistre les photos des pizzas dans public/uploads/pizzas (servies par Nginx sur /uploads/pizzas/…).
 *
 * Cohérence fichiers ↔ base : ces méthodes ne suppriment jamais l'ancienne photo elles-mêmes.
 * Elles renvoient son nom, et l'appelant appelle deleteFile() APRÈS le flush réussi :
 * si la base refuse le changement, l'ancienne photo est toujours là.
 */
final class PizzaImageStorage
{
    public function __construct(
        #[Autowire('%kernel.project_dir%/public/uploads/pizzas')] private readonly string $directory,
        private readonly Filesystem $filesystem = new Filesystem(),
    ) {
    }

    /** Pose une nouvelle photo envoyée. Renvoie le nom de l'ancienne photo (à supprimer après le flush). */
    public function store(Pizza $pizza, UploadedFile $file): ?string
    {
        $filename = $this->newName($file->guessExtension() ?? 'jpg');
        $file->move($this->directory, $filename);

        return $this->swap($pizza, $filename);
    }

    /** Copie une image existante (ex. photos des données de démo). Renvoie le nom de l'ancienne photo. */
    public function storeCopy(Pizza $pizza, string $sourcePath): ?string
    {
        $filename = $this->newName(pathinfo($sourcePath, \PATHINFO_EXTENSION));
        $this->filesystem->copy($sourcePath, $this->directory.'/'.$filename);

        return $this->swap($pizza, $filename);
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
            $this->filesystem->remove($this->directory.'/'.basename($filename));
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

    private function newName(string $extension): string
    {
        return bin2hex(random_bytes(16)).'.'.strtolower($extension);
    }
}
