import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDefaultValueForTrialEnd1661503231111
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_plan ALTER COLUMN trial_end_at SET DEFAULT NOW() + interval '30' day`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_plan ALTER COLUMN trial_end_at SET DEFAULT NOW() + interval '14' day`,
    );
  }
}
