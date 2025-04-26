import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1744774325666 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE \`user\` (
            \`id\` INT NOT NULL AUTO_INCREMENT,
            \`name\` VARCHAR(255) NOT NULL,
            \`email\` VARCHAR(255) NOT NULL,
            \`password\` VARCHAR(255) NOT NULL,
            \`tipo\` INT NOT NULL DEFAULT 0,
            \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`)
          );          
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`user\`;`);
  }
}
