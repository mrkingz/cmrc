import { Router, Request, Response } from 'express';
import config from '../configs';

const mainRouter = Router();

mainRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: `Welcome to ${config.get('app.name')}`
  })
})

export default mainRouter;