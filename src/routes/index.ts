import { Router, Request, Response } from 'express';
import config from 'config';

const mainRouter = Router();

mainRouter.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: `Welcome to ${config.get('app.name')}`
  })
})

export default mainRouter;