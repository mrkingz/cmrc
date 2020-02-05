import { Router } from 'express';
import mediaTypeController from '../controllers/MediaTypeController';
<<<<<<< HEAD
import userController from '../controllers/UserController'
import researchController from '../controllers/ResearchCategoryController';
import researchCategoryRouter from "./researchCategoryRouter";
=======
import userController from '../controllers/UserController';
import researchCategoryRouter from './researchCategoryRouter';
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD

const mediaTypeRouter: Router = Router();

const mediaTypeId: string = 'mediaTypeId';
<<<<<<< HEAD
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
=======

researchCategoryRouter.post(
    '/:researchId/mediatypes',
    mediaTypeController.validateInputs(),
    mediaTypeController.create(),
);

mediaTypeRouter
    .param('mediaTypeId', mediaTypeController.validateUuid(mediaTypeId))
    .route('/:mediaTypeId')
    .get(mediaTypeController.findOne(mediaTypeId))
    .all(
        userController.authenticateUser(),
        userController.authorizeUser(),
        mediaTypeController.checkIfExist(mediaTypeId),
    )
    .put(mediaTypeController.validateInputs(), mediaTypeController.update())
    .delete(mediaTypeController.delete());

mediaTypeRouter.get('/', mediaTypeController.validatePaginationParameters(), mediaTypeController.find());

export default mediaTypeRouter;
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD
