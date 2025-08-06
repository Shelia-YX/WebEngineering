import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

// 加载环境变量
dotenv.config();

// 连接到MongoDB
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-activity-center');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// 创建管理员用户
const createAdminUser = async (): Promise<void> => {
  try {
    // 检查用户是否已存在
    const adminExists = await User.findOne({ email: 'admin@qq.com' });

    if (adminExists) {
      console.log('管理员用户已存在');
      return;
    }

    // 创建管理员用户
    const admin = await User.create({
      username: 'admin',
      email: 'admin@qq.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('管理员用户创建成功:', admin);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  } finally {
    // 断开数据库连接
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
    process.exit(0);
  }
};

// 执行创建管理员用户的操作
connectDB().then(() => {
  createAdminUser();
});