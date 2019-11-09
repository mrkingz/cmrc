import { createConnection, Connection, getConnectionOptions } from 'typeorm';


/**
 * @description Connect database
 * 
 * @param {boolean} isProduction indicates if the connection should use SSL
 * @returns Promise<Connection>
 */
const dbConnection: Function = async (env: string): Promise<Connection> => {

  return await createConnection(
    await getConnectionOptions(env)
  );
};

export default dbConnection;