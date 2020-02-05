import { Router } from 'express';

import userController from '../controllers/UserController';
import researchCategoryController from '../controllers/ResearchCategoryController';
import {ResearchType} from "../types/ResearchCategory";

const researchCategoryRouter: Router = Router();

const researchCategoryId: string = 'researchCategoryId';

researchCategoryRouter.route('/')
  .get(researchCategoryController.validatePaginationParameters(),
    researchCategoryController.find('Research categories'))
  .post(userController.authenticateUser(),
    userController.authorizeUser(),
    researchCategoryController.validateInputs(),
    researchCategoryController.create());

researchCategoryRouter.param('researchCategoryId', researchCategoryController.validateUuid(researchCategoryId))
  .get('/:researchCategoryId/empiricals',
    researchCategoryController.findOneWithRelations(researchCategoryId, ResearchType.Empirical))
  .get('/:researchCategoryId/educations',
    researchCategoryController.findOneWithRelations(researchCategoryId, ResearchType.Education))
  .get('/:researchCategoryId/practicals',
    researchCategoryController.findOneWithRelations(researchCategoryId, ResearchType.Practical))



researchCategoryRouter.param(researchCategoryId, researchCategoryController.validateUuid(researchCategoryId))
  .route('/:researchCategoryId')
  .get(researchCategoryController.findOne('researchCategoryId'))
  .all(userController.authenticateUser(),
    userController.authorizeUser(),
    researchCategoryController.checkIfExist(researchCategoryId))
  .put(researchCategoryController.validateInputs(), researchCategoryController.update())
  .delete(researchCategoryController.delete())


export default researchCategoryRouter;