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
exports.getUserActivities = exports.deleteActivity = exports.updateActivity = exports.getActivityById = exports.getActivities = exports.createActivity = void 0;
const Activity_1 = __importDefault(require("../models/Activity"));
const mongoose_1 = __importDefault(require("mongoose"));
// 创建新活动
const createActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, location, date, duration, capacity, price, category, image, } = req.body;
        // 创建新活动
        const activity = yield Activity_1.default.create({
            title,
            description,
            location,
            date,
            duration,
            capacity,
            price,
            category,
            image,
            organizer: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
        });
        if (activity) {
            res.status(201).json(activity);
        }
        else {
            res.status(400).json({ message: '无效的活动数据' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createActivity = createActivity;
// 获取所有活动
const getActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, status, organizer, search } = req.query;
        // 构建查询条件
        const query = {};
        if (category) {
            query.category = category;
        }
        if (status) {
            query.status = status;
        }
        if (organizer) {
            query.organizer = organizer;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ];
        }
        // 分页
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // 查询活动并填充组织者信息
        const activities = yield Activity_1.default.find(query)
            .populate('organizer', 'username email')
            .sort({ date: 1 })
            .skip(skip)
            .limit(limit);
        // 获取总数
        const total = yield Activity_1.default.countDocuments(query);
        res.json({
            activities,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getActivities = getActivities;
// 获取单个活动详情
const getActivityById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield Activity_1.default.findById(req.params.id).populate('organizer', 'username email');
        if (activity) {
            res.json(activity);
        }
        else {
            res.status(404).json({ message: '活动不存在' });
        }
    }
    catch (error) {
        // 检查是否是无效的ID格式
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: '无效的活动ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.getActivityById = getActivityById;
// 更新活动
const updateActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const activity = yield Activity_1.default.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }
        // 检查是否是组织者或管理员
        if (activity.organizer.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) &&
            ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== 'admin') {
            return res.status(403).json({ message: '没有权限修改此活动' });
        }
        // 更新活动信息
        const { title, description, location, date, duration, capacity, price, category, image, status, } = req.body;
        activity.title = title || activity.title;
        activity.description = description || activity.description;
        activity.location = location || activity.location;
        activity.date = date || activity.date;
        activity.duration = duration || activity.duration;
        activity.capacity = capacity || activity.capacity;
        activity.price = price || activity.price;
        activity.category = category || activity.category;
        activity.image = image || activity.image;
        activity.status = status || activity.status;
        const updatedActivity = yield activity.save();
        res.json(updatedActivity);
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: '无效的活动ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.updateActivity = updateActivity;
// 删除活动
const deleteActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const activity = yield Activity_1.default.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }
        // 检查是否是组织者或管理员
        if (activity.organizer.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) &&
            ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== 'admin') {
            return res.status(403).json({ message: '没有权限删除此活动' });
        }
        yield activity.deleteOne();
        res.json({ message: '活动已删除' });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: '无效的活动ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.deleteActivity = deleteActivity;
// 获取用户组织的活动
const getUserActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const activities = yield Activity_1.default.find({ organizer: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }).sort({
            date: 1,
        });
        res.json(activities);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserActivities = getUserActivities;
//# sourceMappingURL=activityController.js.map