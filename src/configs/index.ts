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
        const { NODE_ENV } = process.env;
        if (NODE_ENV !== 'production') {
          const { DB_PASSWORD, DB_HOST, DB_NAME, TEST_DB_NAME, DB_USERNAME } = process.env;
          const dbName = NODE_ENV !== 'test' ? DB_NAME : TEST_DB_NAME;

          return `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:5432/${dbName}`;
        } else {
          return `${process.env.DATABASE_URL}`;
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
