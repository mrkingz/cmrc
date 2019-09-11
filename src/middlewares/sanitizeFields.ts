import { Request, Response, NextFunction } from 'express';

/**
 * @description Strips leading/trailing while spaces
 * 
 * @returns {Function} an express middleware function
 */
const sanitizeFields: Function = (): Function => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body) {
      Object.keys(req.body).forEach((key: any) => {
        if (req.body[key].constructor === String) {
          req.body[key] = req.body[key].trim();
        }
      });
    }
    next();
  }
};

export default sanitizeFields;