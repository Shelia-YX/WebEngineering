import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import activityRoutes from './routes/activityRoutes';
import registrationRoutes from './routes/registrationRoutes';
import commentRoutes from './routes/commentRoutes';
import categoryRoutes from './routes/categoryRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';

//try
import path from 'path';

// 加载环境变量
dotenv.config();

// 连接到MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;


//这里
// 托管静态文件
app.use(express.static(path.join(__dirname, '../../public')));

// API路由
app.get('/api/data', (req, res) => {
    res.json({ message: "Hello from API!" });
});

// 处理前端路由
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 添加请求日志中间件（放在最前面）
app.use((req, res, next) => {
  console.log(`请求: ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 中间件
// 配置CORS，允许所有来源的请求
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// 路由
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);

// 基本路由
app.get('/', (req, res) => {
  res.send('体育活动室 API 正在运行');
  console.log('访问了根路径');
});

// 错误处理中间件
app.use(notFound);
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});