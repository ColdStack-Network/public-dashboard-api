import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTariffsTable1655840513033 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tariffs ADD product_id varchar;
      ALTER TABLE tariffs ADD price_id varchar;
      ALTER TABLE tariffs ADD test BOOLEAN NOT NULL DEFAULT FALSE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tariffs DROP COLUMN product_id;
      ALTER TABLE tariffs DROP COLUMN price_id;
      ALTER TABLE tariffs DROP COLUMN test;
    `);
  }
}
