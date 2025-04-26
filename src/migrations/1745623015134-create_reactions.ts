import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReactions1745623015134 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE reactions (
            id INT NOT NULL AUTO_INCREMENT,
            id_user INT NOT NULL,
            id_reactions_type INT NOT NULL,
            id_movie INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (id_user) REFERENCES user(id) ON DELETE CASCADE,
            FOREIGN KEY (id_reactions_type) REFERENCES reactions_types(id) ON DELETE CASCADE,
            FOREIGN KEY (id_movie) REFERENCES movie(id) ON DELETE CASCADE
    );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE IF EXISTS reactions;
          `);
  }
}
