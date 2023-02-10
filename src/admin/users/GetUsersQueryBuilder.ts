import { SqlQueryBuilder } from "../types/SqlQueryBuilder";


export class GetUsersQueryBuilder extends SqlQueryBuilder {
  init() {
    const CONNECTIONS = {
      AUTHNODE: `'host=${process.env.AUTHNODE_DBLINK_HOST} port=${process.env.AUTHNODE_DBLINK_PORT} dbname=${process.env.AUTHNODE_DB_NAME} user=${process.env.AUTHNODE_DB_USERNAME} password=${process.env.AUTHNODE_DB_PASSWORD}'`,
      FILENODE: `'host=${process.env.FILENODE_DBLINK_HOST} port=${process.env.FILENODE_DBLINK_PORT} dbname=${process.env.FILENODE_DB_NAME} user=${process.env.FILENODE_DB_USERNAME} password=${process.env.FILENODE_DB_PASSWORD}'`,
      DASHBOARD_API: `'host=${process.env.DASHBOARD_API_DBLINK_HOST} port=${process.env.DASHBOARD_API_DBLINK_PORT} dbname=${process.env.DASHBOARD_API_DB_NAME} user=${process.env.DASHBOARD_API_DB_USERNAME} password=${process.env.DASHBOARD_API_DB_PASSWORD}'`,
    };

    this.query = `
      SELECT users.id, users.name, users.last_name as "lastName", users.email, users."createdAt", users."tariffId", users.status, users.company_id as "companyId",
        count(support_tickets) AS "openTicketsCount", COALESCE(objects."filesCount", 0) AS "filesCount", COALESCE(objects."filesSize", 0) AS "filesSize"
      FROM dblink(${CONNECTIONS.AUTHNODE}, 'select id, name, last_name, email, "createdAt", "tariffId", status, company_id from users')
        AS users(id varchar, name varchar, last_name varchar, email varchar, "createdAt" timestamp, "tariffId" integer, status varchar, company_id varchar)
      LEFT JOIN (
        SELECT buckets."ownerUserId", count(objects) as "filesCount", sum(objects.size) as "filesSize"
        FROM dblink(${CONNECTIONS.FILENODE}, 'select name, "ownerUserId" from buckets')
          AS buckets(name varchar, "ownerUserId" varchar)
        INNER JOIN dblink(${CONNECTIONS.FILENODE}, 'select id, bucket, size, "filename" from objects')
          AS objects(id varchar, bucket varchar, size bigint, "filename" varchar)
        ON buckets.name = objects.bucket
        GROUP BY buckets."ownerUserId"
      ) objects
      ON users.id = objects."ownerUserId"
      LEFT JOIN (
        SELECT support_tickets.id, support_tickets."userId", support_tickets.status
        FROM dblink(${CONNECTIONS.DASHBOARD_API}, 'select id, "userId", status from support_tickets')
        AS support_tickets(id varchar, "userId" varchar, status varchar)
        WHERE support_tickets.status = 'open'
      ) support_tickets
      ON support_tickets."userId" = users.id
    `;
  }

  build() {
    const result = `
      ${this.query}
      ${this.whereQuery.length ? `WHERE ${this.whereQuery.join(' ')}` : ''}
      GROUP BY users.id, users.name, users.last_name, users.email, users."createdAt", users."tariffId", users.status, users.company_id, objects."filesCount", objects."filesSize"
      ORDER BY ${
        ['filesCount', 'filesSize', 'openTicketsCount'].includes(this.orderBy)
          ? ''
          : 'users.'
      }"${this.orderBy}" ${this.order}
      offset ${this.offset} limit ${this.limit};
    `;

    return result;
  }
}
