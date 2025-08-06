import React from 'react';
import { Typography, Space, Divider, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface PageTitleProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5;
  divider?: boolean;
  onBack?: () => void | Promise<void>;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  extra,
  level = 2,
  divider = true,
  onBack,
}) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {onBack && (
            <Button 
              type="text" 
              icon={<LeftOutlined />} 
              onClick={onBack} 
              style={{ marginRight: 8, marginBottom: 8 }}
            >
              返回
            </Button>
          )}
          <Title level={level} style={{ marginBottom: subtitle ? 8 : 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Typography.Text type="secondary">{subtitle}</Typography.Text>
          )}
        </div>
        {extra && <Space>{extra}</Space>}
      </div>
      {divider && <Divider style={{ marginTop: 16 }} />}
    </div>
  );
};

export default PageTitle;