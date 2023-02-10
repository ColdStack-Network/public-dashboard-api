import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDefaultContstraintForUserPlan1664185727984
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_plan ALTER COLUMN trial_start_at DROP DEFAULT;
      ALTER TABLE user_plan ALTER COLUMN trial_start_at DROP NOT NULL;

      ALTER TABLE user_plan ALTER COLUMN trial_end_at DROP DEFAULT;
      ALTER TABLE user_plan ALTER COLUMN trial_end_at DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_plan ALTER COLUMN trial_start_at SET DEFAULT NOW();
      ALTER TABLE user_plan ALTER COLUMN trial_start_at SET NOT NULL;

      ALTER TABLE user_plan ALTER COLUMN trial_end_at SET DEFAULT NOW() + interval '30' day;
      ALTER TABLE user_plan ALTER COLUMN trial_end_at SET NOT NULL;
    `);
  }
}
