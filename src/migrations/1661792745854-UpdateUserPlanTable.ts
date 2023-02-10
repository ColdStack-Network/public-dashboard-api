import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserPlanTable1661792745854 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_plan ALTER COLUMN user_id SET DATA TYPE UUID USING (uuid_generate_v4());
      ALTER TABLE user_plan ALTER COLUMN user_id SET DEFAULT uuid_generate_v4();
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX ON user_plan (user_id) WHERE active;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_plan ALTER COLUMN user_id TYPE VARCHAR;
      ALTER TABLE user_plan ALTER COLUMN user_id DROP DEFAULT;
    `);

    await queryRunner.query(`DROP INDEX IF EXISTS user_plan`);
  }
}
