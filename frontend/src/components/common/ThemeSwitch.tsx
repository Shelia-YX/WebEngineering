import React from 'react';
import { Button, Tooltip, Badge } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeSwitchProps {
  showText?: boolean;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ showText = false }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Badge status={theme === 'light' ? 'default' : 'processing'} dot>
      <Tooltip title={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}>
        <Button 
          type="text" 
          icon={theme === 'light' ? <BulbOutlined /> : <BulbFilled />} 
          onClick={toggleTheme}
          style={{ 
            color: theme === 'light' ? undefined : '#fff',
            fontWeight: 'bold'
          }}
          className={`theme-switch-btn ${theme}-theme`}
        >
          {showText && (theme === 'light' ? '暗色模式' : '亮色模式')}
        </Button>
      </Tooltip>
    </Badge>
  );
};

export default ThemeSwitch;