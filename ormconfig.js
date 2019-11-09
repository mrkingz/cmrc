const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

module.exports = [
    {
        name: 'production',
        type: 'postgres',
        ssl: true,
        url: process.env.DATABASE_URL,
        entities: [path.join(__dirname, './src/database/entities/*{.js,.ts}')],
        migrations: [path.join(__dirname, './src/database/migrations/*{.js,.ts}')],
        cli: {
            entitiesDir: path.join(__dirname, './src/database/entities'),
            migrationsDir: path.join(__dirname, './src/database/migrations'),
        },
    },
    {
        name: 'default',
        type: 'postgres',
        logging: true,
        synchronize: true,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [path.join(__dirname, './src/database/entities/*{.js,.ts}')],
        migrations: [path.join(__dirname, './dist/database/migrations/*.js')],
        cli: {
            entitiesDir: path.join(__dirname, './src/database/entities'),
            migrationsDir: path.join(__dirname, './src/database/migrations'),
        },
    },
    {
        name: 'test',
        type: 'postgres',
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
];
