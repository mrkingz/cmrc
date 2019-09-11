import express, { Request, Response } from 'express';
import userController from '../controllers/UserController'


const authRoutes = express.Router();

authRoutes.get('/csrfToken', (req: Request, res: Response) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken()
  })
});

authRoutes.post('/signup', userController.signUp());

export default authRoutes