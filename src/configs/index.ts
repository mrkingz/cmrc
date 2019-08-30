import dotenv from 'dotenv';
dotenv.config()

const config = {
  configs: {
    /**
     * General application configs
     */
    app: {
      name: 'CMRC API',
      secret: process.env.SECRET,
      port: process.env.PORT || 3000,
      sentry: process.env.SENTRY
    },

    /**
     * API specific configs
     */
    api: {
      prefix: '^/api/v[1-9]',
      version: [1],
      patch_version: '1.0.0',
      lang: 'en',
      pagination: {
        itemsPerPage: 20
      }
    },

    /**
     * Database connection url config
     */
    database: {
      /**
       * @description Gets the ssl connection status
       * 
       * @returns boolean
       */
      ssl: (): boolean => process.env.NODE_ENV === 'production',

      /**
       * @description Gets the database connection url
       * 
       * @returns that database connection url
       */
      url: (): string => {
        switch (process.env.NODE_ENV) {
          case 'production':
            return `${process.env.DATABASE_URL}`;
          /**
           * If app is running on a test mode,
           * create a test database url from the test env variables
           */
          case 'test':
            const { TEST_DB_USERNAME, TEST_DB_PASSWORD, TEST_DB_HOST, TEST_DB_NAME } = process.env;
            return `postgres://${TEST_DB_USERNAME}:${TEST_DB_PASSWORD}@${TEST_DB_HOST}:5432/${TEST_DB_NAME}`;

          /**
           * If app is not running running on a test/production mode
           * default to development mode,  and create a corresponding database url
           */ 
          default: 
            const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;
            return `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}`;
        }
      }
    },
  },

  /**
   * @description Gets a value from a nested object 
   * 
   * @param {Array} keys array of the top level configuration keys
   * @param {Object} configs object containing the configuration
   */
  deep (keys: Array<string>, configs: any): any {
    const key = keys[keys.length - 1];
    for (let config in configs) {
      if (configs[config][key]) 
        return configs[config][key];
    }
  },
  
  /**
   * @description Gets a value from a single key/nested keys
   *
   * @param {string} string
   * @returns the value that matches the key/nested key
   */
  get(string: string): any {
    const keys = string.split('.');
    const configs: any = this.configs;
    const value: any = keys.length === 1 ? configs[string] : this.deep(keys, configs);

    if (value)
      return value;

    throw new Error(`${string} is not a valid key`);
  }
};

export default config;
