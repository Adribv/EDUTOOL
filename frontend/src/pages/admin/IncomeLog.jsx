import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select, DatePicker, Space, Row, Col, Statistic, Tag, Tooltip, message, InputNumber, Divider, Typography, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DollarOutlined, CalendarOutlined, UserOutlined, FileTextOutlined, UploadOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { incomeLogAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const IncomeLog = () => {
  const [incomeLogs, setIncomeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [viewingIncome, setViewingIncome] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const { user } = useAuth();

  const [form] = Form.useForm();

  // Income sources from the Excel template
  const incomeSources = [
    'Fees', 'Donation', 'Grant', 'Event', 'Sponsorship', 'Fundraising', 'Investment', 'Other'
  ];

  // Payment modes from the Excel template
  const paymentModes = [
    'Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Online Payment'
  ];

  // Status options
  const statusOptions = ['Pending', 'Confirmed', 'Rejected', 'Processed'];

  useEffect(() => {
    fetchIncomeLogs();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchIncomeLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      const response = await incomeLogAPI.getIncomeLogs(params);
      setIncomeLogs(response.docs || []);
      setPagination(prev => ({
        ...prev,
        total: response.totalDocs || 0
      }));
    } catch (error) {
      message.error('Failed to fetch income logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await incomeLogAPI.getIncomeLogStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreate = async (values) => {
    try {
      await incomeLogAPI.createIncomeLog({
        ...values,
        date: values.date.toDate()
      });
      message.success('Income log created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      fetchIncomeLogs();
      fetchStats();
    } catch (error) {
      message.error('Failed to create income log');
    }
  };

  const handleUpdate = async (values) => {
    try {
      await incomeLogAPI.updateIncomeLog(editingIncome._id, {
        ...values,
        date: values.date.toDate()
      });
      message.success('Income log updated successfully');
      setEditModalVisible(false);
      setEditingIncome(null);
      form.resetFields();
      fetchIncomeLogs();
      fetchStats();
    } catch (error) {
      message.error('Failed to update income log');
    }
  };

  const handleDelete = async (id) => {
    try {
      await incomeLogAPI.deleteIncomeLog(id);
      message.success('Income log deleted successfully');
      fetchIncomeLogs();
      fetchStats();
    } catch (error) {
      message.error('Failed to delete income log');
    }
  };

  const showCreateModal = () => {
    setCreateModalVisible(true);
    form.resetFields();
  };

  const showEditModal = (income) => {
    setEditingIncome(income);
    setEditModalVisible(true);
    form.setFieldsValue({
      ...income,
      date: dayjs(income.date)
    });
  };

  const showViewModal = (income) => {
    setViewingIncome(income);
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
      'Confirmed': 'green',
      'Rejected': 'red',
      'Processed': 'blue'
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
      title: 'Income Source',
      dataIndex: 'incomeSource',
      key: 'incomeSource',
      width: 150,
      render: (source) => (
        <Tag color="green">{source}</Tag>
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
      title: 'Amount (₹)',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount) => `₹${amount.toLocaleString()}`
    },
    {
      title: 'Received From',
      dataIndex: 'receivedFrom',
      key: 'receivedFrom',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Receipt No',
      dataIndex: 'receiptNo',
      key: 'receiptNo',
      width: 130
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
      title: 'Received By',
      dataIndex: 'receivedBy',
      key: 'receivedBy',
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
      <Card title="Income Log Management" extra={
        user?.role === 'Accountant' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
            Add Income
          </Button>
        )
      }>
        {/* Statistics Row */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Income"
                value={stats.overview?.totalIncome || 0}
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
                title="Pending Income"
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
                placeholder="Search description, received from, receipt no..."
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Income Source"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => handleFilter('source', value)}
              >
                {incomeSources.map(source => (
                  <Option key={source} value={source}>{source}</Option>
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
          dataSource={incomeLogs}
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
        title="Add New Income"
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
                name="incomeSource"
                label="Income Source"
                rules={[{ required: true, message: 'Please select income source' }]}
              >
                <Select placeholder="Select income source">
                  {incomeSources.map(source => (
                    <Option key={source} value={source}>{source}</Option>
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
            <TextArea rows={3} placeholder="Brief note about the income" />
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
                name="receivedFrom"
                label="Received From"
                rules={[{ required: true, message: 'Please enter sender name' }]}
              >
                <Input placeholder="Name of the person/organization" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="receivedBy"
                label="Received By"
                rules={[{ required: true, message: 'Please enter receiver name' }]}
              >
                <Input placeholder="Staff or department handling collection" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remarks"
            label="Remarks"
          >
            <TextArea rows={2} placeholder="Any extra notes (e.g., partial payment, advance, etc.)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Income
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
        title="Edit Income"
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
                name="incomeSource"
                label="Income Source"
                rules={[{ required: true, message: 'Please select income source' }]}
              >
                <Select placeholder="Select income source">
                  {incomeSources.map(source => (
                    <Option key={source} value={source}>{source}</Option>
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
            <TextArea rows={3} placeholder="Brief note about the income" />
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
                name="receivedFrom"
                label="Received From"
                rules={[{ required: true, message: 'Please enter sender name' }]}
              >
                <Input placeholder="Name of the person/organization" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="receivedBy"
                label="Received By"
                rules={[{ required: true, message: 'Please enter receiver name' }]}
              >
                <Input placeholder="Staff or department handling collection" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remarks"
            label="Remarks"
          >
            <TextArea rows={2} placeholder="Any extra notes (e.g., partial payment, advance, etc.)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Income
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
        title="Income Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={
          <Button onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        }
        width={800}
      >
        {viewingIncome && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Typography.Text strong>S.No:</Typography.Text>
                <br />
                <Typography.Text>{viewingIncome.serialNumber}</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Date:</Typography.Text>
                <br />
                <Typography.Text>{dayjs(viewingIncome.date).format('DD/MM/YYYY')}</Typography.Text>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Typography.Text strong>Income Source:</Typography.Text>
                <br />
                <Tag color="green">{viewingIncome.incomeSource}</Tag>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Payment Mode:</Typography.Text>
                <br />
                <Tag color="purple">{viewingIncome.paymentMode}</Tag>
              </Col>
            </Row>
            <Divider />
            <Typography.Text strong>Description:</Typography.Text>
            <br />
            <Typography.Text>{viewingIncome.description}</Typography.Text>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Typography.Text strong>Amount:</Typography.Text>
                <br />
                <Typography.Text style={{ fontSize: '18px', color: '#3f8600' }}>
                  ₹{viewingIncome.amount.toLocaleString()}
                </Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Status:</Typography.Text>
                <br />
                <Badge status={getStatusColor(viewingIncome.status)} text={viewingIncome.status} />
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Typography.Text strong>Received From:</Typography.Text>
                <br />
                <Typography.Text>{viewingIncome.receivedFrom}</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Receipt No:</Typography.Text>
                <br />
                <Typography.Text>{viewingIncome.receiptNo}</Typography.Text>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Typography.Text strong>Received By:</Typography.Text>
                <br />
                <Typography.Text>{viewingIncome.receivedBy}</Typography.Text>
              </Col>
              <Col span={12}>
                <Typography.Text strong>Created By:</Typography.Text>
                <br />
                <Typography.Text>{viewingIncome.createdBy?.name || 'N/A'}</Typography.Text>
              </Col>
            </Row>
            {viewingIncome.remarks && (
              <>
                <Divider />
                <Typography.Text strong>Remarks:</Typography.Text>
                <br />
                <Typography.Text>{viewingIncome.remarks}</Typography.Text>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IncomeLog; 