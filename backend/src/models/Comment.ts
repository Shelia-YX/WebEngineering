import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  activity: mongoose.Types.ObjectId;
  content: string;
  rating?: number; // 评分 1-5
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必需的'],
  },
  activity: {
    type: Schema.Types.ObjectId,
    ref: 'Activity',
    required: [true, '活动ID是必需的'],
  },
  content: {
    type: String,
    required: [true, '评论内容是必需的'],
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
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
commentSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;