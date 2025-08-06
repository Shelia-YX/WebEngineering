import { Request, Response } from 'express';
import Activity, { IActivity } from '../models/Activity';
import mongoose from 'mongoose';

// 创建新活动
export const createActivity = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      location,
      date,
      duration,
      capacity,
      price,
      category,
      image,
    } = req.body;

    // 创建新活动
    const activity = await Activity.create({
      title,
      description,
      location,
      date,
      duration,
      capacity,
      price,
      category,
      image,
      organizer: req.user?._id,
    });

    if (activity) {
      res.status(201).json(activity);
    } else {
      res.status(400).json({ message: '无效的活动数据' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 获取所有活动
export const getActivities = async (req: Request, res: Response) => {
  try {
    const { category, status, organizer, search } = req.query;
    
    // 构建查询条件
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (organizer) {
      query.organizer = organizer;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // 分页
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 查询活动并填充组织者信息
    const activities = await Activity.find(query)
      .populate('organizer', 'username email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    // 获取总数
    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个活动详情
export const getActivityById = async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findById(req.params.id).populate(
      'organizer',
      'username email'
    );

    if (activity) {
      res.json(activity);
    } else {
      res.status(404).json({ message: '活动不存在' });
    }
  } catch (error: any) {
    // 检查是否是无效的ID格式
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: '无效的活动ID' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 更新活动
export const updateActivity = async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    // 检查是否是组织者或管理员
    if (
      activity.organizer.toString() !== req.user?._id?.toString() &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: '没有权限修改此活动' });
    }

    // 更新活动信息
    const {
      title,
      description,
      location,
      date,
      duration,
      capacity,
      price,
      category,
      image,
      status,
    } = req.body;

    activity.title = title || activity.title;
    activity.description = description || activity.description;
    activity.location = location || activity.location;
    activity.date = date || activity.date;
    activity.duration = duration || activity.duration;
    activity.capacity = capacity || activity.capacity;
    activity.price = price || activity.price;
    activity.category = category || activity.category;
    activity.image = image || activity.image;
    activity.status = status || activity.status;

    const updatedActivity = await activity.save();
    res.json(updatedActivity);
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: '无效的活动ID' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 删除活动
export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: '活动不存在' });
    }

    // 检查是否是组织者或管理员
    if (
      activity.organizer.toString() !== req.user?._id?.toString() &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: '没有权限删除此活动' });
    }

    await activity.deleteOne();
    res.json({ message: '活动已删除' });
  } catch (error: any) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: '无效的活动ID' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 获取用户组织的活动
export const getUserActivities = async (req: Request, res: Response) => {
  try {
    const activities = await Activity.find({ organizer: req.user?._id }).sort({
      date: 1,
    });

    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};