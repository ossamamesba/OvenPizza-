<?php

namespace App\Service;

use App\Entity\Pizza;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Enregistre les photos des pizzas dans public/uploads/pizzas (servies par Nginx sur /uploads/pizzas/…).
 */
final class PizzaImageStorage
{
    public function __construct(
        #[Autowire('%kernel.project_dir%/public/uploads/pizzas')] private readonly string $directory,
        private readonly Filesystem $filesystem = new Filesystem(),
    ) {
    }

    /** Remplace la photo actuelle (l'ancien fichier est supprimé). */
    public function replace(Pizza $pizza, UploadedFile $file): void
    {
        $filename = bin2hex(random_bytes(16)).'.'.($file->guessExtension() ?? 'jpg');
        $file->move($this->directory, $filename);

        $this->remove($pizza);
        $pizza->setImage($filename);
    }

    /** Copie une image existante (ex. photos des données de démo) comme photo de la pizza. */
    public function storeCopy(Pizza $pizza, string $sourcePath): void
    {
        $filename = bin2hex(random_bytes(16)).'.'.strtolower(pathinfo($sourcePath, \PATHINFO_EXTENSION));
        $this->filesystem->copy($sourcePath, $this->directory.'/'.$filename);

        $this->remove($pizza);
        $pizza->setImage($filename);
    }

    /** Supprime toutes les photos (utilisé uniquement par les données de démo, qui repartent de zéro). */
    public function removeAll(): void
    {
        $this->filesystem->remove($this->directory);
    }

    public function remove(Pizza $pizza): void
    {
        if (null !== $pizza->getImage()) {
            // basename() : on ne supprime jamais en dehors du dossier des photos.
            $this->filesystem->remove($this->directory.'/'.basename($pizza->getImage()));
            $pizza->setImage(null);
        }
    }
}
