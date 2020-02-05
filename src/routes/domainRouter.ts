import { Router } from 'express';
import domainController from '../controllers/DomainController';
import userController from '../controllers/UserController'
import researchController from '../controllers/ResearchCategoryController';
import researchCategoryRouter from "./researchCategoryRouter";

const domainRouter: Router = Router();

const domainId: string = 'domainId';
const researchCategoryId: string = 'researchCategoryId'

researchCategoryRouter.post('/:researchCategoryId/domains',
  userController.authenticateUser(),
  userController.authorizeUser(),
  domainController.validateUuid(researchCategoryId),
  researchController.checkIfExist(researchCategoryId),
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