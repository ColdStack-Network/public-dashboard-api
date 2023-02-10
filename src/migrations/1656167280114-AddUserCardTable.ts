import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddUserCardTable1656167280114 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'user_cards',
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
          name: 'userId',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'brand',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'country',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'expMonth',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'expYear',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'funding',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'last4',
          type: 'varchar',
          isNullable: false,
        },
        {
          name: 'network',
          type: 'varchar',
          isNullable: false,
        },
      ],
    });

    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_cards');
  }
}
