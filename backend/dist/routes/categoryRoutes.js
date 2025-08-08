"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// 获取所有类别 / 创建新类别
router.route('/')
    .get(categoryController_1.getCategories)
    .post(authMiddleware_1.protect, authMiddleware_1.admin, categoryController_1.createCategory);
// 获取/更新/删除单个类别
router.route('/:id')
    .get(categoryController_1.getCategoryById)
    .put(authMiddleware_1.protect, authMiddleware_1.admin, categoryController_1.updateCategory)
    .delete(authMiddleware_1.protect, authMiddleware_1.admin, categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map