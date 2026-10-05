<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261005190151 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Téléphones du patron pour les notifications de nouvelles réservations';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE push_token (id INT AUTO_INCREMENT NOT NULL, token VARCHAR(255) NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_51BC13815F37A13B (token), INDEX IDX_51BC1381A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE push_token ADD CONSTRAINT FK_51BC1381A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE push_token DROP FOREIGN KEY FK_51BC1381A76ED395');
        $this->addSql('DROP TABLE push_token');
    }
}
