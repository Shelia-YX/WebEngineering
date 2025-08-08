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
exports.deleteRegistration = exports.updateRegistrationStatus = exports.getActivityRegistrations = exports.getUserRegistrations = exports.createRegistration = void 0;
const Registration_1 = __importDefault(require("../models/Registration"));
const Activity_1 = __importDefault(require("../models/Activity"));
const mongoose_1 = __importDefault(require("mongoose"));
// 创建新报名
const createRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { activityId, notes } = req.body;
        // 查找活动
        const activity = yield Activity_1.default.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }
        // 检查活动是否已满
        if (activity.registeredCount >= activity.capacity) {
            return res.status(400).json({ message: '活动已满员' });
        }
        // 检查活动状态
        if (activity.status !== 'upcoming') {
            return res.status(400).json({ message: '只能报名即将开始的活动' });
        }
        // 创建报名
        const registration = yield Registration_1.default.create({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            activity: activityId,
            paymentAmount: activity.price,
            notes,
        });
        // 更新活动的报名人数
        activity.registeredCount += 1;
        yield activity.save();
        res.status(201).json(registration);
    }
    catch (error) {
        // 处理重复报名错误
        if (error.code === 11000) {
            return res.status(400).json({ message: '您已经报名了此活动' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.createRegistration = createRegistration;
// 获取用户的所有报名
const getUserRegistrations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const registrations = yield Registration_1.default.find({ user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
            .populate('activity', 'title date location status')
            .sort({ registrationDate: -1 });
        res.json(registrations);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserRegistrations = getUserRegistrations;
// 获取活动的所有报名
const getActivityRegistrations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { activityId } = req.params;
        // 查找活动
        const activity = yield Activity_1.default.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }
        // 检查是否是组织者或管理员
        if (activity.organizer.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) &&
            ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== 'admin') {
            return res.status(403).json({ message: '没有权限查看此活动的报名' });
        }
        const registrations = yield Registration_1.default.find({ activity: activityId })
            .populate('user', 'username email')
            .sort({ registrationDate: -1 });
        res.json(registrations);
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: '无效的活动ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.getActivityRegistrations = getActivityRegistrations;
// 更新报名状态
const updateRegistrationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const { id } = req.params;
        const { status, attendanceStatus, paymentStatus } = req.body;
        const registration = yield Registration_1.default.findById(id);
        if (!registration) {
            return res.status(404).json({ message: '报名记录不存在' });
        }
        // 获取活动信息
        const activity = yield Activity_1.default.findById(registration.activity);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }
        // 检查是否是组织者、管理员或报名用户本人
        const isOrganizer = activity.organizer.toString() === ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString());
        const isAdmin = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) === 'admin';
        const isUser = registration.user.toString() === ((_e = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id) === null || _e === void 0 ? void 0 : _e.toString());
        // 用户只能取消自己的报名
        if (status === 'cancelled' && isUser) {
            registration.status = status;
            // 如果用户取消报名，减少活动的报名人数
            if (registration.status === 'cancelled' && activity) {
                activity.registeredCount = Math.max(0, activity.registeredCount - 1);
                yield activity.save();
            }
        }
        // 组织者或管理员可以更新所有状态
        else if (isOrganizer || isAdmin) {
            if (status)
                registration.status = status;
            if (attendanceStatus)
                registration.attendanceStatus = attendanceStatus;
            if (paymentStatus) {
                registration.paymentStatus = paymentStatus;
                // 如果支付状态变为已支付，设置支付日期
                if (paymentStatus === 'paid' && !registration.paymentDate) {
                    registration.paymentDate = new Date();
                }
            }
        }
        else {
            return res.status(403).json({ message: '没有权限更新此报名' });
        }
        const updatedRegistration = yield registration.save();
        res.json(updatedRegistration);
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: '无效的报名ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.updateRegistrationStatus = updateRegistrationStatus;
// 删除报名
const deleteRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const registration = yield Registration_1.default.findById(id);
        if (!registration) {
            return res.status(404).json({ message: '报名记录不存在' });
        }
        // 获取活动信息
        const activity = yield Activity_1.default.findById(registration.activity);
        // 检查是否是管理员或报名用户本人
        const isAdmin = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin';
        const isUser = registration.user.toString() === ((_c = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id) === null || _c === void 0 ? void 0 : _c.toString());
        if (!isAdmin && !isUser) {
            return res.status(403).json({ message: '没有权限删除此报名' });
        }
        yield registration.deleteOne();
        // 如果删除报名，减少活动的报名人数
        if (activity && registration.status !== 'cancelled') {
            activity.registeredCount = Math.max(0, activity.registeredCount - 1);
            yield activity.save();
        }
        res.json({ message: '报名已删除' });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: '无效的报名ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.deleteRegistration = deleteRegistration;
//# sourceMappingURL=registrationController.js.map