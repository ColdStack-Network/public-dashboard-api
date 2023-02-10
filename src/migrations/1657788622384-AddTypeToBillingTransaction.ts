import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import { BillingTransactionType } from '../billing-api/types/billing-transaction-type.enum';

export class AddTypeToBillingTransaction1657788622384
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        isNullable: false,
        default: `'${BillingTransactionType.CARD_VALIDATION}'`,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('billing_transactions', 'type');
  }
}
