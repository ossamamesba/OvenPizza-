<?php

namespace App\Command;

use App\Repository\PizzaRepository;
use App\Service\PizzaImageStorage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Convertit les photos déjà en ligne au format optimisé (WebP grande + vignette).
 * Sans danger si relancée : les photos déjà optimisées sont ignorées. Lancée par deploy.sh.
 */
#[AsCommand(name: 'app:images:optimize', description: 'Optimise les photos des pizzas (WebP + vignette) qui ne le sont pas encore.')]
final class OptimizeImagesCommand extends Command
{
    public function __construct(
        private readonly PizzaRepository $pizzas,
        private readonly PizzaImageStorage $images,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $done = 0;

        foreach ($this->pizzas->findAll() as $pizza) {
            $current = $pizza->getImage();
            if (null === $current || $this->images->isOptimized($current) || !is_file($this->images->path($current))) {
                continue;
            }

            try {
                $previous = $this->images->storeCopy($pizza, $this->images->path($current));
                $this->em->flush();
                $this->images->deleteFile($previous); // seulement après l'enregistrement réussi
                ++$done;
            } catch (\RuntimeException $e) {
                $io->warning(sprintf('%s : %s', $pizza->getName(), $e->getMessage()));
            }
        }

        $io->success(0 === $done ? 'Toutes les photos sont déjà optimisées.' : sprintf('%d photo(s) optimisée(s).', $done));

        return Command::SUCCESS;
    }
}
