import express, { Application } from 'express';

import appInit from './app';
import configs from '../configs';
import databaseConnection from './database';

const app: Application = express();

(async (): Promise<void> => {
  try {
    /**
     * Make sure app initialization comes first so sentry can log any error 
     * that may occure during database connection
     */
    await appInit(app);

    // Connect to database
    await databaseConnection(
      app.get('env') === 'development' ? 'default' : app.get('env')
    );

    const PORT = configs.app.port || 8080;
    // We can start our app now 
    await app.listen(PORT, (): void => {
      console.log(`Server running on PORT ${PORT} in ${app.get('env')} mode`);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
})(); 

export default app;