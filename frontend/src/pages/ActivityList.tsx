import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tag,
  Pagination,
  Spin,
  Empty,
  Breadcrumb,
} from 'antd';
import {
  SearchOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

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

const ActivityList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalActivities, setTotalActivities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // 从URL获取查询参数
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get('category');
    const status = queryParams.get('status');
    const search = queryParams.get('search');
    const page = queryParams.get('page');

    if (category) setCategoryFilter(category);
    if (status) setStatusFilter(status);
    if (search) setSearchQuery(search);
    if (page) setCurrentPage(parseInt(page));
  }, [location.search]);

  // 获取活动列表
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        // 构建查询参数
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', pageSize.toString());
        
        if (searchQuery) params.append('search', searchQuery);
        if (categoryFilter) params.append('category', categoryFilter);
        if (statusFilter) params.append('status', statusFilter);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/activities?${params.toString()}`
        );

        setActivities(response.data.activities);
        setTotalActivities(response.data.totalActivities);
        setLoading(false);
      } catch (error) {
        console.error('获取活动列表失败', error);
        setLoading(false);
      }
    };

    fetchActivities();
  }, [currentPage, pageSize, searchQuery, categoryFilter, statusFilter]);

  // 更新URL查询参数
  const updateQueryParams = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.append('search', searchQuery);
    if (categoryFilter) params.append('category', categoryFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (currentPage > 1) params.append('page', currentPage.toString());

    navigate({
      pathname: '/activities',
      search: params.toString(),
    });
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // 处理分类筛选
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  // 处理状态筛选
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  // 重置筛选条件
  const handleReset = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
    setCurrentPage(1);
    navigate('/activities');
  };

  // 更新URL
  useEffect(() => {
    updateQueryParams();
  }, [currentPage, searchQuery, categoryFilter, statusFilter]);

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

  // 获取活动状态对应的颜色
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'upcoming': 'blue',
      'ongoing': 'green',
      'completed': 'gray',
      'canceled': 'red',
    };
    
    return statusColors[status] || 'default';
  };

  // 获取活动状态对应的中文名称
  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'upcoming': '即将开始',
      'ongoing': '进行中',
      'completed': '已结束',
      'canceled': '已取消',
    };
    
    return statusTexts[status] || status;
  };

  return (
    <div className="container">
      <Breadcrumb
        style={{ marginBottom: '16px' }}
        items={[
          {
            title: <Link to="/">首页</Link>,
          },
          {
            title: '活动列表',
          },
        ]}
      />

      <Title level={2} className="page-title">
        活动列表
      </Title>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="搜索活动名称或描述"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]} justify="end">
              <Col xs={12} md={6}>
                <Select
                  placeholder="活动类别"
                  style={{ width: '100%' }}
                  allowClear
                  value={categoryFilter || undefined}
                  onChange={handleCategoryChange}
                  size="large"
                >
                  <Option value="足球">足球</Option>
                  <Option value="篮球">篮球</Option>
                  <Option value="排球">排球</Option>
                  <Option value="网球">网球</Option>
                  <Option value="羽毛球">羽毛球</Option>
                  <Option value="乒乓球">乒乓球</Option>
                  <Option value="游泳">游泳</Option>
                  <Option value="跑步">跑步</Option>
                  <Option value="健身">健身</Option>
                  <Option value="瑜伽">瑜伽</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Col>
              <Col xs={12} md={6}>
                <Select
                  placeholder="活动状态"
                  style={{ width: '100%' }}
                  allowClear
                  value={statusFilter || undefined}
                  onChange={handleStatusChange}
                  size="large"
                >
                  <Option value="upcoming">即将开始</Option>
                  <Option value="ongoing">进行中</Option>
                  <Option value="completed">已结束</Option>
                  <Option value="canceled">已取消</Option>
                </Select>
              </Col>
              <Col xs={24} md={6}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={handleReset}
                  size="large"
                  block
                >
                  重置筛选
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 活动列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : activities.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {activities.map((activity) => (
              <Col xs={24} sm={12} md={8} lg={6} key={activity._id}>
                <Link to={`/activities/${activity._id}`} style={{ textDecoration: 'none' }}>
                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          height: '180px',
                          backgroundImage: `url(${activity.image || 'https://via.placeholder.com/300x180?text=No+Image'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    }
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <Tag color={getCategoryColor(activity.category)} style={{ marginRight: '8px' }}>
                        {activity.category}
                      </Tag>
                      <Tag color={getStatusColor(activity.status)}>
                        {getStatusText(activity.status)}
                      </Tag>
                    </div>
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
                          {activity.price > 0 && (
                            <div style={{ marginTop: '8px', fontWeight: 'bold', color: '#f5222d' }}>
                              ¥{activity.price.toFixed(2)}
                            </div>
                          )}
                        </>
                      }
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          {/* 分页 */}
          <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '16px' }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalActivities}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 个活动`}
            />
          </div>
        </>
      ) : (
        <Empty
          description={
            <span>
              没有找到符合条件的活动
              {(searchQuery || categoryFilter || statusFilter) && (
                <Button type="link" onClick={handleReset}>
                  清除筛选条件
                </Button>
              )}
            </span>
          }
          style={{ marginTop: '40px' }}
        />
      )}
    </div>
  );
};

export default ActivityList;