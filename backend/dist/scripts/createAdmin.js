"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
// 加载环境变量
dotenv_1.default.config();
// 连接到MongoDB
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-activity-center');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
// 创建管理员用户
const createAdminUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 检查用户是否已存在
        const adminExists = yield User_1.default.findOne({ email: 'admin@qq.com' });
        if (adminExists) {
            console.log('管理员用户已存在');
            return;
        }
        // 创建管理员用户
        const admin = yield User_1.default.create({
            username: 'admin',
            email: 'admin@qq.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('管理员用户创建成功:', admin);
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
    }
    finally {
        // 断开数据库连接
        yield mongoose_1.default.disconnect();
        console.log('数据库连接已关闭');
        process.exit(0);
    }
});
// 执行创建管理员用户的操作
connectDB().then(() => {
    createAdminUser();
});
//# sourceMappingURL=createAdmin.js.map