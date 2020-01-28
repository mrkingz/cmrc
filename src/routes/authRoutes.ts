import express, { Router } from 'express';
import authController from '../controllers/UserController'


const authRoutes: Router = express.Router();


authRoutes.post('/signup', authController.validateInputs(), authController.signUp());

authRoutes.post('/signin',authController.validateInputs(), authController.signIn());

authRoutes.get('/verification/:token',  authController.accountVerification());

authRoutes.post('/password', authController.validateInputs(), authController.sendPasswordResetLink());

authRoutes.put('/password/:token', authController.validateInputs(), authController.updatePassword());

export default authRoutes