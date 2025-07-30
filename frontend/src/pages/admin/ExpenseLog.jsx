import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select, DatePicker, Space, Row, Col, Statistic, Tag, Tooltip, message, InputNumber, Divider, Typography, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DollarOutlined, CalendarOutlined, UserOutlined, FileTextOutlined, UploadOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { expenseLogAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const ExpenseLog = () => {
  const [expenseLogs, setExpenseLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const { user } = useAuth();

  const [form] = Form.useForm();

  // Expense categories from the Excel template
  const expenseCategories = [
    'Maintenance', 'Salary', 'Equipment', 'Utilities', 'Transportation', 
    'Office Supplies', 'Events', 'Training', 'Technology', 'Miscellaneous'
  ];

  // Payment modes from the Excel template
  const paymentModes = [
    'Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card'
  ];

  // Status options
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Paid'];

  useEffect(() => {
    fetchExpenseLogs();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchExpenseLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      const response = await expenseLogAPI.getExpenseLogs(params);
      setExpenseLogs(response.docs || []);
      setPagination(prev => ({
        ...prev,
        total: response.totalDocs || 0
      }));
    } catch (error) {
      message.error('Failed to fetch expense logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await expenseLogAPI.getExpenseLogStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreate = async (values) => {
    try {
      await expenseLogAPI.createExpenseLog({
        ...values,
        date: values.date.toDate()
      });
      message.success('Expense log created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      fetchExpenseLogs();
      fetchStats();
    } catch (error) {
      message.error('Failed to create expense log');
    }
  };

  const handleUpdate = async (values) => {
    try {
      await expenseLogAPI.updateExpenseLog(editingExpense._id, {
        ...values,
        date: values.date.toDate()
      });
      message.success('Expense log updated successfully');
      setEditModalVisible(false);
      setEditingExpense(null);
      form.resetFields();
      fetchExpenseLogs();
      fetchStats();
    } catch (error) {
      message.error('Failed to update expense log');
    }
  };

  const handleDelete = async (id) => {
    try {
      await expenseLogAPI.deleteExpenseLog(id);
      message.success('Expense log deleted successfully');
      fetchExpenseLogs();
      fetchStats();
    } catch (error) {
      message.error('Failed to delete expense log');
    }
  };

  const showCreateModal = () => {
    setCreateModalVisible(true);
    form.resetFields();
  };

  const showEditModal = (expense) => {
    setEditingExpense(expense);
    setEditModalVisible(true);
    form.setFieldsValue({
      ...expense,
      date: dayjs(expense.date)
    });
  };

  const showViewModal = (expense) => {
    setViewingExpense(expense);
    setViewModalVisible(true);
  };

  const handleTableChange = (paginationInfo, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'orange',
      'Approved': 'green',
      'Rejected': 'red',
      'Paid': 'blue'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 80,
      align: 'center'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Expense Category',
      dataIndex: 'expenseCategory',
      key: 'expenseCategory',
      width: 150,
      render: (category) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount) => `₹${amount.toLocaleString()}`
    },
    {
      title: 'Payment Mode',
      dataIndex: 'paymentMode',
      key: 'paymentMode',
      width: 130,
      render: (mode) => (
        <Tag color="purple">{mode}</Tag>
      )
    },
    {
      title: 'Paid To',
      dataIndex: 'paidTo',
      key: 'paidTo',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Voucher No',
      dataIndex: 'voucherNo',
      key: 'voucherNo',
      width: 130
    },
    {
      title: 'Approved By',
      dataIndex: 'approvedBy',
      key: 'approvedBy',
      width: 120,
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Badge status={getStatusColor(status)} text={status} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showViewModal(record)}
          >
            View
          </Button>
          {user?.role === 'Accountant' && record.status === 'Pending' && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            >
              Edit
            </Button>
          )}
          {user?.role === 'Accountant' && record.status === 'Pending' && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            >
              Delete
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Expense Log Management" extra={
        user?.role === 'Accountant' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
            Add Expense
          </Button>
        )
      }>
        {/* Statistics Row */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Expenses"
                value={stats.overview?.totalExpenses || 0}
                prefix="₹"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Count"
                value={stats.overview?.totalCount || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Average Amount"
                value={stats.overview?.averageAmount || 0}
                prefix="₹"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Expenses"
                value={stats.statusStats?.find(s => s._id === 'Pending')?.count || 0}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Input
                placeholder="Search description, paid to, voucher no..."
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Category"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => handleFilter('category', value)}
              >
                {expenseCategories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Payment Mode"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => handleFilter('paymentMode', value)}
              >
                {paymentModes.map(mode => (
                  <Option key={mode} value={mode}>{mode}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Status"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => handleFilter('status', value)}
              >
                {statusOptions.map(status => (
                  <Option key={status} value={status}>{status}</Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Space>
                <DatePicker
                  placeholder="Start Date"
                  onChange={(date) => handleFilter('startDate', date?.toISOString())}
                />
                <DatePicker
                  placeholder="End Date"
                  onChange={(date) => handleFilter('endDate', date?.toISOString())}
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={expenseLogs}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1500 }}
          size="small"
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Add New Expense"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expenseCategory"
                label="Expense Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  {expenseCategories.map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Brief details of the expense" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount (₹)"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0.00"
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentMode"
                label="Payment Mode"
                rules={[{ required: true, message: 'Please select payment mode' }]}
              >
                <Select placeholder="Select payment mode">
                  {paymentModes.map(mode => (
                    <Option key={mode} value={mode}>{mode}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paidTo"
                label="Paid To"
                rules={[{ required: true, message: 'Please enter recipient' }]}
              >
                <Input placeholder="Vendor or person receiving payment" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="approvedBy"
                label="Approved By"
                rules={[{ required: true, message: 'Please enter approver' }]}
              >
                <Input placeholder="Person authorizing payment" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remarks"
            label="Remarks"
          >
            <TextArea rows={2} placeholder="Any additional notes" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Expense
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Expense"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expenseCategory"
                label="Expense Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  {expenseCategories.map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Brief details of the expense" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount (₹)"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0.00"
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentMode"
                label="Payment Mode"
                rules={[{ required: true, message: 'Please select payment mode' }]}
              >
                <Select placeholder="Select payment mode">
                  {paymentModes.map(mode => (
                    <Option key={mode} value={mode}>{mode}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paidTo"
                label="Paid To"
                rules={[{ required: true, message: 'Please enter recipient' }]}
              >
                <Input placeholder="Vendor or person receiving payment" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="approvedBy"
                label="Approved By"
                rules={[{ required: true, message: 'Please enter approver' }]}
              >
                <Input placeholder="Person authorizing payment" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remarks"
            label="Remarks"
          >
            <TextArea rows={2} placeholder="Any additional notes" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Expense
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Expense Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={
          <Button onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        }
        width={800}
      >
        {viewingExpense && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Typography.Text strong>S.No:</Typography.Text>
                <br />
                <Typography.Text>{viewingExpense.serialNumber}</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Date:</Typography.Text>
                <br />
                <Typography.Text>{dayjs(viewingExpense.date).format('DD/MM/YYYY')}</Typography.Text>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Typography.Text strong>Expense Category:</Typography.Text>
                <br />
                <Tag color="blue">{viewingExpense.expenseCategory}</Tag>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Payment Mode:</Typography.Text>
                <br />
                <Tag color="purple">{viewingExpense.paymentMode}</Tag>
              </Col>
            </Row>
            <Divider />
            <Typography.Text strong>Description:</Typography.Text>
            <br />
            <Typography.Text>{viewingExpense.description}</Typography.Text>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Typography.Text strong>Amount:</Typography.Text>
                <br />
                <Typography.Text style={{ fontSize: '18px', color: '#3f8600' }}>
                  ₹{viewingExpense.amount.toLocaleString()}
                </Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Status:</Typography.Text>
                <br />
                <Badge status={getStatusColor(viewingExpense.status)} text={viewingExpense.status} />
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Typography.Text strong>Paid To:</Typography.Text>
                <br />
                <Typography.Text>{viewingExpense.paidTo}</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Voucher No:</Typography.Text>
                <br />
                <Typography.Text>{viewingExpense.voucherNo}</Typography.Text>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Typography.Text strong>Approved By:</Typography.Text>
                <br />
                <Typography.Text>{viewingExpense.approvedBy}</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Created By:</Typography.Text>
                <br />
                <Typography.Text>{viewingExpense.createdBy?.name || 'N/A'}</Typography.Text>
              </Col>
            </Row>
            {viewingExpense.remarks && (
              <>
                <Divider />
                <Typography.Text strong>Remarks:</Typography.Text>
                <br />
                <Typography.Text>{viewingExpense.remarks}</Typography.Text>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExpenseLog; 