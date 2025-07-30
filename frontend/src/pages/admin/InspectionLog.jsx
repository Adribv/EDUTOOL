import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select, DatePicker, Space, Row, Col, Statistic, Tag, Tooltip, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, CalendarOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const InspectionLog = () => {
  const [inspectionLogs, setInspectionLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);
  const [viewingInspection, setViewingInspection] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});

  // Fetch inspection logs
  const fetchInspectionLogs = async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.pageSize,
        ...filters
      });
      
      const response = await api.get(`/inspection-logs?${params}`);
      setInspectionLogs(response.data.inspectionLogs);
      setPagination(prev => ({
        ...prev,
        current: response.data.pagination.currentPage,
        total: response.data.pagination.totalItems
      }));
    } catch (error) {
      message.error('Failed to fetch inspection logs');
      console.error('Error fetching inspection logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/inspection-logs/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchInspectionLogs();
    fetchStats();
  }, []);

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    const newFilters = {};
    if (filters.purposeOfVisit) newFilters.purposeOfVisit = filters.purposeOfVisit[0];
    if (filters.status) newFilters.status = filters.status[0];
    if (filters.priority) newFilters.priority = filters.priority[0];
    
    setFilters(newFilters);
    fetchInspectionLogs(pagination.current, newFilters);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const inspectionData = {
        ...values,
        dateOfInspection: values.dateOfInspection?.toISOString(),
        nextVisitDate: values.nextVisitDate?.toISOString()
      };

      if (editingInspection) {
        await api.put(`/inspection-logs/${editingInspection._id}`, inspectionData);
        message.success('Inspection log updated successfully');
      } else {
        await api.post('/inspection-logs', inspectionData);
        message.success('Inspection log created successfully');
      }

      setModalVisible(false);
      setEditingInspection(null);
      form.resetFields();
      fetchInspectionLogs();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`/inspection-logs/${id}`);
      message.success('Inspection log deleted successfully');
      fetchInspectionLogs();
      fetchStats();
    } catch (error) {
      message.error('Failed to delete inspection log');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/inspection-logs/${id}/status`, { status });
      message.success('Status updated successfully');
      fetchInspectionLogs();
      fetchStats();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  // Open create modal
  const showCreateModal = () => {
    setEditingInspection(null);
    setModalVisible(true);
    form.resetFields();
  };

  // Open edit modal
  const showEditModal = (inspection) => {
    setEditingInspection(inspection);
    setModalVisible(true);
    form.setFieldsValue({
      ...inspection,
      dateOfInspection: inspection.dateOfInspection ? dayjs(inspection.dateOfInspection) : null,
      nextVisitDate: inspection.nextVisitDate ? dayjs(inspection.nextVisitDate) : null
    });
  };

  // Open view modal
  const showViewModal = (inspection) => {
    setViewingInspection(inspection);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'green',
      'Medium': 'blue',
      'High': 'orange',
      'Critical': 'red'
    };
    return colors[priority] || 'blue';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'orange',
      'In Progress': 'blue',
      'Completed': 'green',
      'Follow-up Required': 'red'
    };
    return colors[status] || 'blue';
  };

  // Columns for the table
  const columns = [
    {
      title: 'Date of Inspection',
      dataIndex: 'dateOfInspection',
      key: 'dateOfInspection',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: true
    },
    {
      title: 'Inspector',
      key: 'inspector',
      render: (_, record) => (
        <div>
          <div><strong>{record.inspectorName}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.designation}</div>
        </div>
      )
    },
    {
      title: 'Purpose',
      dataIndex: 'purposeOfVisit',
      key: 'purposeOfVisit',
      filters: [
        { text: 'Routine Check', value: 'Routine Check' },
        { text: 'Surprise Audit', value: 'Surprise Audit' },
        { text: 'Syllabus Review', value: 'Syllabus Review' },
        { text: 'Safety Inspection', value: 'Safety Inspection' },
        { text: 'Academic Review', value: 'Academic Review' },
        { text: 'Infrastructure Check', value: 'Infrastructure Check' },
        { text: 'Compliance Audit', value: 'Compliance Audit' },
        { text: 'Other', value: 'Other' }
      ],
      render: (purpose) => <Tag color="blue">{purpose}</Tag>
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      filters: [
        { text: 'Low', value: 'Low' },
        { text: 'Medium', value: 'Medium' },
        { text: 'High', value: 'High' },
        { text: 'Critical', value: 'Critical' }
      ],
      render: (priority) => <Tag color={getPriorityColor(priority)}>{priority}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Follow-up Required', value: 'Follow-up Required' }
      ],
      render: (status, record) => (
        <Space>
          <Badge 
            status={status === 'Completed' ? 'success' : status === 'In Progress' ? 'processing' : 'default'} 
            text={status} 
          />
          {['VP', 'Principal'].includes(user?.role) && (
            <Button
              size="small"
              type="link"
              onClick={() => {
                const nextStatus = status === 'Pending' ? 'In Progress' : 
                                 status === 'In Progress' ? 'Completed' : 'Follow-up Required';
                handleStatusUpdate(record._id, nextStatus);
              }}
            >
              Update
            </Button>
          )}
        </Space>
      )
    },
    {
      title: 'Follow-up',
      dataIndex: 'followUpRequired',
      key: 'followUpRequired',
      render: (followUp, record) => (
        <Space>
          <Badge 
            status={followUp ? 'error' : 'success'} 
            text={followUp ? 'Required' : 'Not Required'} 
          />
          {record.nextVisitDate && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Next: {dayjs(record.nextVisitDate).format('DD/MM/YYYY')}
            </div>
          )}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showViewModal(record)}
          >
            View
          </Button>
          {['VP', 'Principal', 'AdminStaff'].includes(user?.role) && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            >
              Edit
            </Button>
          )}
          {(user?.role === 'Admin' || user?.role === 'AdminStaff') && (
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
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>
          <SearchOutlined style={{ marginRight: '8px' }} />
          Inspection Log Management
        </h1>
        {(user?.role === 'Admin' || user?.role === 'AdminStaff') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Create Inspection Log
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Inspections"
              value={stats.overall?.totalInspections || 0}
              prefix={<SearchOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Inspections"
              value={stats.overall?.pendingInspections || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Inspections"
              value={stats.overall?.completedInspections || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Follow-up Required"
              value={stats.overall?.followUpRequired || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Inspection Logs Table */}
      <Card title="Inspection Logs" style={{ marginBottom: '24px' }}>
        <Table
          columns={columns}
          dataSource={inspectionLogs}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingInspection ? 'Edit Inspection Log' : 'Create Inspection Log'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingInspection(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfInspection"
                label="Date of Inspection"
                rules={[{ required: true, message: 'Please select inspection date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="purposeOfVisit"
                label="Purpose of Visit"
                rules={[{ required: true, message: 'Please select purpose of visit' }]}
              >
                <Select placeholder="Select purpose of visit">
                  <Option value="Routine Check">Routine Check</Option>
                  <Option value="Surprise Audit">Surprise Audit</Option>
                  <Option value="Syllabus Review">Syllabus Review</Option>
                  <Option value="Safety Inspection">Safety Inspection</Option>
                  <Option value="Academic Review">Academic Review</Option>
                  <Option value="Infrastructure Check">Infrastructure Check</Option>
                  <Option value="Compliance Audit">Compliance Audit</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inspectorName"
                label="Inspector Name"
                rules={[{ required: true, message: 'Please enter inspector name' }]}
              >
                <Input placeholder="Enter inspector name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="designation"
                label="Designation"
                rules={[{ required: true, message: 'Please enter designation' }]}
              >
                <Input placeholder="e.g., DEO, Cluster Officer, Principal" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department"
              >
                <Input placeholder="Enter department (optional)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="summaryOfObservations"
            label="Summary of Observations"
            rules={[{ required: true, message: 'Please enter summary of observations' }]}
          >
            <TextArea rows={3} placeholder="Brief summary of key observations from the inspection" />
          </Form.Item>

          <Form.Item
            name="recommendationsGiven"
            label="Recommendations Given"
          >
            <TextArea rows={3} placeholder="Official suggestions or improvements advised" />
          </Form.Item>

          <Form.Item
            name="actionTakenBySchool"
            label="Action Taken by School"
          >
            <TextArea rows={3} placeholder="Responses or steps taken after inspection" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="followUpRequired"
                label="Follow-up Required"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextVisitDate"
                label="Next Visit Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Additional Notes"
          >
            <TextArea rows={2} placeholder="Any additional notes" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingInspection ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingInspection(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Inspection Log Details"
        open={!!viewingInspection}
        onCancel={() => setViewingInspection(null)}
        footer={null}
        width={800}
      >
        {viewingInspection && (
          <div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Date of Inspection:</strong> {dayjs(viewingInspection.dateOfInspection).format('DD/MM/YYYY')}
              </Col>
              <Col span={12}>
                <strong>Purpose of Visit:</strong> <Tag color="blue">{viewingInspection.purposeOfVisit}</Tag>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Inspector:</strong> {viewingInspection.inspectorName}
              </Col>
              <Col span={12}>
                <strong>Designation:</strong> {viewingInspection.designation}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Priority:</strong> <Tag color={getPriorityColor(viewingInspection.priority)}>{viewingInspection.priority}</Tag>
              </Col>
              <Col span={12}>
                <strong>Status:</strong> <Tag color={getStatusColor(viewingInspection.status)}>{viewingInspection.status}</Tag>
              </Col>
            </Row>
            {viewingInspection.department && (
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                  <strong>Department:</strong> {viewingInspection.department}
                </Col>
              </Row>
            )}
            <div style={{ marginBottom: '16px' }}>
              <strong>Summary of Observations:</strong>
              <p>{viewingInspection.summaryOfObservations}</p>
            </div>
            {viewingInspection.recommendationsGiven && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Recommendations Given:</strong>
                <p>{viewingInspection.recommendationsGiven}</p>
              </div>
            )}
            {viewingInspection.actionTakenBySchool && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Action Taken by School:</strong>
                <p>{viewingInspection.actionTakenBySchool}</p>
              </div>
            )}
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Follow-up Required:</strong> 
                <Badge 
                  status={viewingInspection.followUpRequired ? 'error' : 'success'} 
                  text={viewingInspection.followUpRequired ? 'Yes' : 'No'} 
                />
              </Col>
              {viewingInspection.nextVisitDate && (
                <Col span={12}>
                  <strong>Next Visit Date:</strong> {dayjs(viewingInspection.nextVisitDate).format('DD/MM/YYYY')}
                </Col>
              )}
            </Row>
            {viewingInspection.notes && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Notes:</strong>
                <p>{viewingInspection.notes}</p>
              </div>
            )}
            <Row gutter={16}>
              <Col span={12}>
                <strong>Created By:</strong> {viewingInspection.createdBy?.name || 'Unknown'}
              </Col>
              {viewingInspection.lastEditedBy && (
                <Col span={12}>
                  <strong>Last Edited By:</strong> {viewingInspection.lastEditedBy.name}
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InspectionLog; 