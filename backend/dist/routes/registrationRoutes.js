"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const express_1 = __importDefault(require("express"));
const registrationController_1 = require("../controllers/registrationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Registration_1 = __importDefault(require("../models/Registration"));
const router = express_1.default.Router();
// 需要登录的路由
router.post('/', authMiddleware_1.protect, registrationController_1.createRegistration);
router.get('/user', authMiddleware_1.protect, registrationController_1.getUserRegistrations);
router.get('/activity/:activityId', authMiddleware_1.protect, registrationController_1.getActivityRegistrations);
router.put('/:id', authMiddleware_1.protect, registrationController_1.updateRegistrationStatus);
router.delete('/:id', authMiddleware_1.protect, registrationController_1.deleteRegistration);
// 更新支付状态的路由
router.put('/:id/payment', authMiddleware_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        const registration = yield Registration_1.default.findById(id);
        if (!registration) {
            return res.status(404).json({ message: '报名记录不存在' });
        }
        // 获取活动信息
        const activity = yield (yield Promise.resolve().then(() => __importStar(require('../models/Activity')))).default.findById(registration.activity);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }
        // 检查是否是组织者或管理员
        const isOrganizer = activity.organizer.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString());
        const isAdmin = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) === 'admin';
        if (isOrganizer || isAdmin) {
            registration.paymentStatus = paymentStatus;
            // 如果支付状态变为已支付，设置支付日期
            if (paymentStatus === 'paid' && !registration.paymentDate) {
                registration.paymentDate = new Date();
            }
        }
        else {
            return res.status(403).json({ message: '没有权限更新此报名的支付状态' });
        }
        const updatedRegistration = yield registration.save();
        res.json(updatedRegistration);
    }
    catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: '无效的报名ID' });
        }
        res.status(500).json({ message: error.message });
    }
}));
// 管理员获取所有报名
router.get('/admin', authMiddleware_1.protect, authMiddleware_1.admin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 分页
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // 构建查询条件
        const query = {};
        // 如果有搜索参数，添加搜索条件
        if (req.query.search) {
            const search = req.query.search;
            // 由于需要搜索关联表的字段，我们需要使用聚合管道或者先获取数据后过滤
            // 这里使用简单的方式，先获取所有数据，然后在应用层过滤
            // 在实际生产环境中，应该使用更高效的方式
        }
        // 查询报名并填充用户和活动信息
        const registrations = yield Registration_1.default.find(query)
            .populate('user', 'username email phone role')
            .populate('activity', 'title date location status')
            .sort({ registrationDate: -1 })
            .skip(skip)
            .limit(limit);
        // 如果有搜索参数，在应用层过滤
        let filteredRegistrations = registrations;
        if (req.query.search) {
            const search = req.query.search.toLowerCase();
            filteredRegistrations = registrations.filter(reg => {
                var _a, _b, _c, _d, _e, _f;
                const user = reg.user;
                const activity = reg.activity;
                return (((_a = user.username) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search)) ||
                    ((_b = user.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search)) ||
                    ((_c = activity.title) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search)) ||
                    ((_d = activity.location) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search)) ||
                    ((_e = reg.status) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(search)) ||
                    ((_f = reg.paymentStatus) === null || _f === void 0 ? void 0 : _f.toLowerCase().includes(search)));
            });
        }
        // 获取总数
        const total = filteredRegistrations.length;
        res.json({
            registrations: filteredRegistrations,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
//# sourceMappingURL=registrationRoutes.js.map