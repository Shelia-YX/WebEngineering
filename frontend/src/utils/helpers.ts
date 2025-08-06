import dayjs from 'dayjs';

// 格式化日期时间
export const formatDateTime = (dateString: string): string => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
};

// 格式化日期
export const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('YYYY-MM-DD');
};

// 格式化时间
export const formatTime = (dateString: string): string => {
  return dayjs(dateString).format('HH:mm');
};

// 格式化相对时间（例如：3小时前）
export const formatRelativeTime = (dateString: string): string => {
  const now = dayjs();
  const date = dayjs(dateString);
  const diffMinutes = now.diff(date, 'minute');
  
  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  
  const diffHours = now.diff(date, 'hour');
  if (diffHours < 24) return `${diffHours}小时前`;
  
  const diffDays = now.diff(date, 'day');
  if (diffDays < 30) return `${diffDays}天前`;
  
  const diffMonths = now.diff(date, 'month');
  if (diffMonths < 12) return `${diffMonths}个月前`;
  
  return `${now.diff(date, 'year')}年前`;
};

// 格式化金额
export const formatCurrency = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

// 截断文本
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// 生成随机ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// 深拷贝对象
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// 防抖函数
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

// 节流函数
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastInvoke = 0;
  
  return (...args: Parameters<F>): void => {
    const now = Date.now();
    const remaining = waitFor - (now - lastInvoke);
    
    if (remaining <= 0 || remaining > waitFor) {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastInvoke = now;
      func(...args);
    } else if (timeout === null) {
      timeout = setTimeout(() => {
        lastInvoke = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
};

// 获取文件扩展名
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// 检查文件类型是否为图片
export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
};

// 将File对象转换为Base64字符串（用于图片预览）
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// 模拟文件上传（实际项目中应替换为真实的上传逻辑）
export const uploadFile = async (file: File): Promise<string> => {
  // 模拟上传延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // 返回模拟的文件URL
  // 实际项目中，这里应该调用真实的文件上传API，并返回服务器返回的URL
  return URL.createObjectURL(file);
};

// 获取活动状态的中文名称
export const getActivityStatusText = (status: string): string => {
  switch (status) {
    case 'upcoming':
      return '即将开始';
    case 'ongoing':
      return '进行中';
    case 'completed':
      return '已结束';
    case 'canceled':
      return '已取消';
    default:
      return '未知状态';
  }
};

// 获取活动状态对应的颜色
export const getActivityStatusColor = (status: string): string => {
  switch (status) {
    case 'upcoming':
      return 'blue';
    case 'ongoing':
      return 'green';
    case 'completed':
      return 'gray';
    case 'canceled':
      return 'red';
    default:
      return 'default';
  }
};

// 获取报名状态的中文名称
export const getRegistrationStatusText = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return '已确认';
    case 'pending':
      return '待确认';
    case 'canceled':
      return '已取消';
    case 'rejected':
      return '已拒绝';
    default:
      return '未知状态';
  }
};

// 获取报名状态对应的颜色
export const getRegistrationStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'green';
    case 'pending':
      return 'orange';
    case 'canceled':
      return 'red';
    case 'rejected':
      return 'red';
    default:
      return 'default';
  }
};

// 获取支付状态的中文名称
export const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'paid':
      return '已支付';
    case 'unpaid':
      return '未支付';
    case 'refunded':
      return '已退款';
    default:
      return '未知状态';
  }
};

// 获取支付状态对应的颜色
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'green';
    case 'unpaid':
      return 'orange';
    case 'refunded':
      return 'gray';
    default:
      return 'default';
  }
};

// 获取用户角色的中文名称
export const getUserRoleText = (role: string): string => {
  switch (role) {
    case 'admin':
      return '管理员';
    case 'organizer':
      return '组织者';
    case 'user':
      return '普通用户';
    default:
      return '未知角色';
  }
};

// 获取用户角色对应的颜色
export const getUserRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'red';
    case 'organizer':
      return 'blue';
    case 'user':
      return 'green';
    default:
      return 'default';
  }
};