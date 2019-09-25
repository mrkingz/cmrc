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

  return await createConnection({
    type: 'postgres',
    logging: true,
    synchronize: env !== 'production',
    ssl: env === 'production',
    url: getDatabaseURL(),
    entities: [path.join(__dirname, '../entities/*{.js,.ts}')]
  })
};

export default dbConnection;
