import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateStripeEventTable1656082502807 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'stripe_events',
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
          name: 'createdAt',
          type: 'timestamptz',
          default: 'NOW()',
        },
        {
          name: 'event',
          type: 'jsonb',
        },
      ],
    });

    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('stripe_events');
  }
}
