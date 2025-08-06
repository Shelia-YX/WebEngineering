import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Empty, Pagination, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useActivities, useCategories, usePagination } from '../hooks';
import { ActivityCard, CategorySelect, PageTitle, EmptyState } from '../components';

// const { Option } = Select; // 未使用，注释掉

const HomePage: React.FC = () => {
  const { activities, loading, error, fetchActivities, updateFilters } = useActivities();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const { 
    currentPage, 
    pageSize, 
    totalItems: total, 
    handlePageChange: onPaginationChange,
    updateTotal
  } = usePagination();

  // 获取活动列表
  useEffect(() => {
    const filters = {
      page: currentPage,
      limit: pageSize,
      status: 'published', // 只显示已发布的活动
      search: searchText,
      categoryId: selectedCategory || undefined,
      sort: 'startTime', // 按开始时间排序
    };

    // 设置过滤条件
    updateFilters(filters);
    // 获取活动
    fetchActivities();
    // 注意：这里应该从API响应中获取总数并更新
    // 由于当前API可能不返回总数，这部分逻辑需要根据实际情况调整
  }, [fetchActivities, currentPage, pageSize, searchText, selectedCategory, updateTotal]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // 处理类别筛选
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <div className="home-page">
      <PageTitle 
        title="探索活动" 
        subtitle="发现身边精彩的活动，开启你的社交之旅"
      />
      
      {/* 搜索和筛选区域 */}
      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <Input.Search
          placeholder="搜索活动"
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton={<SearchOutlined />}
          allowClear
        />
        
        <CategorySelect 
          value={selectedCategory} 
          onChange={handleCategoryChange} 
          style={{ width: 200 }}
          showAll
        />
      </div>
      
      {/* 活动列表 */}
      <Spin spinning={loading}>
        {activities.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {activities.map(activity => (
                <Col xs={24} sm={12} md={8} lg={6} key={activity._id}>
                  <ActivityCard activity={activity} />
                </Col>
              ))}
            </Row>
            
            {/* 分页 */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={onPaginationChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `共 ${total} 条记录`}
              />
            </div>
          </>
        ) : (
          <EmptyState 
            description={error ? '加载活动失败' : '暂无活动'}
            buttonText={error ? '重试' : undefined}
            onButtonClick={error ? () => {
              updateFilters({ status: 'published' });
              fetchActivities();
            } : undefined}
          />
        )}
      </Spin>
    </div>
  );
};

export default HomePage;