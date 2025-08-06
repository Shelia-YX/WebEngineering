import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, DatePicker } from 'antd';
import { UserOutlined, CalendarOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';
import { useUsers, useActivities, useRegistrations } from '../../hooks';
import { formatCurrency } from '../../utils';

const { RangePicker } = DatePicker;

interface StatisticData {
  totalUsers: number;
  totalActivities: number;
  totalRegistrations: number;
  totalRevenue: number;
  pendingActivities: number;
  pendingRegistrations: number;
  activeUsers: number;
}

const StatisticsPanel: React.FC = () => {
  const { fetchUserStats } = useUsers();
  const { fetchActivityStats } = useActivities();
  const { fetchRegistrationStats } = useRegistrations();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatisticData>({
    totalUsers: 0,
    totalActivities: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    pendingActivities: 0,
    pendingRegistrations: 0,
    activeUsers: 0,
  });
  
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0].format('YYYY-MM-DD');
        filters.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      const [userStats, activityStats, registrationStats] = await Promise.all([
        fetchUserStats(filters),
        fetchActivityStats(filters),
        fetchRegistrationStats(filters),
      ]);
      
      setStats({
        totalUsers: userStats?.totalUsers || 0,
        activeUsers: userStats?.activeUsers || 0,
        totalActivities: activityStats?.totalActivities || 0,
        pendingActivities: activityStats?.pendingActivities || 0,
        totalRegistrations: registrationStats?.totalRegistrations || 0,
        pendingRegistrations: registrationStats?.pendingRegistrations || 0,
        totalRevenue: registrationStats?.totalRevenue || 0,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  // 处理日期范围变化
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <RangePicker 
          onChange={handleDateRangeChange}
          placeholder={['开始日期', '结束日期']}
        />
      </div>
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* 用户统计 */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="总用户数" 
                value={stats.totalUsers} 
                prefix={<UserOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="活跃用户" 
                value={stats.activeUsers} 
                prefix={<UserOutlined />} 
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          
          {/* 活动统计 */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="总活动数" 
                value={stats.totalActivities} 
                prefix={<CalendarOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="待审核活动" 
                value={stats.pendingActivities} 
                prefix={<CalendarOutlined />} 
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          
          {/* 报名统计 */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="总报名数" 
                value={stats.totalRegistrations} 
                prefix={<TeamOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="待确认报名" 
                value={stats.pendingRegistrations} 
                prefix={<TeamOutlined />} 
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          
          {/* 收入统计 */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic 
                title="总收入" 
                value={stats.totalRevenue} 
                prefix={<span style={{ fontSize: 16 }}>¥</span>} 
                valueStyle={{ color: '#cf1322' }}
                formatter={(value) => formatCurrency(value as number).replace('¥', '')}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default StatisticsPanel;