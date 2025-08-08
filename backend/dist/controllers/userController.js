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
exports.updateUserRole = exports.deleteUser = exports.getUsers = exports.updateUserProfile = exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
// 生成JWT token
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'defaultsecret';
    // 使用类型断言来解决类型问题
    return jsonwebtoken_1.default.sign({ id: String(id) }, secret);
};
// 用户注册
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        // 检查用户是否已存在
        const userExists = yield User_1.default.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: '用户已存在' });
        }
        // 创建新用户
        const user = yield User_1.default.create({
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
        }
        else {
            res.status(400).json({ message: '无效的用户数据' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.registerUser = registerUser;
// 用户登录
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log('用户登录请求:', { email });
        // 查找用户
        const user = yield User_1.default.findOne({ email });
        console.log('查找到的用户:', user);
        // 检查用户是否存在并验证密码
        if (user) {
            const isPasswordValid = yield user.comparePassword(password);
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
            }
            else {
                console.log('密码不正确');
                res.status(401).json({ message: '邮箱或密码不正确' });
            }
        }
        else {
            console.log('用户不存在');
            res.status(401).json({ message: '邮箱或密码不正确' });
        }
    }
    catch (error) {
        console.error('登录过程中发生错误:', error);
        res.status(500).json({ message: error.message });
    }
});
exports.loginUser = loginUser;
// 获取当前用户信息
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('-password');
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: '用户不存在' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCurrentUser = getCurrentUser;
// 更新用户信息
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
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
        const updatedUser = yield user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateUserProfile = updateUserProfile;
// 获取所有用户（仅管理员）
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find({}).select('-password');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUsers = getUsers;
// 删除用户（仅管理员）
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        yield user.deleteOne();
        res.json({ message: '用户已删除' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteUser = deleteUser;
// 更新用户角色（仅管理员）
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        // 更新用户角色
        user.role = req.body.role || user.role;
        const updatedUser = yield user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: '无效的用户ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.updateUserRole = updateUserRole;
//# sourceMappingURL=userController.js.map