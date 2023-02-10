import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPlansCardsColumn1656424683623
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_plan ADD COLUMN IF NOT EXISTS cards jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_plan DROP COLUMN cards;
    `);
  }
}
