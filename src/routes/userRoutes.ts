import express, { Router} from 'express';
import userController from '../controllers/UserController';

const userRoutes: Router = express.Router();

/**
 * Update profile
 */
userRoutes.put('/profile', userController.authenticateUser(), userController.updateProfile());


export default userRoutes;