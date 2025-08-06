import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';

// 生成JWT token
const generateToken = (id: unknown) => {
  const secret = process.env.JWT_SECRET || 'defaultsecret';
  // 使用类型断言来解决类型问题
  return jwt.sign({ id: String(id) }, secret as jwt.Secret);
};

// 用户注册
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: '用户已存在' });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: '无效的用户数据' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 用户登录
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('用户登录请求:', { email });

    // 查找用户
    const user = await User.findOne({ email });
    console.log('查找到的用户:', user);

    // 检查用户是否存在并验证密码
    if (user) {
      const isPasswordValid = await user.comparePassword(password);
      console.log('密码验证结果:', isPasswordValid);
      
      if (isPasswordValid) {
        const responseData = {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        };
        console.log('登录成功，返回数据:', responseData);
        res.json(responseData);
      } else {
        console.log('密码不正确');
        res.status(401).json({ message: '邮箱或密码不正确' });
      }
    } else {
      console.log('用户不存在');
      res.status(401).json({ message: '邮箱或密码不正确' });
    }
  } catch (error: any) {
    console.error('登录过程中发生错误:', error);
    res.status(500).json({ message: error.message });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: '用户不存在' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 更新用户信息
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 更新用户信息
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    // 如果提供了新密码，则更新密码
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 获取所有用户（仅管理员）
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 删除用户（仅管理员）
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.deleteOne();
    res.json({ message: '用户已删除' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 更新用户角色（仅管理员）
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 更新用户角色
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: '无效的用户ID' });
    }
    res.status(500).json({ message: error.message });
  }
};