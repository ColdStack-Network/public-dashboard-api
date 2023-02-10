import { MigrationInterface, QueryRunner } from 'typeorm';

export class Notifications1629134276130 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE notifications (
        id SERIAL,
        "createdAt" timestamptz NOT NULL DEFAULT NOW(),
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "readAt" timestamptz,
        "userId" varchar NOT NULL
      );

      CREATE INDEX notifications_created_at ON notifications ("createdAt");
      CREATE INDEX notifications_read_at ON notifications ("readAt");
      CREATE INDEX notifications_user_id ON notifications ("userId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE notifications;');
  }
}
