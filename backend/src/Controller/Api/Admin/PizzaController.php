<?php

namespace App\Controller\Api\Admin;

use App\Entity\Pizza;
use App\Http\JsonPayloadMapper;
use App\Repository\PackRepository;
use App\Repository\PizzaRepository;
use App\Service\PizzaImageStorage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints\Image;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Exception\ValidationFailedException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/** Gestion du menu par le patron (dashboard web + application mobile). */
#[Route('/api/admin/pizzas', name: 'api_admin_pizza_')]
final class PizzaController extends AbstractController
{
    private const READ = ['groups' => ['pizza:read', 'pizza:admin']];
    private const WRITE = ['pizza:write'];

    public function __construct(
        private readonly JsonPayloadMapper $mapper,
        private readonly EntityManagerInterface $em,
        private readonly PizzaImageStorage $images,
        private readonly PackRepository $packs,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(PizzaRepository $pizzas): JsonResponse
    {
        return $this->json($pizzas->findBy([], ['name' => 'ASC']), context: self::READ);
    }

    #[Route('/{id<\d+>}', name: 'show', methods: ['GET'])]
    public function show(Pizza $pizza): JsonResponse
    {
        return $this->json($pizza, context: self::READ);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $pizza = $this->mapper->map($request, Pizza::class, self::WRITE);
        $this->applyPack($pizza, $request);

        $this->em->persist($pizza);
        $this->em->flush();

        return $this->json($pizza, Response::HTTP_CREATED, context: self::READ);
    }

    /** PUT : modification complète. PATCH : modification partielle (ex. {"isAvailable": false}). */
    #[Route('/{id<\d+>}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Pizza $pizza, Request $request): JsonResponse
    {
        $this->mapper->map($request, $pizza, self::WRITE);
        $this->applyPack($pizza, $request);
        $this->em->flush();

        return $this->json($pizza, context: self::READ);
    }

    #[Route('/{id<\d+>}', name: 'delete', methods: ['DELETE'])]
    public function delete(Pizza $pizza): Response
    {
        $this->images->remove($pizza);
        $this->em->remove($pizza);
        $this->em->flush();

        return new Response(status: Response::HTTP_NO_CONTENT);
    }

    /** Envoi de photo : multipart/form-data avec le champ « image » (JPG, PNG ou WebP, 5 Mo max). */
    #[Route('/{id<\d+>}/image', name: 'upload_image', methods: ['POST'])]
    public function uploadImage(Pizza $pizza, Request $request, ValidatorInterface $validator): JsonResponse
    {
        $file = $request->files->get('image');
        if (!$file instanceof UploadedFile) {
            throw new BadRequestHttpException('Aucun fichier reçu (champ « image »).');
        }

        $errors = $validator->validate($file, new Image(
            maxSize: '5M',
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            mimeTypesMessage: 'Formats acceptés : JPG, PNG ou WebP.',
            maxSizeMessage: 'Image trop lourde (5 Mo maximum).',
        ));
        if (\count($errors) > 0) {
            $violations = new ConstraintViolationList();
            foreach ($errors as $error) {
                $violations->add(new ConstraintViolation($error->getMessage(), null, [], null, 'image', null));
            }
            throw new ValidationFailedException($file, $violations);
        }

        $this->images->replace($pizza, $file);
        $this->em->flush();

        return $this->json($pizza, context: self::READ);
    }

    #[Route('/{id<\d+>}/image', name: 'delete_image', methods: ['DELETE'])]
    public function deleteImage(Pizza $pizza): JsonResponse
    {
        $this->images->remove($pizza);
        $this->em->flush();

        return $this->json($pizza, context: self::READ);
    }

    /** Pack de la pizza : {"packId": 2} pour l'associer, {"packId": null} pour la retirer du pack. */
    private function applyPack(Pizza $pizza, Request $request): void
    {
        $payload = json_decode($request->getContent(), true);
        if (!\is_array($payload) || !\array_key_exists('packId', $payload)) {
            return;
        }

        $pack = null === $payload['packId'] ? null : $this->packs->find((int) $payload['packId']);
        if (null !== $payload['packId'] && null === $pack) {
            throw new ValidationFailedException($pizza, new ConstraintViolationList([
                new ConstraintViolation('Pack introuvable.', null, [], $pizza, 'packId', $payload['packId']),
            ]));
        }
        $pizza->setPack($pack);
    }
}
