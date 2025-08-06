import { Request, Response, NextFunction } from 'express';

// 异步处理中间件，用于捕获异步路由处理器中的错误
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };