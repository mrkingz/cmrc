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
    },
    /**
     * Elastic search configs
     */
    elasticSearch: {
      node: 'http://localhost:9200',
      credentials: {
        username: process.env.ELASTIC_SEARCH_USERNAME,
        password: process.env.ELASTIC_SEARCH_PASSWORD
      }
    }
  }
};

export default configs;
