import config from '../configs';
import express, { Application } from 'express';
import appInit from './app';
import databaseConnection from './database';

const app: Application = express();

(async () => {
  /**
   * Make sure app initialization comes first so sentry can log any error 
   * that may occure during database connection
   */
  await appInit(app);
  await databaseConnection(app.get('env')); 
  
  const PORT = config.get('app.port') || 3000;
  
  // We can start our app now
  await app.listen(PORT, (): void => {
    console.log(`Server running on PORT ${PORT} in ${app.get('env')} mode`);
  });
})(); 

export default app;