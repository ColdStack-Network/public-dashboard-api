import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAmounToBillingTransaction1657731365685
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'amount',
        type: 'numeric(10,3)',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('billing_transactions', 'amount');
  }
}
