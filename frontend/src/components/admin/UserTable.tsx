import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Select, Input, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useUsers, usePagination } from '../../hooks';
import { getUserRoleText, getUserRoleColor } from '../../utils';
import { USER_ROLES } from '../../constants';
import { message } from '../../utils/messageUtils';

const { Option } = Select;

interface UserTableProps {
  onRefresh?: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ onRefresh }) => {
  const { 
    users, 
    loading, 
    error, 
    fetchAllUsers, 
    updateUserRole, 
    deleteUser 
  } = useUsers();
  
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  
  const { 
    currentPage, 
    pageSize, 
    totalItems: total, 
    handlePageChange: onPaginationChange,
    updateTotal
  } = usePagination();

  // 获取用户列表
  useEffect(() => {
    fetchAllUsers()
      .then(data => {
        if (data && data.length) {
          updateTotal(data.length);
        }
      });
  }, [fetchAllUsers, updateTotal]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // 处理编辑角色
  const handleEditRole = (userId: string, currentRole: string) => {
    setEditingId(userId);
    setSelectedRole(currentRole);
  };

  // 处理保存角色
  const handleSaveRole = async (userId: string) => {
    if (!selectedRole) {
      message.error('请选择角色');
      return;
    }

    try {
      await updateUserRole(userId, selectedRole);
      message.success('角色更新成功');
      setEditingId(null);
      
      // 刷新列表
      fetchAllUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('更新角色失败:', error);
      message.error('更新角色失败');
    }
  };

  // 处理删除用户
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      message.success('用户删除成功');
      
      // 刷新列表
      fetchAllUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除用户失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: any) => (
        <Space>
          {text}
          {record.isVerified && <Tag color="green">已验证</Tag>}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: any) => {
        if (editingId === record._id) {
          return (
            <Select
              value={selectedRole}
              onChange={(value) => setSelectedRole(value)}
              style={{ width: 120 }}
            >
              {Object.entries(USER_ROLES).map(([key, value]) => (
                <Option key={key} value={key}>{value}</Option>
              ))}
            </Select>
          );
        }
        return <Tag color={getUserRoleColor(role)}>{getUserRoleText(role)}</Tag>;
      },
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => {
        if (editingId === record._id) {
          return (
            <Space>
              <Button 
                type="primary" 
                size="small" 
                onClick={() => handleSaveRole(record._id)}
              >
                保存
              </Button>
              <Button 
                size="small" 
                onClick={() => setEditingId(null)}
              >
                取消
              </Button>
            </Space>
          );
        }
        return (
          <Space>
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditRole(record._id, record.role)}
            >
              编辑角色
            </Button>
            <Popconfirm
              title="确定要删除此用户吗？"
              onConfirm={() => handleDeleteUser(record._id)}
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
          placeholder="搜索用户名或邮箱"
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton={<SearchOutlined />}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={users.map(user => ({ ...user, key: user._id }))}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: onPaginationChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default UserTable;