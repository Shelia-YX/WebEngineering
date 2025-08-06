import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Popconfirm, Input, Tag } from 'antd';
import { SearchOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth, useComments } from '../../hooks';
import { PageTitle, LoadingSpinner, ErrorAlert } from '../../components';
import { formatDateTime } from '../../utils';
import { ROUTES } from '../../constants';
import { message } from '../../utils/messageUtils';

const { Search } = Input;

const AdminCommentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { 
    comments, 
    loading, 
    error, 
    fetchAllComments, 
    deleteComment,
    approveComment
  } = useComments();
  
  const [searchText, setSearchText] = useState('');
  const [filteredComments, setFilteredComments] = useState<any[]>([]);

  // 如果未登录或不是管理员，重定向到登录页
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    } else if (!isAdmin) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 获取所有评论
  useEffect(() => {
    if (isAdmin) {
      fetchAllComments();
    }
  }, [isAdmin, fetchAllComments]);

  // 筛选评论
  useEffect(() => {
    if (!comments) return;
    
    if (!searchText) {
      setFilteredComments(comments);
      return;
    }
    
    const filtered = comments.filter(comment => {
      const activityTitle = typeof comment.activity === 'object' && comment.activity?.title ? comment.activity.title : '';
      return comment.content.toLowerCase().includes(searchText.toLowerCase()) ||
        comment.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        activityTitle.toLowerCase().includes(searchText.toLowerCase());
    });
    
    setFilteredComments(filtered);
  }, [comments, searchText]);

  // 处理删除评论
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      message.success('评论删除成功');
    } catch (error) {
      console.error('删除评论失败:', error);
      message.error('删除评论失败');
    }
  };

  // 处理审核评论
  const handleApproveComment = async (commentId: string) => {
    try {
      await approveComment(commentId);
      message.success('评论审核通过');
    } catch (error) {
      console.error('审核评论失败:', error);
      message.error('审核评论失败');
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: '30%',
      render: (text: string) => <div style={{ maxHeight: 100, overflow: 'auto' }}>{text}</div>
    },
    {
      title: '用户',
      dataIndex: ['user', 'username'],
      key: 'username',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`${ROUTES.ADMIN_USERS}?search=${record.user?._id}`)}>
          {text || '未知用户'}
        </a>
      )
    },
    {
      title: '活动',
      dataIndex: ['activity', 'title'],
      key: 'activity',
      ellipsis: true,
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`${ROUTES.ACTIVITY_DETAIL.replace(':id', record.activity?._id)}`)}>  
          {text || '未知活动'}
        </a>
      )
    },
    {
      title: '状态',
      dataIndex: 'approved',
      key: 'approved',
      render: (approved: boolean) => (
        <Tag color={approved ? 'green' : 'orange'}>
          {approved ? '已审核' : '待审核'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => formatDateTime(text)
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: any) => (
        <Space size="small">
          {!record.approved && (
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              size="small"
              onClick={() => handleApproveComment(record._id)}
            >
              审核通过
            </Button>
          )}
          <Popconfirm
            title="确定要删除这条评论吗？"
            onConfirm={() => handleDeleteComment(record._id)}
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
      )
    }
  ];

  if (!isAuthenticated || !isAdmin) {
    return null; // 等待重定向
  }

  return (
    <div className="admin-comments-page">
      <PageTitle 
        title="评论管理" 
        subtitle="管理用户评论"
        onBack={() => navigate(ROUTES.ADMIN_DASHBOARD)}
      />
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索评论内容、用户名或活动名称"
            allowClear
            enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
            size="large"
            onSearch={value => setSearchText(value)}
            style={{ maxWidth: 500 }}
          />
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorAlert error={error} />
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredComments.map(comment => ({ ...comment, key: comment._id }))} 
            pagination={{ 
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条评论`
            }}
            rowClassName={(record) => !record.approved ? 'table-row-pending' : ''}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminCommentsPage;