import express, { Router } from 'express';
import userController from '../controllers/UserController';

const userRouter: Router = express.Router();
const userId: string = 'userId';

userRouter.use(userController.authenticateUser());

/**
 * Route to update profile
 */
userRouter.put('/profile', userController.validateInputs(), userController.updateProfile());

/**
 * Route to get all users
 */
userRouter.get(
  '/',
  userController.authorizeUser(),
  userController.validatePaginationParameters(),
  userController.find(),
);

/**
 * Route to get a single user
 */
userRouter.get('/:userId', userController.validateUuid(userId), userController.findOne(userId));

/**
 * Route to search for users by name
 */
userRouter.post(
  '/search',
  userController.authorizeUser(),
  userController.validatePaginationParameters(),
  userController.searchUsers(),
);

/**
 * Routes to upload a profile photo
 */
userRouter.put('/uploadPhoto', userController.uploadFileToStorage('image'), userController.updatePhotoURL());

/**
 * Routes to remove profile photo
 */
userRouter.delete('/removePhoto', userController.removePhoto());

export default userRouter;
