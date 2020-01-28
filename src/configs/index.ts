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
    logoUrl: process.env.NOTIFICATION_LOGO_URL,
    /**
     * Admin default credentials
     */
    admin: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    },
    /**
     * Cloudinary configs
     */
    cloudinaryConfig: {
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
      cloud_name: process.env.CLOUD_NAME
    },
    /**
     * JWT configs
     */
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
      minItemsPerPage: 10,
      maxItemsPerPage: 100
    }
  },

  /**
   * Database connection url config
   */
  database: {
    production: {
      ssl: true,
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      url: process.env.DATABASE_URL
    },
    development: {
      logging: true,
      synchronize: true,
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    test: {
      logging: false,
      synchronize: true,
      dropSchema: true,
      type: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.TEST_DB_USERNAME,
      password: process.env.TEST_DB_PASSWORD,
      database: process.env.TEST_DB_NAME,
    },
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
            TEST_DB_USERNAME, TEST_DB_PASSWORD, TEST_DB_NAME
          } = process.env;

          /**
           * Check if app is running on test mode; otherwise, default to development configs
           */
          databaseURL += process.env.NODE_ENV === 'test'
            ? `${TEST_DB_USERNAME}:${TEST_DB_PASSWORD}@${DB_HOST}:5432/${TEST_DB_NAME}`
            : `${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}`;

          return databaseURL;
      }
    },
    /**
     * Elastic search configs
     */
    elasticSearch: {
      node: process.env.ELASTIC_HOST,
      credentials: {
        username: process.env.ELASTIC_SEARCH_USERNAME,
        password: process.env.ELASTIC_SEARCH_PASSWORD
      }
    }
  }
};

export default configs;
