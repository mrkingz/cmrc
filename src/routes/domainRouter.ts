import { Router } from 'express';
import domainController from '../controllers/DomainController';
import userController from '../controllers/UserController'
<<<<<<< HEAD
import researchController from '../controllers/ResearchCategoryController';
=======
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD
import researchCategoryRouter from "./researchCategoryRouter";

const domainRouter: Router = Router();

const domainId: string = 'domainId';
<<<<<<< HEAD
const researchCategoryId: string = 'researchCategoryId'

researchCategoryRouter.post('/:researchCategoryId/domains',
  userController.authenticateUser(),
  userController.authorizeUser(),
  domainController.validateUuid(researchCategoryId),
  researchController.checkIfExist(researchCategoryId),
=======

researchCategoryRouter.post('/:researchCategoryId/domains',
>>>>>>> 9d4372f... feat(researchCategories): research category CRUD
  domainController.validateInputs(),
  domainController.create());

domainRouter.param(domainId, domainController.validateUuid(domainId))
  .route('/:domainId')
  .get(domainController.findOne(domainId))
  .all(userController.authenticateUser(),
    userController.authorizeUser(),
    domainController.checkIfExist(domainId))
  .put(domainController.validateInputs(), domainController.update())
  .delete(domainController.delete());

domainRouter.get('/',
  domainController.validatePaginationParameters(),
  domainController.find());

export default domainRouter;