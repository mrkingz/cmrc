import { Router } from 'express';
import disciplineController from '../controllers/DisciplineController';
<<<<<<< HEAD
import userController from '../controllers/UserController'
import researchController from '../controllers/ResearchCategoryController';
import researchCategoryRouter from "./researchCategoryRouter";
=======
import userController from '../controllers/UserController';
import researchCategoryRouter from './researchCategoryRouter';
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD

const disciplineRouter: Router = Router();

const disciplineId: string = 'disciplineId';
<<<<<<< HEAD
const researchCategoryId: string = 'researchCategoryId';

researchCategoryRouter.post('/:researchCategoryId/disciplines',
  userController.authenticateUser(),
  userController.authorizeUser(),
  disciplineController.validateUuid(researchCategoryId),
  researchController.checkIfExist(researchCategoryId),
  disciplineController.validateInputs(),
  disciplineController.create());

disciplineRouter.param(disciplineId, disciplineController.validateUuid(disciplineId))
  .route('/:disciplineId')
  .get(disciplineController.findOne(disciplineId))
  .all(userController.authenticateUser(),
    userController.authorizeUser(),
    disciplineController.checkIfExist(disciplineId))
  .put(disciplineController.validateInputs(), disciplineController.update())
  .delete(disciplineController.delete());

disciplineRouter.get('/',
  disciplineController.validatePaginationParameters(),
  disciplineController.find());

export default disciplineRouter;
=======

researchCategoryRouter.post(
  '/:researchCategoryId/disciplines',
  disciplineController.validateInputs(),
  disciplineController.create(),
);

disciplineRouter
  .param(disciplineId, disciplineController.validateUuid(disciplineId))
  .route('/:disciplineId')
  .get(disciplineController.findOne(disciplineId))
  .all(
    userController.authenticateUser(),
    userController.authorizeUser(),
    disciplineController.checkIfExist(disciplineId),
  )
  .put(disciplineController.validateInputs(), disciplineController.update())
  .delete(disciplineController.delete());

disciplineRouter.get('/', disciplineController.validatePaginationParameters(), disciplineController.find());

export default disciplineRouter;
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD
