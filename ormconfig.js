// eslint-disable-next-line @typescript-eslint/no-var-requires
const vault = require('./vault');

module.exports = new Promise(async (resolve, reject) => {
  await vault();

  resolve([
    {
      name: 'default',
      type: 'postgres',
      host: process.env.DASHBOARD_API_DB_HOST,
      port: +process.env.DASHBOARD_API_DB_PORT,
      username: process.env.DASHBOARD_API_DB_USERNAME,
      password: process.env.DASHBOARD_API_DB_PASSWORD,
      database: process.env.DASHBOARD_API_DB_NAME,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/migrations/*.js'],
      migrationsTableName: 'migrations',
      migrationsRun: true,
      logging: process.env.DB_LOGGING === 'true',
      cli: {
        migrationsDir: 'src/migrations',
      },
    },
    {
      name: 'billing_db',
      type: 'postgres',
      host: process.env.BILLING_DB_HOST,
      port: +process.env.BILLING_DB_PORT,
      username: process.env.BILLING_DB_USERNAME,
      password: process.env.BILLING_DB_PASSWORD,
      database: process.env.BILLING_DB_NAME,
      entities: ['dist/**/*.billing-entity.js'],
      logging: process.env.DB_LOGGING === 'true',
    },
    {
      name: 'filenode_db',
      type: 'postgres',
      host: process.env.FILENODE_DB_HOST,
      port: +process.env.FILENODE_DB_PORT,
      username: process.env.FILENODE_DB_USERNAME,
      password: process.env.FILENODE_DB_PASSWORD,
      database: process.env.FILENODE_DB_NAME,
      entities: ['dist/**/*.filenode-entity.js'],
      logging: process.env.DB_LOGGING === 'true',
    },
    {
      name: 'authnode_db',
      type: 'postgres',
      host: process.env.AUTHNODE_DB_HOST,
      port: +process.env.AUTHNODE_DB_PORT,
      username: process.env.AUTHNODE_DB_USERNAME,
      password: process.env.AUTHNODE_DB_PASSWORD,
      database: process.env.AUTHNODE_DB_NAME,
      entities: ['dist/**/*.authnode-entity.js'],
      logging: process.env.DB_LOGGING === 'true',
    },
  ]);
});
