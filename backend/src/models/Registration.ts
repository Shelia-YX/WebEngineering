import mongoose, { Document, Schema } from 'mongoose';

export interface IRegistration extends Document {
  user: mongoose.Types.ObjectId;
  activity: mongoose.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentAmount: number;
  paymentDate?: Date;
  registrationDate: Date;
  attendanceStatus?: 'attended' | 'absent';
  notes?: string;
}

const registrationSchema = new Schema<IRegistration>({
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
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  paymentAmount: {
    type: Number,
    required: [true, '支付金额是必需的'],
  },
  paymentDate: {
    type: Date,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  attendanceStatus: {
    type: String,
    enum: ['attended', 'absent'],
  },
  notes: {
    type: String,
  },
});

// 创建复合索引确保用户不能重复报名同一活动
registrationSchema.index({ user: 1, activity: 1 }, { unique: true });

const Registration = mongoose.model<IRegistration>('Registration', registrationSchema);

export default Registration;