import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  description: string;
  location: string;
  date: Date;
  duration: number; // 活动持续时间（分钟）
  capacity: number; // 活动容量（人数）
  registeredCount: number; // 已报名人数
  price: number; // 价格
  category: string; // 活动类别
  image: string; // 活动图片URL
  organizer: mongoose.Types.ObjectId; // 组织者（用户ID）
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'; // 活动状态
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
  title: {
    type: String,
    required: [true, '活动标题是必需的'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, '活动描述是必需的'],
  },
  location: {
    type: String,
    required: [true, '活动地点是必需的'],
  },
  date: {
    type: Date,
    required: [true, '活动日期是必需的'],
  },
  duration: {
    type: Number,
    required: [true, '活动持续时间是必需的'],
    min: [0, '持续时间不能为负数'],
  },
  capacity: {
    type: Number,
    required: [true, '活动容量是必需的'],
    min: [1, '活动容量至少为1人'],
  },
  registeredCount: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, '活动价格是必需的'],
    min: [0, '价格不能为负数'],
  },
  category: {
    type: String,
    required: [true, '活动类别是必需的'],
    enum: ['足球', '篮球', '排球', '网球', '羽毛球', '乒乓球', '游泳', '健身', '瑜伽', '其他'],
  },
  image: {
    type: String,
    default: '',
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '组织者是必需的'],
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 更新时自动更新updatedAt字段
activitySchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

const Activity = mongoose.model<IActivity>('Activity', activitySchema);

export default Activity;