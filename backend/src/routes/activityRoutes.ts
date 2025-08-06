import express from 'express';
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getUserActivities
} from '../controllers/activityController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// 公开路由
router.get('/', getActivities);

// 需要登录的路由
router.post('/', protect, createActivity);
router.get('/user/myactivities', protect, getUserActivities);

// 管理员路由
router.get('/admin', protect, admin, getActivities);

// 需要ID参数的路由（放在最后，避免路径冲突）
router.get('/:id', getActivityById);
router.put('/:id', protect, updateActivity);
router.delete('/:id', protect, deleteActivity);

export default router;