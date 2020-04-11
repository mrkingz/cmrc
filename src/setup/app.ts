import cors from 'cors';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import cookieParser from 'cookie-parser';
import express, { Application, Request, Response } from 'express';

import configs from '../configs';
import mainRouter from '../routes/index';

const appInit = async (app: Application): Promise<void> => {
  // Set up sentry for error logging
  Sentry.init({ dsn: configs.app.sentry });
  app.use(Sentry.Handlers.requestHandler());

  // Make sure middlewares are setup after sentry
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: false }));
  app.use(cookieParser());
  app.use(helmet());

  // Register all routes/endpoints
  app.use(configs.api.prefix, mainRouter);

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });
};

export default appInit;
