import { Router } from 'express';

import authController from '../controllers/UserController';

const authRouter: Router = Router();

authRouter.post('/signup', authController.validateInputs(), authController.signUp());

authRouter.post('/signin', authController.validateInputs(), authController.signIn());

authRouter.get('/verification/:token', authController.accountVerification());

authRouter.post('/password', authController.validateInputs(), authController.sendPasswordResetLink());

authRouter.put('/password/:token', authController.validateInputs(), authController.updatePassword());

export default authRouter;
