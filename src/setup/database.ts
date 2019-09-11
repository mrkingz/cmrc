import path from 'path';
import { createConnection, Connection } from 'typeorm';
import config from '../configs';


/**
 * @description Connect database
 * 
 * @param {boolean} isProduction indicates if the connection should use SSL
 * @returns Promise<Connection>
 */
const dbConnection: Function = async (env: string): Promise<Connection> => {
  const getDatabaseURL: Function = config.get('database.url');

  return await createConnection({
    type: 'postgres',
    logging: false,
    synchronize: env !== 'production',
    ssl: env === 'production',
    url: getDatabaseURL(),
    entities: [path.join(__dirname, '../entities/*{.js,.ts}')]
  })
};

export default dbConnection;
