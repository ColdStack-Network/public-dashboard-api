// 1655743133013-TariffsTable

import { MigrationInterface, QueryRunner } from 'typeorm';

export class TariffsTable1655743133013 implements MigrationInterface {
  name = 'TariffsTable1655743133013';

  async up(qr: QueryRunner) {
    await qr.query(`
      CREATE TABLE tariffs (
        id int4 NOT NULL,
        name varchar NOT NULL,
        storage_size int8 NOT NULL,
        bandwidth int8 NOT NULL,
        cost_storage_gb numeric(10,3) NOT NULL,
        cost_bandwidth_gb numeric(10,3) NOT NULL,
        description varchar NOT NULL,
        price numeric(10,3) NOT NULL,
        CONSTRAINT tariffs_pk PRIMARY KEY (id)
      );
    `);
  }

  async down(qr: QueryRunner) {
    await qr.query(`DROP TABLE tariffs;`);
  }
}
