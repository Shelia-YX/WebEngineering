"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentController_1 = require("../controllers/commentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// 公开路由
router.get('/activity/:activityId', commentController_1.getActivityComments);
// 需要登录的路由
router.post('/', authMiddleware_1.protect, commentController_1.createComment);
router.get('/user', authMiddleware_1.protect, commentController_1.getUserComments);
router.put('/:id', authMiddleware_1.protect, commentController_1.updateComment);
router.delete('/:id', authMiddleware_1.protect, commentController_1.deleteComment);
exports.default = router;
//# sourceMappingURL=commentRoutes.js.map