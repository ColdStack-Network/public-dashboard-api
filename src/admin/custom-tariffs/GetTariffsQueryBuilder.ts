import { Injectable } from "@nestjs/common";
import { SqlQueryBuilder } from "../types/SqlQueryBuilder";

@Injectable()
export class GetTariffsQueryBuilder extends SqlQueryBuilder {
  init() {
    const CONNECTIONS = {
      AUTHNODE: `'host=${process.env.AUTHNODE_DBLINK_HOST} port=${process.env.AUTHNODE_DBLINK_PORT} dbname=${process.env.AUTHNODE_DB_NAME} user=${process.env.AUTHNODE_DB_USERNAME} password=${process.env.AUTHNODE_DB_PASSWORD}'`,
    };

    this.query = `
      SELECT tariffs.id, tariffs.name, tariffs.storage_size "storageSize", tariffs.bandwidth, tariffs.cost_storage_gb "costStorageGb", tariffs.cost_bandwidth_gb "costBandwidthGb", tariffs.price, count(users) users
      FROM tariffs
      LEFT JOIN (
        SELECT id, "tariffId"
        FROM dblink(${CONNECTIONS.AUTHNODE}, 'select id, "tariffId" from users')
          AS users(id varchar, "tariffId" integer)
      ) users
      ON users."tariffId" = tariffs.id
    `;
  }

  build() {
    const result = `
      ${this.query}
      WHERE test = ${this.appConfigs.isDevEnv ? 'true' : 'false'}
      GROUP BY tariffs.id
      ORDER BY "${this.orderBy}" ${this.order}
      offset ${this.offset} limit ${this.limit};
    `;

    return result;
  }
}
