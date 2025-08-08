"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// 公开路由
router.post('/register', userController_1.registerUser);
router.post('/login', userController_1.loginUser);
// 需要登录的路由
router.get('/profile', authMiddleware_1.protect, userController_1.getCurrentUser);
router.put('/profile', authMiddleware_1.protect, userController_1.updateUserProfile);
// 管理员路由
router.get('/', authMiddleware_1.protect, authMiddleware_1.admin, userController_1.getUsers);
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.admin, userController_1.deleteUser);
router.put('/:id/role', authMiddleware_1.protect, authMiddleware_1.admin, userController_1.updateUserRole);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map