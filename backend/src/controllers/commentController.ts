import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Activity from '../models/Activity';
import Registration from '../models/Registration';
import mongoose from 'mongoose';

// 创建新评论
export const createComment = async (req: Request, res: Response) => {
  try {
    const { activityId, content, rating } = req.body;

    // 查找活动
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    // 检查用户是否参加了该活动
    const registration = await Registration.findOne({
      user: req.user?._id,
      activity: activityId,
      status: { $in: ['confirmed', 'completed'] },
    });

    if (!registration) {
      return res.status(403).json({ message: '只有参加过活动的用户才能评论' });
    }

    // 检查用户是否已经评论过该活动
    const existingComment = await Comment.findOne({
      user: req.user?._id,
      activity: activityId,
    });

    if (existingComment) {
      return res.status(400).json({ message: '您已经评论过该活动' });
    }

    // 创建评论
    const comment = await Comment.create({
      user: req.user?._id,
      activity: activityId,
      content,
      rating,
    });

    // 填充用户信息
    await comment.populate('user', 'username');

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 获取活动的所有评论
export const getActivityComments = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;

    // 查找活动
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    const comments = await Comment.find({ activity: activityId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: '无效的活动ID' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 获取用户的所有评论
export const getUserComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ user: req.user?._id })
      .populate('activity', 'title date location')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 更新评论
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 检查是否是评论作者
    if (comment.user.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ message: '没有权限修改此评论' });
    }

    // 更新评论
    comment.content = content || comment.content;
    if (rating) comment.rating = rating;

    const updatedComment = await comment.save();
    await updatedComment.populate('user', 'username');

    res.json(updatedComment);
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: '无效的评论ID' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 删除评论
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 检查是否是评论作者或管理员
    if (
      comment.user.toString() !== req.user?._id?.toString() &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: '没有权限删除此评论' });
    }

    await comment.deleteOne();
    res.json({ message: '评论已删除' });
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: '无效的评论ID' });
    }
    res.status(500).json({ message: error.message });
  }
};