import express, { Router, Request, Response, NextFunction} from 'express';
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

/**
 * Routes to upload a profile photo
 */
userRoutes.put('/uploadPhoto', 
  userController.uploadFileToStorage('image'),
  userController.updateProfilePhotoURL()
)

/**
 * Routes to remove profile photo
 */
userRoutes.delete('/removePhoto', userController.removePhoto())
export default userRoutes;