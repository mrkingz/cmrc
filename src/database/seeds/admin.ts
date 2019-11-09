import configs from '../../configs';
import bcrypt from 'bcryptjs';

export default {
  firstName: 'Kingsley',
  lastName: 'Frank-Demesi',
  email: configs.app.admin.email,
  password: bcrypt.hashSync(configs.app.admin.password as string, bcrypt.genSaltSync(10)),
  photo: null,
  phoneNumber: null,
  rememberMeToke: null,
  isAdmin: true,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
};