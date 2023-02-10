import { MigrationInterface, QueryRunner } from 'typeorm';

export class TariffsHistory1655752445840 implements MigrationInterface {
  name = 'TariffsHistory1655752445840';

  async up(qr: QueryRunner) {
    await qr.query(`
      CREATE TABLE user_plan(
        id SERIAL NOT NULL,
        user_id varchar NOT NULL,
        tariff_id int4 NOT NULL,
        created_at timestamptz NOT NULL,
        end_at timestamptz NOT NULL,
        active bool NOT NULL,
        CONSTRAINT "fk_user_plan_tariff" FOREIGN KEY ("tariff_id") REFERENCES "tariffs"(id),
        CONSTRAINT pk_user_plan PRIMARY KEY(id)
      )
    `);
  }

  async down(qr: QueryRunner) {
    await qr.query(`DROP TABLE user_plan`);
  }
}
