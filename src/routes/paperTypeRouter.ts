import { Router } from 'express';
import researchCategoryRouter from "./researchCategoryRouter";
import userController from '../controllers/UserController';
import researchController from '../controllers/ResearchCategoryController';
import paperTypeController from '../controllers/PaperTypeController';
import disciplineController from "../controllers/DisciplineController";

const paperTypeRouter: Router = Router();

const paperTypeId: string = 'paperTypeId';
const researchCategoryId: string = 'researchCategoryId';

researchCategoryRouter.post('/:researchCategoryId/papertypes',
  userController.authenticateUser(),
  userController.authorizeUser(),
  researchController.validateUuid(researchCategoryId),
  researchController.checkIfExist(researchCategoryId),
  paperTypeController.validateInputs(),
  paperTypeController.create(),
)

paperTypeRouter.param(paperTypeId, disciplineController.validateUuid(paperTypeId))
  .route('/:paperTypeId')
  .get(paperTypeController.findOne(paperTypeId))
  .all(userController.authenticateUser(),
    userController.authorizeUser(),
    paperTypeController.checkIfExist(paperTypeId))
  .put(paperTypeController.validateInputs(), paperTypeController.update())
  .delete(paperTypeController.delete());

paperTypeRouter.get('/',
  paperTypeController.validatePaginationParameters(),
  paperTypeController.find());


export default paperTypeRouter;


