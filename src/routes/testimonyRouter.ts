import { Router } from 'express';

import userController from '../controllers/UserController';
import testimonyController from '../controllers/TestimonyController';
import TestimonyController from '../controllers/TestimonyController';

const testimonyRouter: Router = Router();
const testimonyId = 'testimonyId'

testimonyRouter.post(
  '/',
  userController.authenticateUser(),
  testimonyController.validateInputs(),
  testimonyController.create());

testimonyRouter.get('/approved', testimonyController.findByApprovedStatus(true));
  testimonyRouter.get('/unapproved', 
    userController.authenticateUser(),
    userController.authorizeUser(),
    TestimonyController.findByApprovedStatus(false));

testimonyRouter.param(testimonyId, testimonyController.validateUuid(testimonyId))
  .route('/:testimonyId')
  .get(testimonyController.findOne(testimonyId))
  .all(
    userController.authenticateUser(), 
    userController.authorizeUser(), 
    testimonyController.checkIfExist(testimonyId)
  )
  .put(testimonyController.update())
  .delete(testimonyController.delete())
  
testimonyRouter.get('/', testimonyController.find('Testimonies'))

export default testimonyRouter;