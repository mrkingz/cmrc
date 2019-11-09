import express, { Router } from 'express';

import userController from '../controllers/UserController';
import orderTypeController from '../controllers/OrderTypeController';

const orderTypeRoutes: Router = express.Router();

orderTypeRoutes.route('/')
  .get(orderTypeController.validatePaginationParameters(), orderTypeController.getOrderTypes())
  .post(userController.authenticateUser(),
    userController.authorizeUser(),
    orderTypeController.validateInputs(),
    orderTypeController.create());

orderTypeRoutes.param('orderTypeId', orderTypeController.validateUuid('orderTypeId'))
  .route('/:orderTypeId')
  .get(orderTypeController.getOrderType())
  .all(userController.authenticateUser(),
    userController.authorizeUser(),
    orderTypeController.checkIfExist('orderTypeId', 'Order type'))
  .put(orderTypeController.validateInputs(), orderTypeController.updateOrderType())
  .delete(orderTypeController.deleteOrderType())

export default orderTypeRoutes;