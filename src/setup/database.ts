import camelCase from 'lodash.camelcase';
import { createConnection, Connection, getConnectionOptions, DefaultNamingStrategy } from 'typeorm';

class CustomNamingStrategy extends DefaultNamingStrategy {
  public columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return super.columnName(camelCase(propertyName), camelCase(customName), embeddedPrefixes);
  }
}

/**
 * @description Connect database
 *
 * @param {boolean} isProduction indicates if the connection should use SSL
 * @returns Promise<Connection>
 */
const dbConnection: Function = async (env: string): Promise<Connection> => {
  return await createConnection({
    ...(await getConnectionOptions(env)),
    namingStrategy: new CustomNamingStrategy(),
  });
};

export default dbConnection;
