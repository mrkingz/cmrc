import express, { Router} from 'express';
import UserController from '../controllers/UserController';


const userRoutes: Router = express.Router();

userRoutes.all('/*', UserController.authenticateUser());

/**
 * Route to update profile
 */
userRoutes.put('/profile', UserController.updateProfile());

/**
 * Route to get all users
 */
userRoutes.get('/', UserController.authorizeUser(), UserController.getUsers());

/**
 * Route to get a single user
 */
userRoutes.get('/:userId', UserController.getProfile());

/**
 * Route to search for users by name
 */
userRoutes.post('/search', UserController.authorizeUser(), UserController.searchUsers());

/**
 * Routes to upload a profile photo
 */
userRoutes.put('/uploadPhoto', 
  UserController.uploadFileToStorage('image'),
  UserController.updateProfilePhotoURL()
)

/**
 * Routes to remove profile photo
 */
userRoutes.delete('/removePhoto', UserController.removePhoto())
export default userRoutes;