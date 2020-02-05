import { Router } from 'express';
import mediaTrendController from '../controllers/MediaTrendController';
import userController from '../controllers/UserController'
<<<<<<< HEAD
import researchController from '../controllers/ResearchCategoryController';
import researchCategoryRouter from "./researchCategoryRouter";
=======
import researchCategoryRouter from './researchCategoryRouter';
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD

const mediaTrendRouter: Router = Router();

const mediaTrendId: string = 'mediaTrendId';
<<<<<<< HEAD
const researchCategoryId: string = 'researchCategoryId';

researchCategoryRouter.post('/:researchId/mediatrends',
  userController.authenticateUser(),
  userController.authorizeUser(),
  mediaTrendController.validateUuid(researchCategoryId),
  researchController.checkIfExist(researchCategoryId),
=======

researchCategoryRouter.post('/:researchId/mediatrends',
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD
  mediaTrendController.validateInputs(),
  mediaTrendController.create());

mediaTrendRouter.param('mediaTrendId', mediaTrendController.validateUuid(mediaTrendId))
  .route('/:mediaTrendId')
  .get(mediaTrendController.findOne(mediaTrendId))
  .all(userController.authenticateUser(),
    userController.authorizeUser(),
    mediaTrendController.checkIfExist(mediaTrendId))
  .put(mediaTrendController.validateInputs(), mediaTrendController.update())
  .delete(mediaTrendController.delete());

mediaTrendRouter.get('/',
  mediaTrendController.validatePaginationParameters(),
  mediaTrendController.find());

export default mediaTrendRouter;