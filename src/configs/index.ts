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
      password: process.env.ADMIN_PASSWORD,
    },

    /**
     * Cloudinary configs
     */
    cloudinaryConfig: {
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
      cloud_name: process.env.CLOUD_NAME,
    },
    
    /**
     * JWT configs
     */
    jwt: {
      issuer: process.env.ISSUER,
      secret: process.env.JWT_SECRET,
    },
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
      maxItemsPerPage: 100,
    },
  },

  /**
   * Elastic search configs
   */
  elasticSearch: {
    elasticSearchNode: process.env.ELASTIC_SEARCH_NODE,
    credentials: {
      username: process.env.ELASTIC_SEARCH_USERNAME,
      password: process.env.ELASTIC_SEARCH_PASSWORD,
    },
  },
};

export default configs;
