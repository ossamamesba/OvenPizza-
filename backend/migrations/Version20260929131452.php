<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260929131452 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Traiteur : packs (prix), pizzas rattachées à un pack, réservations avec pizzas/quantités, tranche d’invités, ville et adresse';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE pack (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(100) NOT NULL, description LONGTEXT DEFAULT NULL, price NUMERIC(8, 2) NOT NULL, max_varieties SMALLINT NOT NULL, is_active TINYINT NOT NULL, position SMALLINT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE reservation_item (id INT AUTO_INCREMENT NOT NULL, pizza_name VARCHAR(100) NOT NULL, quantity SMALLINT NOT NULL, reservation_id INT NOT NULL, pizza_id INT DEFAULT NULL, INDEX IDX_922E876B83297E7 (reservation_id), INDEX IDX_922E876D41D1D42 (pizza_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE reservation_item ADD CONSTRAINT FK_922E876B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE reservation_item ADD CONSTRAINT FK_922E876D41D1D42 FOREIGN KEY (pizza_id) REFERENCES pizza (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE pizza ADD pack_id INT DEFAULT NULL, DROP price');
        $this->addSql('ALTER TABLE pizza ADD CONSTRAINT FK_CFDD826F1919B217 FOREIGN KEY (pack_id) REFERENCES pack (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_CFDD826F1919B217 ON pizza (pack_id)');
        $this->addSql('ALTER TABLE reservation ADD guest_range VARCHAR(10) DEFAULT NULL, ADD city VARCHAR(20) DEFAULT NULL, ADD address VARCHAR(255) DEFAULT NULL, ADD notes LONGTEXT DEFAULT NULL, ADD pack_name VARCHAR(100) DEFAULT NULL, ADD pack_price NUMERIC(8, 2) DEFAULT NULL, ADD pack_id INT DEFAULT NULL, CHANGE number_of_people number_of_people SMALLINT DEFAULT NULL');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT FK_42C849551919B217 FOREIGN KEY (pack_id) REFERENCES pack (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_42C849551919B217 ON reservation (pack_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE reservation_item DROP FOREIGN KEY FK_922E876B83297E7');
        $this->addSql('ALTER TABLE reservation_item DROP FOREIGN KEY FK_922E876D41D1D42');
        $this->addSql('DROP TABLE pack');
        $this->addSql('DROP TABLE reservation_item');
        $this->addSql('ALTER TABLE pizza DROP FOREIGN KEY FK_CFDD826F1919B217');
        $this->addSql('DROP INDEX IDX_CFDD826F1919B217 ON pizza');
        $this->addSql('ALTER TABLE pizza ADD price NUMERIC(8, 2) NOT NULL, DROP pack_id');
        $this->addSql('ALTER TABLE reservation DROP FOREIGN KEY FK_42C849551919B217');
        $this->addSql('DROP INDEX IDX_42C849551919B217 ON reservation');
        $this->addSql('ALTER TABLE reservation DROP guest_range, DROP city, DROP address, DROP notes, DROP pack_name, DROP pack_price, DROP pack_id, CHANGE number_of_people number_of_people SMALLINT NOT NULL');
    }
}
