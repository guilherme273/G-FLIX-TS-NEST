import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableUser1744844403972 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE user
            CHANGE COLUMN tipo type VARCHAR(255),
            ADD CONSTRAINT unique_email UNIQUE (email)
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE user
        CHANGE COLUMN type tipo VARCHAR(255),
        DROP INDEX unique_email
      `);
  }
}
