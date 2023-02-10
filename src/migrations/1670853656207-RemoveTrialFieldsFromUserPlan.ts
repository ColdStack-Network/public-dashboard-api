import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTrialFieldsFromUserPlan1670853656207
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_plan DROP COLUMN trial_start_at;`,
    );
    await queryRunner.query(`ALTER TABLE user_plan DROP COLUMN trial_end_at;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_plan DROP COLUMN trial_start_at;`,
    );
    await queryRunner.query(`ALTER TABLE user_plan DROP COLUMN trial_end_at;`);
    await queryRunner.query(`UPDATE user_plan SET trial_end_at = end_at;`);
  }
}
