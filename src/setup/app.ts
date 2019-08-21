import cors from 'cors';
import csrf from 'csurf';
import helmet from 'helmet';
import config from 'config';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import express, { Application, Request, Response } from 'express';
import mainRouter from '../routes/index';
import { fail } from 'assert';

const appInit = async (app: Application): Promise<void> => {
  // Set up sentry for production error logging
  Sentry.init({ dsn: config.get('app.sentry') });
  app.use(Sentry.Handlers.requestHandler());

  // Make sure middlewares are setup after sentry
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: false }));
  app.use(cookieParser());
  app.use(helmet());

  // Make sure csrf/csurf is configured just before registering the routes
  app.use(csrf({ cookie: true }));
  app.use(config.get('api.prefix'), mainRouter);

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());
}

export default appInit;