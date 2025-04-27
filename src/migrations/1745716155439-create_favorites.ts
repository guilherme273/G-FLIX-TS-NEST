import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavorites1745716155439 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE favorites (
            id INT NOT NULL AUTO_INCREMENT,
            id_user INT NOT NULL,
            id_movie INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (id_user) REFERENCES user(id) ON DELETE CASCADE,
            FOREIGN KEY (id_movie) REFERENCES movie(id) ON DELETE CASCADE
    );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS favorites;`);
  }
}
