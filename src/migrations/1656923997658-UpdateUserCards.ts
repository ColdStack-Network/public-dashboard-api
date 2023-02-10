import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateUserCards1656923997658 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user_cards',
      new TableColumn({
        name: 'default',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'user_cards',
      new TableColumn({
        name: 'deleted',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );

    await queryRunner.query(`
      ALTER TABLE user_cards ALTER COLUMN brand DROP NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN country DROP NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN "expMonth" DROP NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN "expYear" DROP NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN funding DROP NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN last4 DROP NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN network DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_cards', 'default');
    await queryRunner.dropColumn('user_cards', 'deleted');

    await queryRunner.query(`
      ALTER TABLE user_cards ALTER COLUMN brand SET NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN country SET NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN "expMonth" SET NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN "expYear" SET NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN funding SET NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN last4 SET NOT NULL;
      ALTER TABLE user_cards ALTER COLUMN network SET NOT NULL;
    `);
  }
}
