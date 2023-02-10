import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTrialToUserPlan1657787054713 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user_plan',
      new TableColumn({
        name: 'trial_start_at',
        type: 'timestamptz',
        isNullable: false,
        default: 'NOW()',
      }),
    );

    await queryRunner.addColumn(
      'user_plan',
      new TableColumn({
        name: 'trial_end_at',
        type: 'timestamptz',
        isNullable: false,
        default: `NOW() + interval '14' day`,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_plan', 'trial_start_at');
    await queryRunner.dropColumn('user_plan', 'trial_end_at');
  }
}
