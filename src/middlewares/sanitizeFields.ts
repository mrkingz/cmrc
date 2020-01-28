import { Request, Response, NextFunction } from 'express';

/**
 * Strips leading/trailing while spaces
 * 
 * @returns {Function} an express middleware function
 */
const sanitizeFields: Function = (): Function => {
  return (req: Request, res: Response, next: NextFunction): void => {

    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      Object.keys(req.body).forEach((key: string) => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }
    
    return next();
  }
};

export default sanitizeFields;