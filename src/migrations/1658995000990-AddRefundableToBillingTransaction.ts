import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRefundableToBillingTransaction1658995000990
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'refundable',
        type: 'boolean',
        isNullable: true,
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('billing_transactions', 'refundable');
  }
}
