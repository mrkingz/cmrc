import { Router } from 'express';
import userController from '../controllers/UserController';
import testimonyController from '../controllers/TestimonyController';
const testimonyRouter: Router = Router();

testimonyRouter.post(
  '/',
  userController.authenticateUser(),
  testimonyController.validateInputs(),
  testimonyController.create());

export default testimonyRouter;