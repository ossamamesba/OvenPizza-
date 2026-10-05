<?php

namespace App\Command;

use App\Repository\PackRepository;
use App\Service\CatalogSeeder;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Mise en ligne : installe les packs et pizzas de départ (avec photos) si le catalogue est vide.
 * Sans danger si relancée : ne touche jamais à un catalogue existant.
 * Usage : php bin/console app:catalog:init
 */
#[AsCommand(name: 'app:catalog:init', description: 'Installe le catalogue de départ (packs + pizzas) si aucun pack n\'existe.')]
final class InitCatalogCommand extends Command
{
    public function __construct(
        private readonly PackRepository $packs,
        private readonly CatalogSeeder $catalog,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if ($this->packs->count() > 0) {
            $io->note('Le catalogue contient déjà des packs : rien à faire.');

            return Command::SUCCESS;
        }

        ['packs' => $packs, 'pizzas' => $pizzas] = $this->catalog->seed();
        $this->em->flush();

        $io->success(sprintf('%d packs et %d pizzas installés.', count($packs), count($pizzas)));

        return Command::SUCCESS;
    }
}
