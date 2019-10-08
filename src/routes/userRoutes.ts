import express, { Router} from 'express';
import userController from '../controllers/UserController';

const userRoutes: Router = express.Router();

userRoutes.all('/*', userController.authenticateUser());

/**
 * Route to update profile
 */
userRoutes.put('/profile', userController.updateProfile());

/**
 * Route to get all users
 */
userRoutes.get('/', 
  userController.authorizeUser(),
  userController.getUsers());

export default userRoutes;