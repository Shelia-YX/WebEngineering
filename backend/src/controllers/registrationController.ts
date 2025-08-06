import { Request, Response } from 'express';
import Registration from '../models/Registration';
import Activity from '../models/Activity';
import mongoose from 'mongoose';

// 创建新报名
export const createRegistration = async (req: Request, res: Response) => {
  try {
    const { activityId, notes } = req.body;

    // 查找活动
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    // 检查活动是否已满
    if (activity.registeredCount >= activity.capacity) {
      return res.status(400).json({ message: '活动已满员' });
    }

    // 检查活动状态
    if (activity.status !== 'upcoming') {
      return res.status(400).json({ message: '只能报名即将开始的活动' });
    }

    // 创建报名
    const registration = await Registration.create({
      user: req.user?._id,
      activity: activityId,
      paymentAmount: activity.price,
      notes,
    });

    // 更新活动的报名人数
    activity.registeredCount += 1;
    await activity.save();

    res.status(201).json(registration);
  } catch (error: any) {
    // 处理重复报名错误
    if (error.code === 11000) {
      return res.status(400).json({ message: '您已经报名了此活动' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 获取用户的所有报名
export const getUserRegistrations = async (req: Request, res: Response) => {
  try {
    const registrations = await Registration.find({ user: req.user?._id })
      .populate('activity', 'title date location status')
      .sort({ registrationDate: -1 });

    res.json(registrations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 获取活动的所有报名
export const getActivityRegistrations = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;

    // 查找活动
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    // 检查是否是组织者或管理员
    if (
      activity.organizer.toString() !== req.user?._id?.toString() &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: '没有权限查看此活动的报名' });
    }

    const registrations = await Registration.find({ activity: activityId })
      .populate('user', 'username email')
      .sort({ registrationDate: -1 });

    res.json(registrations);
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: '无效的活动ID' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 更新报名状态
export const updateRegistrationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, attendanceStatus, paymentStatus } = req.body;

    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({ message: '报名记录不存在' });
    }

    // 获取活动信息
    const activity = await Activity.findById(registration.activity);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    // 检查是否是组织者、管理员或报名用户本人
    const isOrganizer = activity.organizer.toString() === req.user?._id?.toString();
    const isAdmin = req.user?.role === 'admin';
    const isUser = registration.user.toString() === req.user?._id?.toString();

    // 用户只能取消自己的报名
    if (status === 'cancelled' && isUser) {
      registration.status = status;

      // 如果用户取消报名，减少活动的报名人数
      if (registration.status === 'cancelled' && activity) {
        activity.registeredCount = Math.max(0, activity.registeredCount - 1);
        await activity.save();
      }
    }
    // 组织者或管理员可以更新所有状态
    else if (isOrganizer || isAdmin) {
      if (status) registration.status = status;
      if (attendanceStatus) registration.attendanceStatus = attendanceStatus;
      if (paymentStatus) {
        registration.paymentStatus = paymentStatus;
        
        // 如果支付状态变为已支付，设置支付日期
        if (paymentStatus === 'paid' && !registration.paymentDate) {
          registration.paymentDate = new Date();
        }
      }
    } else {
      return res.status(403).json({ message: '没有权限更新此报名' });
    }

    const updatedRegistration = await registration.save();
    res.json(updatedRegistration);
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: '无效的报名ID' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 删除报名
export const deleteRegistration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({ message: '报名记录不存在' });
    }

    // 获取活动信息
    const activity = await Activity.findById(registration.activity);

    // 检查是否是管理员或报名用户本人
    const isAdmin = req.user?.role === 'admin';
    const isUser = registration.user.toString() === req.user?._id?.toString();

    if (!isAdmin && !isUser) {
      return res.status(403).json({ message: '没有权限删除此报名' });
    }

    await registration.deleteOne();

    // 如果删除报名，减少活动的报名人数
    if (activity && registration.status !== 'cancelled') {
      activity.registeredCount = Math.max(0, activity.registeredCount - 1);
      await activity.save();
    }

    res.json({ message: '报名已删除' });
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: '无效的报名ID' });
    }
    res.status(500).json({ message: error.message });
  }
};