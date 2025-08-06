import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Card, Row, Col, Button, Carousel, Tag, Spin, Empty } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Paragraph } = Typography;

interface Activity {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  capacity: number;
  registeredCount: number;
  price: number;
  category: string;
  image: string;
  status: string;
}

const Home = () => {
  const [featuredActivities, setFeaturedActivities] = useState<Activity[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        console.log('开始获取活动数据，API URL:', import.meta.env.VITE_API_URL);
        
        // 使用fetch API代替axios
        // 获取精选活动（按报名人数排序）
        const featuredUrl = `${import.meta.env.VITE_API_URL}/api/activities?limit=4&sort=-registeredCount`;
        console.log('请求精选活动URL:', featuredUrl);
        const featuredResponse = await fetch(featuredUrl);
        const featuredData = await featuredResponse.json();
        
        // 获取即将开始的活动（按日期排序）
        const upcomingUrl = `${import.meta.env.VITE_API_URL}/api/activities?limit=6&sort=date&status=upcoming`;
        console.log('请求即将开始活动URL:', upcomingUrl);
        const upcomingResponse = await fetch(upcomingUrl);
        const upcomingData = await upcomingResponse.json();
        
        console.log('获取活动数据成功:', { featured: featuredData, upcoming: upcomingData });
        setFeaturedActivities(featuredData.activities);
        setUpcomingActivities(upcomingData.activities);
        setLoading(false);
      } catch (error: any) {
        console.error('获取活动失败', error);
        console.error('错误详情:', error.message);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取活动类别对应的颜色
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      '足球': 'green',
      '篮球': 'orange',
      '排球': 'blue',
      '网球': 'purple',
      '羽毛球': 'cyan',
      '乒乓球': 'magenta',
      '游泳': 'geekblue',
      '跑步': 'red',
      '健身': 'volcano',
      '瑜伽': 'gold',
      '其他': 'default',
    };
    
    return categoryColors[category] || 'default';
  };

  // 轮播图内容
  const carouselItems = [
    {
      title: '参与体育活动，享受健康生活',
      description: '我们提供各种各样的体育活动，满足不同人群的需求，让运动成为生活的一部分。',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      action: '/activities',
    }
  ];

  return (
    <div className="container">
      <Carousel autoplay style={{ marginBottom: '40px' }}>
        {carouselItems.map((item, index) => (
          <div key={index}>
            <div
              style={{
                height: '400px',
                color: '#fff',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  filter: 'brightness(0.7)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '60px',
                  left: '60px',
                  maxWidth: '600px',
                }}
              >
                <Title level={2} style={{ color: '#fff', marginBottom: '16px' }}>
                  {item.title}
                </Title>
                <Paragraph style={{ color: '#fff', fontSize: '16px', marginBottom: '24px' }}>
                  {item.description}
                </Paragraph>
                <Link to={item.action}>
                  <Button type="primary" size="large">
                    {item.action === '/activities' ? '浏览活动' : '创建活动'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* 精选活动 */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0 }}>
            精选活动
          </Title>
          <Link to="/activities">
            <Button type="link">查看全部</Button>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : featuredActivities.length > 0 ? (
          <Row gutter={[16, 16]}>
            {featuredActivities.map((activity) => (
              <Col xs={24} sm={12} md={6} key={activity._id}>
                <Link to={`/activities/${activity._id}`} style={{ textDecoration: 'none' }}>
                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          height: '160px',
                          backgroundImage: `url(${activity.image || 'https://via.placeholder.com/300x160?text=No+Image'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    }
                  >
                    <Tag color={getCategoryColor(activity.category)} style={{ marginBottom: '8px' }}>
                      {activity.category}
                    </Tag>
                    <Card.Meta
                      title={activity.title}
                      description={
                        <>
                          <div style={{ marginBottom: '8px', color: 'rgba(0, 0, 0, 0.65)' }}>
                            <CalendarOutlined style={{ marginRight: '8px' }} />
                            {formatDate(activity.date)}
                          </div>
                          <div style={{ marginBottom: '8px', color: 'rgba(0, 0, 0, 0.65)' }}>
                            <EnvironmentOutlined style={{ marginRight: '8px' }} />
                            {activity.location}
                          </div>
                          <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                            <TeamOutlined style={{ marginRight: '8px' }} />
                            {activity.registeredCount}/{activity.capacity} 人已报名
                          </div>
                        </>
                      }
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无精选活动" />
        )}
      </div>

    </div>
  );
};

export default Home;