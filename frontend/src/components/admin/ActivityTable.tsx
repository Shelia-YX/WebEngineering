import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Input, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useActivities, usePagination } from '../../hooks';
import { formatDateTime, formatCurrency, truncateText, getActivityStatusText, getActivityStatusColor } from '../../utils';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { message } from '../../utils/messageUtils';

interface ActivityTableProps {
  onEdit?: (activityId: string) => void;
  onRefresh?: () => void;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ onEdit, onRefresh }) => {
  const { 
    activities, 
    loading, 
    fetchActivities, 
    deleteActivity,
    updateActivity,
    updateFilters 
  } = useActivities();
  
  const [searchText, setSearchText] = useState('');
  
  const { 
    currentPage, 
    pageSize, 
    totalItems, 
    handlePageChange,
    updateTotal
  } = usePagination();

  // 获取活动列表
  useEffect(() => {
    // 更新过滤条件
    updateFilters({ page: currentPage, limit: pageSize, search: searchText });
    // 获取活动列表
    fetchActivities();
  }, [fetchActivities, updateFilters, currentPage, pageSize, searchText, updateTotal]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // 处理编辑活动
  const handleEditActivity = (activityId: string) => {
    if (onEdit) {
      onEdit(activityId);
    }
  };

  // 处理删除活动
  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      message.success('活动删除成功');
      
      // 更新过滤条件
      updateFilters({ page: currentPage, limit: pageSize, search: searchText });
      // 刷新列表
      fetchActivities();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('删除活动失败:', error);
      message.error('删除活动失败');
    }
  };

  // 处理更新活动状态
  const handleUpdateStatus = async (activityId: string, status: string) => {
    try {
      await updateActivity(activityId, { status });
      message.success('活动状态更新成功');
      
      // 更新过滤条件
      updateFilters({ page: currentPage, limit: pageSize, search: searchText });
      // 刷新列表
      fetchActivities();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('更新活动状态失败:', error);
      message.error('更新活动状态失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Link to={`${ROUTES.ACTIVITY_DETAIL.replace(':id', record._id)}`}>
          {truncateText(text, 20)}
        </Link>
      ),
    },
    {
      title: '组织者',
      dataIndex: ['organizer', 'username'],
      key: 'organizer',
      render: (text: string) => text || '-',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => truncateText(text, 15) || '-',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: '报名人数',
      key: 'registrations',
      render: (_: any, record: any) => (
        <span>{record.registrationsCount || 0}/{record.capacity || '不限'}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getActivityStatusColor(status)}>
          {getActivityStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => {
        return (
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => window.open(`${ROUTES.ACTIVITY_DETAIL.replace(':id', record._id)}`, '_blank')}
            >
              查看
            </Button>
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditActivity(record._id)}
            >
              编辑
            </Button>
            {record.status === 'draft' && (
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleUpdateStatus(record._id, 'published')}
              >
                发布
              </Button>
            )}
            {record.status === 'published' && (
              <Button 
                type="default" 
                size="small"
                onClick={() => handleUpdateStatus(record._id, 'draft')}
              >
                撤回
              </Button>
            )}
            <Popconfirm
              title="确定要删除此活动吗？"
              onConfirm={() => handleDeleteActivity(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索活动名称"
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton={<SearchOutlined />}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={activities.map(activity => ({ ...activity, key: activity._id }))}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalItems,
          onChange: handlePageChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ActivityTable;