import express from 'express';
import {
  createComment,
  getActivityComments,
  getUserComments,
  updateComment,
  deleteComment
} from '../controllers/commentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// 公开路由
router.get('/activity/:activityId', getActivityComments);

// 需要登录的路由
router.post('/', protect, createComment);
router.get('/user', protect, getUserComments);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

export default router;