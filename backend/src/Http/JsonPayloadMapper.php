<?php

namespace App\Http;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Serializer\Exception\NotEncodableValueException;
use Symfony\Component\Serializer\Exception\PartialDenormalizationException;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\DenormalizerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Exception\ValidationFailedException;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Transforme le JSON d'une requête en objet, puis le valide.
 * Utilisé par tous les contrôleurs de l'API pour avoir les mêmes erreurs partout.
 */
final class JsonPayloadMapper
{
    public function __construct(
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
    ) {
    }

    /**
     * @template T of object
     *
     * @param class-string<T>|T $target classe à créer, ou objet existant à mettre à jour
     * @param list<string>      $groups groupes de sérialisation autorisés en écriture
     *
     * @return T
     */
    public function map(Request $request, string|object $target, array $groups): object
    {
        $context = [
            AbstractNormalizer::GROUPS => $groups,
            DenormalizerInterface::COLLECT_DENORMALIZATION_ERRORS => true,
        ];
        if (\is_object($target)) {
            $context[AbstractNormalizer::OBJECT_TO_POPULATE] = $target;
        }
        $class = \is_object($target) ? $target::class : $target;

        try {
            $object = $this->serializer->deserialize($request->getContent(), $class, 'json', $context);
        } catch (NotEncodableValueException) {
            throw new BadRequestHttpException('Le corps de la requête doit être un JSON valide.');
        } catch (PartialDenormalizationException $e) {
            $violations = new ConstraintViolationList();
            foreach ($e->getErrors() as $error) {
                $violations->add(new ConstraintViolation(
                    'Type invalide (attendu : '.implode(', ', $error->getExpectedTypes() ?? []).').',
                    null, [], null, (string) $error->getPath(), $error->getCurrentType(),
                ));
            }
            throw new ValidationFailedException($e->getData(), $violations);
        }

        $violations = $this->validator->validate($object);
        if (\count($violations) > 0) {
            throw new ValidationFailedException($object, $violations);
        }

        return $object;
    }
}
