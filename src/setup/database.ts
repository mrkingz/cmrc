import path from 'path';
import { createConnection, Connection } from 'typeorm';
import configs from '../configs';


/**
 * @description Connect database
 * 
 * @param {boolean} isProduction indicates if the connection should use SSL
 * @returns Promise<Connection>
 */
const dbConnection: Function = async (env: string): Promise<Connection> => {
  const getDatabaseURL: Function = configs.database.url;

  const conn: Connection = await createConnection({
    type: 'postgres',
    logging: true,
    synchronize: env !== 'production',
    ssl: env === 'production',
    url: getDatabaseURL(),
    entities: [path.join(__dirname, '../database/entities/*{.js,.ts}')],
    migrations: [path.join(__dirname, '../database/migrations/*{.js,.ts}')],
    cli: {
      entitiesDir: path.join(__dirname, '../database/entities'),
      migrationsDir:path.join(__dirname, '../database/migrations')
    }
  })

  await conn.runMigrations();
  return conn;
};

export default dbConnection;
