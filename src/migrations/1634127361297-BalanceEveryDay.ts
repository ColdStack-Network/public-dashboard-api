import { MigrationInterface, QueryRunner } from 'typeorm';

export class BalanceEveryDay1634127361297 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE day_balance (
          address bytea NOT NULL,
          balance numeric NOT NULL,
          date date DEFAULT NOW(),
          PRIMARY KEY (address, date)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE day_balance;
    `);
  }
}
