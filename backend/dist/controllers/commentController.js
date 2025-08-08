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
exports.deleteComment = exports.updateComment = exports.getUserComments = exports.getActivityComments = exports.createComment = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const Activity_1 = __importDefault(require("../models/Activity"));
const Registration_1 = __importDefault(require("../models/Registration"));
const mongoose_1 = __importDefault(require("mongoose"));
// 创建新评论
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { activityId, content, rating } = req.body;
        // 查找活动
        const activity = yield Activity_1.default.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }
        // 检查用户是否参加了该活动
        const registration = yield Registration_1.default.findOne({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            activity: activityId,
            status: { $in: ['confirmed', 'completed'] },
        });
        if (!registration) {
            return res.status(403).json({ message: '只有参加过活动的用户才能评论' });
        }
        // 检查用户是否已经评论过该活动
        const existingComment = yield Comment_1.default.findOne({
            user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            activity: activityId,
        });
        if (existingComment) {
            return res.status(400).json({ message: '您已经评论过该活动' });
        }
        // 创建评论
        const comment = yield Comment_1.default.create({
            user: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
            activity: activityId,
            content,
            rating,
        });
        // 填充用户信息
        yield comment.populate('user', 'username');
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createComment = createComment;
// 获取活动的所有评论
const getActivityComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activityId } = req.params;
        // 查找活动
        const activity = yield Activity_1.default.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: '活动不存在' });
        }
        const comments = yield Comment_1.default.find({ activity: activityId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        res.json(comments);
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: '无效的活动ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.getActivityComments = getActivityComments;
// 获取用户的所有评论
const getUserComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const comments = yield Comment_1.default.find({ user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
            .populate('activity', 'title date location')
            .sort({ createdAt: -1 });
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserComments = getUserComments;
// 更新评论
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { content, rating } = req.body;
        const comment = yield Comment_1.default.findById(id);
        if (!comment) {
            return res.status(404).json({ message: '评论不存在' });
        }
        // 检查是否是评论作者
        if (comment.user.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString())) {
            return res.status(403).json({ message: '没有权限修改此评论' });
        }
        // 更新评论
        comment.content = content || comment.content;
        if (rating)
            comment.rating = rating;
        const updatedComment = yield comment.save();
        yield updatedComment.populate('user', 'username');
        res.json(updatedComment);
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: '无效的评论ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.updateComment = updateComment;
// 删除评论
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const comment = yield Comment_1.default.findById(id);
        if (!comment) {
            return res.status(404).json({ message: '评论不存在' });
        }
        // 检查是否是评论作者或管理员
        if (comment.user.toString() !== ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) &&
            ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== 'admin') {
            return res.status(403).json({ message: '没有权限删除此评论' });
        }
        yield comment.deleteOne();
        res.json({ message: '评论已删除' });
    }
    catch (error) {
        if (error instanceof mongoose_1.default.Error.CastError) {
            return res.status(400).json({ message: '无效的评论ID' });
        }
        res.status(500).json({ message: error.message });
    }
});
exports.deleteComment = deleteComment;
//# sourceMappingURL=commentController.js.map