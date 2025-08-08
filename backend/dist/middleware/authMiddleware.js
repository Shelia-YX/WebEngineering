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
exports.admin = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// 保护路由中间件 - 验证用户是否已登录
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 获取用户信息
        const user = yield User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: '用户不存在' });
        }
        // 将用户信息添加到请求对象中
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: '未授权，token无效' });
    }
});
exports.protect = protect;
// 管理员权限中间件
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ message: '权限不足，需要管理员权限' });
    }
};
exports.admin = admin;
//# sourceMappingURL=authMiddleware.js.map