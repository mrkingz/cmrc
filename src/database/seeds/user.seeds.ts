import configs from '../../configs';
import userController from '../../controllers/UserController';

export default [{
  firstName: 'Kingsley',
  lastName: 'Frank',
  email: configs.app.admin.email,
  password: userController.hashPassword(configs.app.admin.password as string),
  photo: null,
  phoneNumber: null,
  rememberMeToke: null,
  passwordReset: false,
  isAdmin: true,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
}];