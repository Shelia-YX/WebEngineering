import { Request, Response } from 'express';
import Category from '../models/Category';
import { asyncHandler } from '../middleware/asyncHandler';

// @desc    获取所有类别
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories);
});

// @desc    获取单个类别
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('类别不存在');
  }
});

// @desc    创建类别
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400);
    throw new Error('类别已存在');
  }

  const category = await Category.create({
    name,
    description,
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error('无效的类别数据');
  }
});

// @desc    更新类别
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    // 检查新名称是否已被其他类别使用
    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        res.status(400);
        throw new Error('类别名称已被使用');
      }
    }

    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('类别不存在');
  }
});

// @desc    删除类别
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await Category.deleteOne({ _id: category._id });
    res.json({ message: '类别已删除' });
  } else {
    res.status(404);
    throw new Error('类别不存在');
  }
});