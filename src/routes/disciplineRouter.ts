import { Router } from 'express';
import disciplineController from '../controllers/DisciplineController';
import userController from '../controllers/UserController'
import researchController from '../controllers/ResearchCategoryController';
import researchCategoryRouter from "./researchCategoryRouter";

const disciplineRouter: Router = Router();

const disciplineId: string = 'disciplineId';
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
