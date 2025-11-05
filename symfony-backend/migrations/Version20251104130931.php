<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251104130931 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE user_subject (user_id INT NOT NULL, subject_id INT NOT NULL, PRIMARY KEY(user_id, subject_id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_A3C32070A76ED395 ON user_subject (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_A3C3207023EDC87 ON user_subject (subject_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_subject ADD CONSTRAINT FK_A3C32070A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_subject ADD CONSTRAINT FK_A3C3207023EDC87 FOREIGN KEY (subject_id) REFERENCES subject (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_subject DROP CONSTRAINT FK_A3C32070A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_subject DROP CONSTRAINT FK_A3C3207023EDC87
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE user_subject
        SQL);
    }
}
