import { MigrationInterface, QueryRunner } from 'typeorm';

export class XmasGifts1640253546474 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE xmas_gifts (
        "userId" varchar NOT NULL PRIMARY KEY,
        "userPublicKey" varchar NOT NULL,
        "isXmasGiftGiven" boolean NOT NULL,
        "amount" numeric,
        "whenXmasGiftWereGiven" timestamptz DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('xmas_gifts');
  }
}
