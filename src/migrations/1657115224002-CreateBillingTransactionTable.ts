import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBillingTransactionTable1657115224002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'billing_transactions',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          isPrimary: true,
          isUnique: true,
          generationStrategy: 'uuid',
          default: `gen_random_uuid()`,
        },
        {
          name: 'user_id',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'card_id',
          type: 'varchar',
          isNullable: true,
        },
        {
          name: 'user_plan_id',
          type: 'integer',
          isNullable: true,
        },
        {
          name: 'payment_provider',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'payment_payload',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'errors',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'succeeded',
          type: 'boolean',
          isNullable: false,
          default: false,
        },
        {
          name: 'created_at',
          type: 'timestamptz',
          default: 'NOW()',
        },
      ],
    });

    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('billing_transactions');
  }
}
