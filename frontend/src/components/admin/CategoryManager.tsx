import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Input, Form, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useCategories } from '../../hooks';
import { message } from '../../utils/messageUtils';

interface CategoryFormValues {
  name: string;
  description?: string;
}

const CategoryManager: React.FC = () => {
  const { 
    categories, 
    loading, 
    fetchCategories, 
    createCategory,
    updateCategory,
    deleteCategory 
  } = useCategories();
  
  const [form] = Form.useForm<CategoryFormValues>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 获取类别列表
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 打开添加类别模态框
  const showAddModal = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑类别模态框
  const showEditModal = (category: any) => {
    setEditingId(category._id);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      if (editingId) {
        // 更新类别
        await updateCategory(editingId, values.name, values.description);
        message.success('类别更新成功');
      } else {
        // 创建类别
        await createCategory(values.name, values.description);
        message.success('类别创建成功');
      }
      
      setModalVisible(false);
      fetchCategories(); // 刷新列表
    } catch (error) {
      console.error('提交类别失败:', error);
      message.error('操作失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 处理删除类别
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      message.success('类别删除成功');
      fetchCategories(); // 刷新列表
    } catch (error) {
      console.error('删除类别失败:', error);
      message.error('删除失败，请稍后重试');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '类别名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '活动数量',
      dataIndex: 'activityCount',
      key: 'activityCount',
      render: (count: number) => count || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此类别吗？"
            description="删除后，相关活动将不再属于此类别。"
            onConfirm={() => handleDeleteCategory(record._id)}
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
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showAddModal}
        >
          添加类别
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories.map(category => ({ ...category, key: category._id }))}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 添加/编辑类别模态框 */}
      <Modal
        title={editingId ? '编辑类别' : '添加类别'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={submitting}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="类别名称"
            rules={[{ required: true, message: '请输入类别名称' }]}
          >
            <Input placeholder="请输入类别名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="类别描述"
          >
            <Input.TextArea 
              placeholder="请输入类别描述" 
              rows={4} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManager;