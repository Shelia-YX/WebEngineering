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
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const asyncHandler_1 = require("../middleware/asyncHandler");
// @desc    获取所有类别
// @route   GET /api/categories
// @access  Public
exports.getCategories = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield Category_1.default.find({}).sort({ name: 1 });
    res.json(categories);
}));
// @desc    获取单个类别
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield Category_1.default.findById(req.params.id);
    if (category) {
        res.json(category);
    }
    else {
        res.status(404);
        throw new Error('类别不存在');
    }
}));
// @desc    创建类别
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    const categoryExists = yield Category_1.default.findOne({ name });
    if (categoryExists) {
        res.status(400);
        throw new Error('类别已存在');
    }
    const category = yield Category_1.default.create({
        name,
        description,
    });
    if (category) {
        res.status(201).json(category);
    }
    else {
        res.status(400);
        throw new Error('无效的类别数据');
    }
}));
// @desc    更新类别
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    const category = yield Category_1.default.findById(req.params.id);
    if (category) {
        // 检查新名称是否已被其他类别使用
        if (name && name !== category.name) {
            const categoryExists = yield Category_1.default.findOne({ name });
            if (categoryExists) {
                res.status(400);
                throw new Error('类别名称已被使用');
            }
        }
        category.name = name || category.name;
        category.description = description !== undefined ? description : category.description;
        const updatedCategory = yield category.save();
        res.json(updatedCategory);
    }
    else {
        res.status(404);
        throw new Error('类别不存在');
    }
}));
// @desc    删除类别
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield Category_1.default.findById(req.params.id);
    if (category) {
        yield Category_1.default.deleteOne({ _id: category._id });
        res.json({ message: '类别已删除' });
    }
    else {
        res.status(404);
        throw new Error('类别不存在');
    }
}));
//# sourceMappingURL=categoryController.js.map