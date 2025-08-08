"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activityController_1 = require("../controllers/activityController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// 公开路由
router.get('/', activityController_1.getActivities);
// 需要登录的路由
router.post('/', authMiddleware_1.protect, activityController_1.createActivity);
router.get('/user/myactivities', authMiddleware_1.protect, activityController_1.getUserActivities);
// 管理员路由
router.get('/admin', authMiddleware_1.protect, authMiddleware_1.admin, activityController_1.getActivities);
// 需要ID参数的路由（放在最后，避免路径冲突）
router.get('/:id', activityController_1.getActivityById);
router.put('/:id', authMiddleware_1.protect, activityController_1.updateActivity);
router.delete('/:id', authMiddleware_1.protect, activityController_1.deleteActivity);
exports.default = router;
//# sourceMappingURL=activityRoutes.js.map