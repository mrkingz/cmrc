import { Request, Response } from 'express';
import User from '../entities/User';
import UserInterface from '../interfaces/UserInterface';
import BaseController from './BaseController';

class UserController extends BaseController<UserInterface> {
  constructor(entityName: string) {
    super(entityName)
  }

  /**
   * @description Sign up a new user
   * 
   * @returns {Function} an async function which accepts an express middleware function 
   * as a callback to handle the POST request
   */
  public signUp() {
    return this.asyncFunction(async (req: Request, res: Response): Promise<any> => {
      return this.saveEntity(User.create(req.body));
    })
  }
}

export default new UserController('User');