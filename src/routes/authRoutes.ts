import express, { Request, Response} from 'express';
import userController from '../controllers/UserController'


const authRoutes = express.Router();
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
authRoutes.post('/signup',  userController.signUp());

/**
 * Update password
 */
authRoutes.post('/signin', userController.signIn());

/**
 * Activates user's account email is verified
 */
authRoutes.get('/verification/:token',  userController.accountVerification());

/**
 * Send a password reset email
 */
authRoutes.post('/passwordReset', userController.sendPasswordResetLink());

export default authRoutes