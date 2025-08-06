import { message as antdMessage, App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

// 创建一个静态消息实例，用于在非组件环境中使用
let messageInstance: MessageInstance | null = null;

// 初始化消息实例
export const initMessage = (staticMessage: MessageInstance) => {
  messageInstance = staticMessage;
};

// 获取消息实例
export const message = {
  success: (content: string) => {
    if (messageInstance) {
      return messageInstance.success(content);
    }
    return antdMessage.success(content);
  },
  error: (content: string) => {
    if (messageInstance) {
      return messageInstance.error(content);
    }
    return antdMessage.error(content);
  },
  warning: (content: string) => {
    if (messageInstance) {
      return messageInstance.warning(content);
    }
    return antdMessage.warning(content);
  },
  info: (content: string) => {
    if (messageInstance) {
      return messageInstance.info(content);
    }
    return antdMessage.info(content);
  },
  loading: (content: string) => {
    if (messageInstance) {
      return messageInstance.loading(content);
    }
    return antdMessage.loading(content);
  },
};