import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Tag, DatePicker } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, ExportOutlined } from '@ant-design/icons';
import { useRegistrations, usePagination } from '../../hooks';
import { formatDateTime, getPaymentStatusText, getPaymentStatusColor } from '../../utils';
import { REGISTRATION_STATUS, PAYMENT_STATUS } from '../../constants';
import { message } from '../../utils/messageUtils';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface RegistrationManagerProps {
  activityId?: string;
}

const RegistrationManager: React.FC<RegistrationManagerProps> = ({ activityId }) => {
  const { 
    registrations, 
    loading, 
    fetchRegistrations, 
    updateRegistrationStatus,
    updatePaymentStatus,
    exportRegistrations
  } = useRegistrations();
  
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  
  const { 
    currentPage, 
    pageSize, 
    totalItems, 
    handlePageChange: onPaginationChange,
    updateTotal
  } = usePagination();

  // 获取报名列表
  useEffect(() => {
    const filters: any = {
      page: currentPage,
      limit: pageSize,
      search: searchText,
    };

    if (activityId) {
      filters.activityId = activityId;
    }

    if (statusFilter) {
      filters.status = statusFilter;
    }

    if (paymentFilter) {
      filters.paymentStatus = paymentFilter;
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      filters.startDate = dateRange[0].format('YYYY-MM-DD');
      filters.endDate = dateRange[1].format('YYYY-MM-DD');
    }

    fetchRegistrations(filters)
      .then(data => {
        if (data && data.registrations) {
          // 使用registrations的长度作为total
          updateTotal(data.registrations.length);
        }
      });
  }, [fetchRegistrations, currentPage, pageSize, searchText, statusFilter, paymentFilter, dateRange, activityId, updateTotal]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // 处理状态筛选
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  // 处理支付状态筛选
  const handlePaymentStatusChange = (value: string) => {
    setPaymentFilter(value);
  };

  // 处理日期范围筛选
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  // 处理更新报名状态
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateRegistrationStatus(id, status);
      message.success('报名状态更新成功');
      
      // 刷新列表
      const filters: any = {
        page: currentPage,
        limit: pageSize,
        search: searchText,
      };
      if (activityId) filters.activityId = activityId;
      if (statusFilter) filters.status = statusFilter;
      if (paymentFilter) filters.paymentStatus = paymentFilter;
      
      fetchRegistrations(filters);
    } catch (error) {
      console.error('更新报名状态失败:', error);
      message.error('更新报名状态失败');
    }
  };

  // 处理更新支付状态
  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    try {
      await updatePaymentStatus(id, status);
      message.success('支付状态更新成功');
      
      // 刷新列表
      const filters: any = {
        page: currentPage,
        limit: pageSize,
        search: searchText,
      };
      if (activityId) filters.activityId = activityId;
      if (statusFilter) filters.status = statusFilter;
      if (paymentFilter) filters.paymentStatus = paymentFilter;
      
      fetchRegistrations(filters);
    } catch (error) {
      console.error('更新支付状态失败:', error);
      message.error('更新支付状态失败');
    }
  };

  // 处理导出报名数据
  const handleExport = async () => {
    try {
      const filters: any = {};
      if (activityId) filters.activityId = activityId;
      if (statusFilter) filters.status = statusFilter;
      if (paymentFilter) filters.paymentStatus = paymentFilter;
      if (searchText) filters.search = searchText;
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0].format('YYYY-MM-DD');
        filters.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      await exportRegistrations(filters);
      message.success('报名数据导出成功');
    } catch (error) {
      console.error('导出报名数据失败:', error);
      message.error('导出报名数据失败');
    }
  };

  // 表格列定义
  interface TableColumn {
     title: string;
    dataIndex?: string | string[];
    key: string;
    render?: (text: any, record?: any) => React.ReactNode;
    hidden?: boolean;
    [key: string]: any; // 允许其他属性
  }

  const columns = [
    {
      title: '活动名称',
      dataIndex: ['activity', 'title'],
      key: 'activity',
      render: (text: string) => text || '-',
      ...(activityId ? { hidden: true } : {}),
    },
    {
      title: '报名人',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => text || '-',
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => text || '-',
    },
    {
      title: '票数',
      dataIndex: 'ticketCount',
      key: 'ticketCount',
      render: (count: number) => count || 0,
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `¥${price || 0}`,
    },
    {
      title: '报名状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          pending: { color: 'orange', text: '待审核' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' },
        };
        const status = statusMap[text] || { color: 'default', text: '未知状态' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => (
        <Tag color={getPaymentStatusColor(status)}>
          {getPaymentStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '报名时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_text: any, record: any) => {
        return (
          <Space>
            {/* 报名状态操作 */}
            {record.status === 'pending' && (
              <>
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />} 
                  size="small"
                  onClick={() => handleUpdateStatus(record._id, 'approved')}
                >
                  确认
                </Button>
                <Button 
                  danger 
                  icon={<CloseOutlined />} 
                  size="small"
                  onClick={() => handleUpdateStatus(record._id, 'rejected')}
                >
                  拒绝
                </Button>
              </>
            )}
            
            {/* 支付状态操作 */}
            {record.paymentStatus === 'unpaid' && (
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleUpdatePaymentStatus(record._id, 'paid')}
              >
                标记已付款
              </Button>
            )}
            
            {record.paymentStatus === 'paid' && (
              <Button 
                danger 
                size="small"
                onClick={() => handleUpdatePaymentStatus(record._id, 'unpaid')}
              >
                标记未付款
              </Button>
            )}
          </Space>
        );
      },
    },
  ].filter((column: TableColumn) => !column.hidden);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <Input.Search
          placeholder="搜索姓名/手机/邮箱"
          onSearch={handleSearch}
          style={{ width: 250 }}
          enterButton={<SearchOutlined />}
          allowClear
        />
        
        <Select
          placeholder="报名状态"
          style={{ width: 150 }}
          onChange={handleStatusChange}
          allowClear
        >
          {Object.entries(REGISTRATION_STATUS).map(([key, value]) => (
            <Option key={key} value={key}>{value}</Option>
          ))}
        </Select>
        
        <Select
          placeholder="支付状态"
          style={{ width: 150 }}
          onChange={handlePaymentStatusChange}
          allowClear
        >
          {Object.entries(PAYMENT_STATUS).map(([key, value]) => (
            <Option key={key} value={key}>{value}</Option>
          ))}
        </Select>
        
        <RangePicker 
          onChange={handleDateRangeChange}
          style={{ width: 250 }}
        />
        
        <Button 
          type="primary" 
          icon={<ExportOutlined />}
          onClick={handleExport}
        >
          导出数据
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={registrations.map(registration => ({ ...registration, key: registration._id }))}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalItems,
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

export default RegistrationManager;