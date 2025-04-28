import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableUser1744844403972 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE user
            CHANGE COLUMN tipo type INT NOT NULL,
            ADD CONSTRAINT unique_email UNIQUE (email)
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE user
        CHANGE COLUMN type tipo INT NOT NULL,
        DROP INDEX unique_email
      `);
  }
}
