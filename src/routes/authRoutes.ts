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
 * Activates user's account email is verified
 */
authRoutes.get('/verification/:token',  userController.accountVerification());


export default authRoutes