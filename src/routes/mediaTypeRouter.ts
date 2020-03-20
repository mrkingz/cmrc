import { Router } from 'express';
import mediaTypeController from '../controllers/MediaTypeController';
import userController from '../controllers/UserController'
import researchController from '../controllers/ResearchCategoryController';
import researchCategoryRouter from "./researchCategoryRouter";

const mediaTypeRouter: Router = Router();

const mediaTypeId: string = 'mediaTypeId';
const researchCategoryId: string = 'researchCategoryId';

researchCategoryRouter.post('/:researchId/mediatypes',
  userController.authenticateUser(),
  userController.authorizeUser(),
  mediaTypeController.validateUuid(researchCategoryId),
  researchController.checkIfExist(researchCategoryId),
  mediaTypeController.validateInputs(),
  mediaTypeController.create());

mediaTypeRouter.param('mediaTypeId', mediaTypeController.validateUuid(mediaTypeId))
  .route('/:mediaTypeId')
  .get(mediaTypeController.findOne(mediaTypeId))
  .all(userController.authenticateUser(),
    userController.authorizeUser(),
    mediaTypeController.checkIfExist(mediaTypeId))
  .put(mediaTypeController.validateInputs(), mediaTypeController.update())
  .delete(mediaTypeController.delete());

mediaTypeRouter.get('/',
  mediaTypeController.validatePaginationParameters(),
  mediaTypeController.find());

export default mediaTypeRouter;
