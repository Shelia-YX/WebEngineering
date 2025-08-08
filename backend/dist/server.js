"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
const registrationRoutes_1 = __importDefault(require("./routes/registrationRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
//try
const path_1 = __importDefault(require("path"));
// 加载环境变量
dotenv_1.default.config();
// 连接到MongoDB
(0, db_1.default)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
//这里
// 托管静态文件
app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
// API路由
app.get('/api/data', (req, res) => {
    res.json({ message: "Hello from API!" });
});
// 处理前端路由
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../public/index.html'));
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
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
// 路由
app.use('/api/users', userRoutes_1.default);
app.use('/api/activities', activityRoutes_1.default);
app.use('/api/registrations', registrationRoutes_1.default);
app.use('/api/comments', commentRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
// 基本路由
app.get('/', (req, res) => {
    res.send('体育活动室 API 正在运行');
    console.log('访问了根路径');
});
// 错误处理中间件
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map