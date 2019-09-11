import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes';
import config from '../configs';
import sanitizeFields from '../middlewares/sanitizeFields';

const mainRouter = Router();

mainRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: `Welcome to ${config.get('app.name')}`
  });
});

mainRouter.use(sanitizeFields());
mainRouter.use('/auth', authRoutes);

export default mainRouter;