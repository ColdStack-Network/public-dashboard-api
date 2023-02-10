import { MigrationInterface, QueryRunner } from 'typeorm';

export class enableNullableEmailInTicket1634633640834
  implements MigrationInterface
{
  name = 'enableNullableEmailInTicket1634633640834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE support_tickets ALTER COLUMN "email" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE support_tickets ALTER COLUMN "email" SET NOT NULL;
    `);
  }
}
