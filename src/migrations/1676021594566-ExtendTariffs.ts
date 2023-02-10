import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ExtendTariffs1676021594566 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tariffs',
      new TableColumn({
        name: 'trial_days',
        type: 'integer',
        isNullable: false,
        default: 30,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tariffs', 'trial_days');
  }
}
