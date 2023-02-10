import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDblinkExtension1674559934588 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS dblink;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS dblink;');
  }
}
