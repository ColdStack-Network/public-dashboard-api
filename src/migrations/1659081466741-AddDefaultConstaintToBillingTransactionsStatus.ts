import { MigrationInterface, QueryRunner } from 'typeorm';
import { BillingTransactionStatus } from '../billing-api/types/billing-transaction-status.enum';

export class AddDefaultConstaintToBillingTransactionsStatus1659081466741
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE billing_transactions ALTER COLUMN status SET DEFAULT '${BillingTransactionStatus.PENDING}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE billing_transactions ALTER COLUMN status DROP DEFAULT`,
    );
  }
}
