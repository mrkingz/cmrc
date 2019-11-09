const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connectionConfigs = {
  production: {
    type: 'postgres',
    name: 'production',
    ssl: true,
    url: process.env.DATABASE_URL,
    entities: [path.join(__dirname, './src/database/entities/*{.js,.ts}')],
    migrations: [path.join(__dirname, './src/database/migrations/*{.js,.ts}')],
    cli: {
      entitiesDir: path.join(__dirname, './src/database/entities'),
      migrationsDir: path.join(__dirname, './src/database/migrations'),
    },
  },
  development: {
    type: 'postgres',
    name: 'default',
    logging: true,
    synchronize: true,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [path.join(__dirname, './src/database/entities/*{.js,.ts}')],
    migrations: [path.join(__dirname, './dist/database/migrations/*.js')],
    seeds: ['./src/database/seeds/*.seed.ts'],
    cli: {
      entitiesDir: path.join(__dirname, './src/database/entities'),
      migrationsDir: path.join(__dirname, './src/database/migrations'),
    },
  },
  test: {
    type: 'postgres',
    name: 'test',
    logging: true,
    synchronize: true,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    entities: [path.join(__dirname, './src/database/entities/*{.js,.ts}')],
    migrations: [path.join(__dirname, './dist/database/migrations/*.js')],
    cli: {
      entitiesDir: path.join(__dirname, './src/database/entities'),
      migrationsDir: path.join(__dirname, './src/database/migrations'),
    },
  },
};

module.exports = connectionConfigs[process.env.NODE_ENV || 'development'];
