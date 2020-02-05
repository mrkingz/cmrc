import { Router } from 'express';

import userController from '../controllers/UserController';
import researchCategoryController from '../controllers/ResearchCategoryController';
import {ResearchType} from "../types/ResearchCategory";

const researchCategoryRouter: Router = Router();

const researchCategoryId: string = 'researchCategoryId';

<<<<<<< HEAD
=======
researchCategoryRouter.param('researchCategoryId', 
researchCategoryController.validateUuid(researchCategoryId));

>>>>>>> 9d4372f... feat(researchCategories): research category CRUD
researchCategoryRouter.route('/')
  .get(researchCategoryController.validatePaginationParameters(),
    researchCategoryController.find('Research categories'))
  .post(userController.authenticateUser(),
    userController.authorizeUser(),
    researchCategoryController.validateInputs(),
    researchCategoryController.create());

<<<<<<< HEAD
researchCategoryRouter.param('researchCategoryId', researchCategoryController.validateUuid(researchCategoryId))
  .get('/:researchCategoryId/empiricals',
=======
researchCategoryRouter.get('/:researchCategoryId/empiricals',
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD
    researchCategoryController.findOneWithRelations(researchCategoryId, ResearchType.Empirical))
  .get('/:researchCategoryId/educations',
    researchCategoryController.findOneWithRelations(researchCategoryId, ResearchType.Education))
  .get('/:researchCategoryId/practicals',
    researchCategoryController.findOneWithRelations(researchCategoryId, ResearchType.Practical))

<<<<<<< HEAD


researchCategoryRouter.param(researchCategoryId, researchCategoryController.validateUuid(researchCategoryId))
  .route('/:researchCategoryId')
  .get(researchCategoryController.findOne('researchCategoryId'))
=======
researchCategoryRouter.route('/:researchCategoryId')
  .get(researchCategoryController.findOne('researchCategoryId', 'Research category'))
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD
  .all(userController.authenticateUser(),
    userController.authorizeUser(),
    researchCategoryController.checkIfExist(researchCategoryId))
  .put(researchCategoryController.validateInputs(), researchCategoryController.update())
  .delete(researchCategoryController.delete())

<<<<<<< HEAD
=======
researchCategoryRouter.post('/:researchCategoryId/*', 
  userController.authenticateUser(),
  userController.authorizeUser(),
  researchCategoryController.checkIfExist(researchCategoryId));
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD

export default researchCategoryRouter;