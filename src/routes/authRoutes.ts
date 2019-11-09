import express, { Request, Response, Router} from 'express';
import authController from '../controllers/UserController'


const authRoutes: Router = express.Router();

/**
 * Gets the csrf token
 */
authRoutes.get('/csrfToken', (req: Request, res: Response) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken()
  })
});

/**
 * Sign up a new user
 */
authRoutes.post('/signup', 
  authController.checkIfUniqueEmail(), 
  authController.signUp());

/**
 * Update password
 */
authRoutes.post('/signin', authController.signIn());

/**
 * Activates user's account email is verified
 */
authRoutes.get('/verification/:token',  authController.accountVerification());

/**
 * Send a password reset email
 */
authRoutes.post('/password', authController.sendPasswordResetLink());

/**
 * Send a password reset email
 */
authRoutes.put('/password/:token', authController.updatePassword());

export default authRoutes