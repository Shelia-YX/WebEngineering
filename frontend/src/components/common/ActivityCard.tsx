import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Tag, Space, Button, Typography, Avatar } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { formatDateTime, formatCurrency, truncateText, getActivityStatusColor, getActivityStatusText } from '../../utils';

const { Meta } = Card;
const { Text } = Typography;

interface ActivityCardProps {
  activity: {
    _id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    category: string;
    capacity: number;
    registered: number;
    price: number;
    image: string;
    status: string;
    organizer: {
      _id: string;
      username: string;
    };
  };
  actions?: React.ReactNode[];
  showStatus?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, actions, showStatus = false }) => {
  const {
    _id,
    title,
    description,
    date,
    location,
    category,
    capacity,
    registered,
    price,
    image,
    status,
    organizer,
  } = activity;

  // 默认操作按钮
  const defaultActions = [
    <Link key="view" to={`/activities/${_id}`}>
      <Button type="primary" size="small">
        查看详情
      </Button>
    </Link>,
  ];

  return (
    <Card
      hoverable
      cover={
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img
            alt={title}
            src={image || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      }
      actions={actions || defaultActions}
    >
      <Meta
        title={
          <Space>
            <Link to={`/activities/${_id}`}>{title}</Link>
            {showStatus && (
              <Tag color={getActivityStatusColor(status)}>{getActivityStatusText(status)}</Tag>
            )}
          </Space>
        }
        description={truncateText(description, 100)}
      />
      <div style={{ marginTop: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text>
            <CalendarOutlined style={{ marginRight: 8 }} />
            {formatDateTime(date)}
          </Text>
          <Text>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            {location}
          </Text>
          <Text>
            <TeamOutlined style={{ marginRight: 8 }} />
            已报名: {registered}/{capacity}
          </Text>
          <Space>
            <Tag color="blue">{category}</Tag>
            <Tag color="green">{formatCurrency(price)}</Tag>
          </Space>
          <Text type="secondary">
            <UserOutlined style={{ marginRight: 8 }} />
            组织者: {organizer.username}
          </Text>
        </Space>
      </div>
    </Card>
  );
};

export default ActivityCard;