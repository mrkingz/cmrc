import config from 'config'
import { createConnection, Connection } from 'typeorm';

const getDatabaseURL: Function = config.get('database.url');

/**
 * @description Connect database
 * 
 * @param {boolean} useSSL indicates if the connection should use SSL
 * @returns Promise<Connection>
 */
const dbConnection: Function = async (useSSL: boolean): Promise<Connection> => {
  return createConnection({
    type: 'postgres',
    logging: true,
    ssl: useSSL,
    url: getDatabaseURL()
  })
};

export default dbConnection;
