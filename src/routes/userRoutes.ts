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
userRoutes.get('/', userController.authorizeUser(), userController.getUsers());

/**
 * Route to get a single user
 */
userRoutes.get('/:userId', userController.getProfile());

/**
 * Route to search for users by name
 */
userRoutes.post('/search', userController.authorizeUser(), userController.searchUsers());

export default userRoutes;