import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createTicketTable1631713816374 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'support_tickets',
      columns: [
        {
          name: 'id',
          type: 'varchar',
          isPrimary: true,
          isUnique: true,
          generationStrategy: 'uuid',
          default: `gen_random_uuid()`,
        },
        { name: 'userId', type: 'varchar' },
        { name: 'email', type: 'varchar' },
        { name: 'status', type: 'varchar', default: "'open'" },
        { name: 'topic', type: 'varchar' },
        { name: 'subTopic', type: 'varchar' },
        { name: 'subject', type: 'varchar' },
        { name: 'ticketDetails', type: 'varchar' },
        { name: 'file', type: 'varchar', isArray: true, isNullable: true },
        { name: 'unreadMessage', type: 'boolean', default: false },
        { name: 'createdAt', type: 'timestamptz', default: 'NOW()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'NOW()' },
      ],
    });
    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('support_tickets');
  }
}
