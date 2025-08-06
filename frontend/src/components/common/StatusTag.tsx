import React from 'react';
import { Tag } from 'antd';
import {
  getActivityStatusText,
  getActivityStatusColor,
  getRegistrationStatusText,
  getRegistrationStatusColor,
  getPaymentStatusText,
  getPaymentStatusColor,
  getUserRoleText,
  getUserRoleColor,
} from '../../utils';

type StatusType = 'activity' | 'registration' | 'payment' | 'role';

interface StatusTagProps {
  type: StatusType;
  status: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ type, status }) => {
  // 根据类型获取对应的文本和颜色
  const getStatusText = (type: StatusType, status: string) => {
    switch (type) {
      case 'activity':
        return getActivityStatusText(status);
      case 'registration':
        return getRegistrationStatusText(status);
      case 'payment':
        return getPaymentStatusText(status);
      case 'role':
        return getUserRoleText(status);
      default:
        return status;
    }
  };

  const getStatusColor = (type: StatusType, status: string) => {
    switch (type) {
      case 'activity':
        return getActivityStatusColor(status);
      case 'registration':
        return getRegistrationStatusColor(status);
      case 'payment':
        return getPaymentStatusColor(status);
      case 'role':
        return getUserRoleColor(status);
      default:
        return '#000000';
    }
  };

  return (
    <Tag color={getStatusColor(type, status)}>
      {getStatusText(type, status)}
    </Tag>
  );
};

export default StatusTag;