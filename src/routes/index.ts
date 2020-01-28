/* eslint-disable prettier/prettier */
import { Router, Request, Response } from 'express';

import configs from '../configs';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import orderTypeRoutes from "./orderTypeRoutes";
import sanitizeFields from '../middlewares/sanitizeFields';

const mainRouter = Router();

mainRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: `Welcome to ${configs.app.name} API`
  });
});

mainRouter.use(sanitizeFields());
mainRouter.use('/auth', authRoutes);
mainRouter.use('/users', userRoutes);
mainRouter.use('/ordertypes',  orderTypeRoutes);

export default mainRouter;