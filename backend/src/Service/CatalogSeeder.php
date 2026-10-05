<?php

namespace App\Service;

use App\Entity\Pack;
use App\Entity\Pizza;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Catalogue de départ du traiteur (flyers « Pack Classic » et « Pack Premium ») avec les photos de fixtures/pizzas.
 * Utilisé par la commande app:catalog:init (mise en ligne) et par les données de démo (AppFixtures).
 * Ensuite, tout se modifie depuis le dashboard ou l'app du patron.
 */
final class CatalogSeeder
{
    /** [nom, prix par pizza (DH), description, pizzas : [nom, description, photo dans fixtures/pizzas/]] */
    private const PACKS = [
        ['Pack Classic', 100, 'Nos grands classiques, parfaits pour tous les invités.', [
            ['Margherita', 'Sauce tomate, mozzarella fior di latte, basilic frais, huile d’olive.', 'margherita.jpg'],
            ['Pepperoni', 'Sauce tomate, mozzarella, pepperoni de bœuf.', 'pepperoni.jpg'],
            ['Chèvre Miel', 'Crème, mozzarella, fromage de chèvre, miel, noix, thym.', 'chevre-miel.jpg'],
            ['Nutella Pistache', 'Pizza dessert : pâte à tartiner Nutella, éclats de pistache.', 'nutella-pistache.jpg'],
        ]],
        ['Pack Premium', 150, 'Des recettes gourmandes aux produits d’exception.', [
            ['Quatre Fromages', 'Mozzarella, gorgonzola, emmental, parmesan.', 'quatre-fromages.jpg'],
            ['Truffe', 'Crème de truffe noire, mozzarella, roquette, jeunes pousses.', 'truffe.jpg'],
            ['Burrata', 'Sauce tomate, burrata crémeuse, tomates cerises, roquette, parmesan.', 'burrata.jpg'],
            ['Saumon', 'Crème, mozzarella, saumon fumé, câpres, oignon rouge, aneth.', 'saumon.jpg'],
        ]],
    ];

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly PizzaImageStorage $images,
        #[Autowire('%kernel.project_dir%/fixtures/pizzas')] private readonly string $photosDir,
    ) {
    }

    /**
     * Ajoute les packs et leurs pizzas (persist, sans flush).
     *
     * @return array{packs: array<string, Pack>, pizzas: array<string, Pizza>} rangés par nom
     */
    public function seed(): array
    {
        $packs = [];
        $pizzas = [];
        foreach (self::PACKS as $position => [$packName, $price, $packDescription, $packPizzas]) {
            $pack = (new Pack())->setName($packName)->setPrice($price)->setDescription($packDescription)->setPosition($position);
            $this->em->persist($pack);
            $packs[$packName] = $pack;

            foreach ($packPizzas as [$name, $description, $photo]) {
                $pizza = (new Pizza())->setName($name)->setDescription($description)->setPack($pack);
                $this->images->storeCopy($pizza, $this->photosDir.'/'.$photo); // pizza neuve : pas d'ancienne photo
                $this->em->persist($pizza);
                $pizzas[$name] = $pizza;
            }
        }

        return ['packs' => $packs, 'pizzas' => $pizzas];
    }
}
