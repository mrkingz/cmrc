import dotenv from 'dotenv';
dotenv.config()

const config = {
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
  databaseUrl: {
    url: (env: String): String => {
      if (env !== 'production') {
        const { DB_PASSWORD, DB_HOST, DB_NAME, DB_NAME_TEST} = process.env
          const dbName = env === 'test' ? DB_NAME : DB_NAME_TEST;
          return `postgres://postgres${DB_PASSWORD}@${DB_HOST}/5432/${dbName}`
      } else {
        return ''
      }
    }
  }
};

export default config;