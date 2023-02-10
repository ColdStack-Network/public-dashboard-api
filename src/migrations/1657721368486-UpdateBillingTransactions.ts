import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import { BillingTransactionStatus } from '../billing-api/types/billing-transaction-status.enum';

export class UpdateBillingTransactions1657721368486
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.query(
      `UPDATE billing_transactions SET status = '${BillingTransactionStatus.SUCCESS}' WHERE succeeded = true;`,
    );
    await queryRunner.query(
      `UPDATE billing_transactions SET status = '${BillingTransactionStatus.PENDING}' WHERE succeeded = false;`,
    );

    await queryRunner.dropColumn('billing_transactions', 'succeeded');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'succeeded',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );

    await queryRunner.query(
      `UPDATE billing_transactions SET succeeded = true WHERE status = '${BillingTransactionStatus.SUCCESS}';`,
    );
    await queryRunner.query(
      `UPDATE billing_transactions SET succeeded = false WHERE status = '${BillingTransactionStatus.PENDING}';`,
    );

    await queryRunner.dropColumn('billing_transactions', 'status');
  }
}
