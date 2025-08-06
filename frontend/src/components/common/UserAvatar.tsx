import React from 'react';
import { Avatar, Tooltip } from 'antd';
import type { AvatarProps } from 'antd/lib/avatar';
import { UserOutlined } from '@ant-design/icons';

interface UserInfo {
  username?: string;
  avatar?: string;
  [key: string]: any;
}

interface UserAvatarProps extends AvatarProps {
  username?: string;
  avatar?: string;
  user?: UserInfo;
  showTooltip?: boolean;
  tooltipTitle?: string;
  size?: number | 'large' | 'small' | 'default';
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  avatar,
  user,
  showTooltip = true,
  tooltipTitle,
  size = 'default',
  ...props
}) => {
  // 如果提供了user对象，从中获取username和avatar
  const displayName = user?.username || username;
  const displayAvatar = user?.avatar || avatar;
  const avatarComponent = (
    <Avatar
      size={size}
      src={displayAvatar}
      icon={!displayAvatar && <UserOutlined />}
      alt={displayName || 'User'}
      {...props}
    >
      {!displayAvatar && displayName ? displayName.charAt(0).toUpperCase() : null}
    </Avatar>
  );

  if (showTooltip && displayName) {
    return (
      <Tooltip title={tooltipTitle || displayName}>
        {avatarComponent}
      </Tooltip>
    );
  }

  return avatarComponent;
};

export default UserAvatar;