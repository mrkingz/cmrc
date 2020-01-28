import express, { Router} from 'express';
import userController from '../controllers/UserController';

const userRoutes: Router = express.Router();

userRoutes.use(userController.authenticateUser());

/**
 * Route to update profile
 */
userRoutes.put('/profile', userController.validateInputs(), userController.updateProfile());

/**
 * Route to get all users
 */
userRoutes.get('/', userController.authorizeUser(),
  userController.validatePaginationParameters(),
  userController.getUsers());

/**
 * Route to get a single user
 */
userRoutes.param('userId', userController.validateUuid('userId'))
  .get('/:userId', userController.getUser());

/**
 * Route to search for users by name
 */
userRoutes.post('/search',
  userController.authorizeUser(),
  userController.validatePaginationParameters(),
  userController.searchUsers());

/**
 * Routes to upload a profile photo
 */
userRoutes.put('/uploadPhoto', 
  userController.uploadFileToStorage('image'),
  userController.updatePhotoURL()
)

/**
 * Routes to remove profile photo
 */
userRoutes.delete('/removePhoto', userController.removePhoto())

export default userRoutes;