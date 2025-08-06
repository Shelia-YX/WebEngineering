import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

// 配置dayjs
dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

// 格式化日期时间
export const formatDateTime = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm') => {
  return dayjs(date).format(format);
};

// 格式化日期
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD') => {
  return dayjs(date).format(format);
};

// 格式化时间
export const formatTime = (date: string | Date, format: string = 'HH:mm:ss') => {
  return dayjs(date).format(format);
};

// 相对时间（例如：3小时前）
export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow();
};

// 格式化金额
export const formatCurrency = (amount: number) => {
  return `¥${amount.toFixed(2)}`;
};

// 截断文本
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// 生成随机ID
export const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// 深拷贝
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (obj instanceof Object) {
    const copy = {} as Record<string, unknown>;
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as Record<string, unknown>)[key]);
    });
    return copy as T;
  }

  return obj;
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// 获取文件扩展名
export const getFileExtension = (filename: string) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// 检查是否为图片文件
export const isImageFile = (file: File) => {
  const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return acceptedImageTypes.includes(file.type);
};

// 将文件转换为Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// 模拟文件上传
export const mockUploadFile = (file: File, progressCallback?: (percent: number) => void): Promise<string> => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progressCallback) progressCallback(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        // 模拟上传成功后返回的URL
        const mockUrl = `https://example.com/uploads/${file.name}`;
        resolve(mockUrl);
      }
    }, 300);
  });
};

// 获取活动状态中文名称
export const getActivityStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已批准',
    'rejected': '已拒绝',
    'cancelled': '已取消',
    'completed': '已结束',
    'ongoing': '进行中',
  };
  return statusMap[status] || status;
};

// 获取活动状态对应的颜色
export const getActivityStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'pending': '#faad14',
    'approved': '#52c41a',
    'rejected': '#f5222d',
    'cancelled': '#bfbfbf',
    'completed': '#1890ff',
    'ongoing': '#13c2c2',
  };
  return colorMap[status] || '#000000';
};

// 获取报名状态中文名称
export const getRegistrationStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待审核',
    'approved': '已批准',
    'rejected': '已拒绝',
    'cancelled': '已取消',
    'attended': '已参加',
    'absent': '未参加',
  };
  return statusMap[status] || status;
};

// 获取报名状态对应的颜色
export const getRegistrationStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'pending': '#faad14',
    'approved': '#52c41a',
    'rejected': '#f5222d',
    'cancelled': '#bfbfbf',
    'attended': '#1890ff',
    'absent': '#ff7a45',
  };
  return colorMap[status] || '#000000';
};

// 获取支付状态中文名称
export const getPaymentStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'unpaid': '未支付',
    'paid': '已支付',
    'refunded': '已退款',
    'failed': '支付失败',
  };
  return statusMap[status] || status;
};

// 获取支付状态对应的颜色
export const getPaymentStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'unpaid': '#faad14',
    'paid': '#52c41a',
    'refunded': '#1890ff',
    'failed': '#f5222d',
  };
  return colorMap[status] || '#000000';
};

// 获取用户角色中文名称
export const getUserRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    'user': '普通用户',
    'organizer': '组织者',
    'admin': '管理员',
  };
  return roleMap[role] || role;
};

// 获取用户角色对应的颜色
export const getUserRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    'user': '#1890ff',
    'organizer': '#13c2c2',
    'admin': '#722ed1',
  };
  return colorMap[role] || '#000000';
};