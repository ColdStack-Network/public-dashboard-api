import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTariffIdToBillingTransaction1663776259275
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE billing_transactions ADD COLUMN IF NOT EXISTS tariff_id int4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE billing_transactions DROP COLUMN tariff_id;
    `);
  }
}
