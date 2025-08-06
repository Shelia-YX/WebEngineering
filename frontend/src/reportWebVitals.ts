// 从web-vitals导入具体的函数
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

// 定义ReportHandler类型
type ReportHandler = (metric: {
  name: string;
  delta: number;
  id: string;
  value: number;
}) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // 直接使用导入的函数
    try {
      onCLS(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
      // 注意：web-vitals 5.0.3版本不再支持onFID，已被onINP替代
    } catch (error) {
      console.error('Web Vitals加载失败:', error);
    }
  }
};

export default reportWebVitals;