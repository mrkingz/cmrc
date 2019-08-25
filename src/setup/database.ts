 import config from '../configs';
import { createConnection, Connection } from 'typeorm';


/**
 * @description Connect database
 * 
 * @param {boolean} isProduction indicates if the connection should use SSL
 * @returns Promise<Connection>
 */
const dbConnection: Function = async (): Promise<Connection> => {
  const getDatabaseURL: Function = config.get('database.url');
  const getSSLStatus = config.get('database.ssl');

  return createConnection({
    type: 'postgres',
    logging: true,
    ssl: getSSLStatus(),
    url: getDatabaseURL()
  })
};

export default dbConnection;
