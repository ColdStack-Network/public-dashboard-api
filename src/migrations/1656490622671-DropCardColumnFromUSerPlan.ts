import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCardColumnFromUSerPlan1656490622671
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_plan DROP COLUMN cards;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_plan ADD COLUMN IF NOT EXISTS cards jsonb;
    `);
  }
}
