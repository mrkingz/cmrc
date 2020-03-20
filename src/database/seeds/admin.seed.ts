import bcrypt from 'bcryptjs';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

import User from '../entities/User';
import configs from '../../configs';

const admin = [
  {
    firstName: 'Kingsley',
    lastName: 'Frank-Demesi',
    email: configs.app.admin.email,
    isVerified: true,
    isAdmin: true,
    password: bcrypt.hashSync(configs.app.admin.password as string, bcrypt.genSaltSync(10)),
  },
];

export default class CreateAdmin implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(admin)
      .execute();
  }
}
