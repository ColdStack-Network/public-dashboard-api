import { MigrationInterface, QueryRunner } from 'typeorm';

export class EthereumTransactionsCache1632866885877
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE ethereum_transactions_cache (
        eth_txhash character(66) NOT NULL,
        data jsonb NOT NULL,
        PRIMARY KEY (eth_txhash)
      );
      CREATE TABLE ethereum_blocks_cache (
        block_number integer NOT NULL,
        data jsonb NOT NULL,
        PRIMARY KEY (block_number)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE ethereum_transactions_cache;
      DROP TABLE ethereum_blocks_cache;
    `);
  }
}
