<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Crée le compte du patron, ou change son mot de passe s'il existe déjà.
 * Usage : php bin/console app:create-admin patron@ovenspizza.ma
 */
#[AsCommand(name: 'app:create-admin', description: 'Crée un compte administrateur (ou réinitialise son mot de passe).')]
final class CreateAdminCommand extends Command
{
    private const MIN_PASSWORD_LENGTH = 8;

    public function __construct(
        private readonly UserRepository $users,
        private readonly UserPasswordHasherInterface $hasher,
        private readonly ValidatorInterface $validator,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Email de connexion');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = mb_strtolower(trim((string) $input->getArgument('email')));

        $user = $this->users->findOneBy(['email' => $email]);
        $isNew = null === $user;
        $user ??= (new User())->setEmail($email);

        $password = (string) $io->askHidden('Mot de passe (au moins '.self::MIN_PASSWORD_LENGTH.' caractères)');
        if (mb_strlen($password) < self::MIN_PASSWORD_LENGTH) {
            $io->error('Mot de passe trop court.');

            return Command::FAILURE;
        }
        if ($password !== $io->askHidden('Confirmez le mot de passe')) {
            $io->error('Les mots de passe ne correspondent pas.');

            return Command::FAILURE;
        }

        $user->setRoles(['ROLE_ADMIN'])->setPassword($this->hasher->hashPassword($user, $password));

        $violations = $this->validator->validate($user);
        if (\count($violations) > 0) {
            $io->error((string) $violations);

            return Command::FAILURE;
        }

        $this->em->persist($user);
        $this->em->flush();

        $io->success($isNew ? "Compte admin créé : $email" : "Mot de passe mis à jour : $email");

        return Command::SUCCESS;
    }
}
