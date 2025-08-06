import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// 扩展Express的Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  id: string;
}

// 保护路由中间件 - 验证用户是否已登录
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 从请求头或cookie中获取token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: '未授权，请登录' });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // 获取用户信息
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    // 将用户信息添加到请求对象中
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: '未授权，token无效' });
  }
};

// 管理员权限中间件
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '权限不足，需要管理员权限' });
  }
};