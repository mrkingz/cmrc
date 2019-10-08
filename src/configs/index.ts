import dotenv from 'dotenv';
dotenv.config()


const configs = {
  /**
   * General application configs
   */
  app: {
    name: 'CMRC',
    domain: '#',
    port: process.env.PORT || 3000,
    sentry: process.env.SENTRY,
    sendGridKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL,
    admin: {
      email: process.env.EMAIL,
      password: process.env.ADMIN_PASSWORD
    },
    jwt: {
      issuer: process.env.ISSUER,
      secret: process.env.JWT_SECRET
    }
  },

  /**
   * API specific configs
   */
  api: {
    prefix: '^/api/v[1-9]',
    version: 1,
    patch_version: '1.0.0',
    lang: 'en',
    apiURL: 'https://cmrc.herokuapp.com',
    pagination: {
      minItemsPerPage: 20,
      maxItemsPerPage: 100
    }
  },

  /**
   * Database connection url config
   */
  database: {
    /**
     * @description Gets the database connection url
     * 
     * @returns that database connection url
     */
    url: (): string => {
      switch (process.env.NODE_ENV) {
        case 'production':
          return `${process.env.DATABASE_URL}`;

        default:
          let databaseURL = 'postgres://'
          const {
            DB_USERNAME, DB_PASSWORD, DB_HOST, DB_NAME,
            TEST_DB_USERNAME, TEST_DB_PASSWORD, TEST_DB_HOST, TEST_DB_NAME
          } = process.env;

          /**
           * Check if app is running on test mode; otherwise, default to development configs
           */
          databaseURL += process.env.NODE_ENV === 'test'
            ? `${TEST_DB_USERNAME}:${TEST_DB_PASSWORD}@${TEST_DB_HOST}:5432/${TEST_DB_NAME}`
            : `${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}`;

          return databaseURL;
      }
    }
  }
};

export default configs;
