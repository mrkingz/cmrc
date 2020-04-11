/* eslint-disable prettier/prettier */
import { Router, Request, Response } from 'express';

import configs from '../configs';
import authRouter from './authRouter';
import userRouter from './userRouter';
import researchCategoryRouter from './researchCategoryRouter';
import sanitizeFields from '../middlewares/sanitizeFields';
import disciplineRouter from './disciplineRouter';
import paperTypeRouter from './paperTypeRouter';
import mediaTrendRouter from './mediaTrendRouter';
import mediaTypeRouter from './mediaTypeRouter';
import domainRouter from './domainRouter';
import testimonyRouter from './testimonyRouter';

const mainRouter: Router = Router();

mainRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: `Welcome to ${configs.app.name} API`
  });
});

mainRouter.use(sanitizeFields());
mainRouter.use('/auth', authRouter);
mainRouter.use('/users', userRouter);
mainRouter.use('/disciplines', disciplineRouter);
mainRouter.use('/researches', researchCategoryRouter);
mainRouter.use('/papertypes', paperTypeRouter);
mainRouter.use('/mediatrends', mediaTrendRouter);
mainRouter.use('/mediatypes', mediaTypeRouter);
mainRouter.use('/domains', domainRouter);
mainRouter.use('/testimonies', testimonyRouter)

export default mainRouter;