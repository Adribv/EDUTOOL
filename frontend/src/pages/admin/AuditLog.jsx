import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select, DatePicker, Space, Row, Col, Statistic, Tag, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, CalendarOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const AuditLog = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAudit, setEditingAudit] = useState(null);
  const [viewingAudit, setViewingAudit] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});

  // Fetch audit logs
  const fetchAuditLogs = async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.pageSize,
        ...filters
      });
      
      const response = await api.get(`/audit-logs?${params}`);
      setAuditLogs(response.data.auditLogs);
      setPagination(prev => ({
        ...prev,
        current: response.data.pagination.currentPage,
        total: response.data.pagination.totalItems
      }));
    } catch (error) {
      message.error('Failed to fetch audit logs');
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/audit-logs/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, []);

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    const newFilters = {};
    if (filters.auditType) newFilters.auditType = filters.auditType[0];
    if (filters.status) newFilters.status = filters.status[0];
    
    setFilters(newFilters);
    fetchAuditLogs(pagination.current, newFilters);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const auditData = {
        ...values,
        dateOfAudit: values.dateOfAudit?.toISOString(),
        targetCompletionDate: values.targetCompletionDate?.toISOString()
      };

      if (editingAudit) {
        await api.put(`/audit-logs/${editingAudit._id}`, auditData);
        message.success('Audit log updated successfully');
      } else {
        await api.post('/audit-logs', auditData);
        message.success('Audit log created successfully');
      }

      setModalVisible(false);
      setEditingAudit(null);
      form.resetFields();
      fetchAuditLogs();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`/audit-logs/${id}`);
      message.success('Audit log deleted successfully');
      fetchAuditLogs();
      fetchStats();
    } catch (error) {
      message.error('Failed to delete audit log');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/audit-logs/${id}/status`, { status });
      message.success('Status updated successfully');
      fetchAuditLogs();
      fetchStats();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  // Open create modal
  const showCreateModal = () => {
    setEditingAudit(null);
    setModalVisible(true);
    form.resetFields();
  };

  // Open edit modal
  const showEditModal = (audit) => {
    setEditingAudit(audit);
    setModalVisible(true);
    form.setFieldsValue({
      ...audit,
      dateOfAudit: audit.dateOfAudit ? dayjs(audit.dateOfAudit) : null,
      targetCompletionDate: audit.targetCompletionDate ? dayjs(audit.targetCompletionDate) : null
    });
  };

  // Open view modal
  const showViewModal = (audit) => {
    setViewingAudit(audit);
  };

  // Columns for the table
  const columns = [
    {
      title: 'Date of Audit',
      dataIndex: 'dateOfAudit',
      key: 'dateOfAudit',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: true
    },
    {
      title: 'Audit Type',
      dataIndex: 'auditType',
      key: 'auditType',
      filters: [
        { text: 'Financial', value: 'Financial' },
        { text: 'Academic', value: 'Academic' },
        { text: 'Safety', value: 'Safety' },
        { text: 'Infrastructure', value: 'Infrastructure' },
        { text: 'Administrative', value: 'Administrative' },
        { text: 'Other', value: 'Other' }
      ],
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Auditor',
      key: 'auditor',
      render: (_, record) => (
        <div>
          <div><strong>{record.auditorName}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.designation}</div>
        </div>
      )
    },
    {
      title: 'Scope',
      dataIndex: 'scopeOfAudit',
      key: 'scopeOfAudit',
      ellipsis: true,
      render: (scope) => (
        <Tooltip title={scope}>
          <span>{scope}</span>
        </Tooltip>
      )
    },
    {
      title: 'Compliance',
      dataIndex: 'complianceStatus',
      key: 'complianceStatus',
      render: (status) => {
        const colors = {
          'Compliant': 'green',
          'Partially Compliant': 'orange',
          'Non-Compliant': 'red'
        };
        return <Badge color={colors[status]} text={status} />;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Open', value: 'Open' },
        { text: 'Closed', value: 'Closed' }
      ],
      render: (status, record) => (
        <Space>
          <Badge 
            status={status === 'Open' ? 'processing' : 'success'} 
            text={status} 
          />
          {['VP', 'Principal'].includes(user?.role) && (
            <Button
              size="small"
              type="link"
              onClick={() => handleStatusUpdate(record._id, status === 'Open' ? 'Closed' : 'Open')}
            >
              {status === 'Open' ? 'Close' : 'Reopen'}
            </Button>
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
          {['VP', 'Principal'].includes(user?.role) && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            >
              Edit
            </Button>
          )}
          {user?.role === 'Admin' && (
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
          <FileTextOutlined style={{ marginRight: '8px' }} />
          Audit Log Management
        </h1>
        {user?.role === 'Admin' && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Create Audit Log
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Audits"
              value={stats.overall?.totalAudits || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Open Audits"
              value={stats.overall?.openAudits || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Closed Audits"
              value={stats.overall?.closedAudits || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Compliance Rate"
              value={stats.overall?.totalAudits ? 
                Math.round(((stats.overall?.closedAudits || 0) / stats.overall?.totalAudits) * 100) : 0}
              suffix="%"
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Audit Logs Table */}
      <Card title="Audit Logs" style={{ marginBottom: '24px' }}>
        <Table
          columns={columns}
          dataSource={auditLogs}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingAudit ? 'Edit Audit Log' : 'Create Audit Log'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingAudit(null);
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
                name="dateOfAudit"
                label="Date of Audit"
                rules={[{ required: true, message: 'Please select audit date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="auditType"
                label="Audit Type"
                rules={[{ required: true, message: 'Please select audit type' }]}
              >
                <Select placeholder="Select audit type">
                  <Option value="Financial">Financial</Option>
                  <Option value="Academic">Academic</Option>
                  <Option value="Safety">Safety</Option>
                  <Option value="Infrastructure">Infrastructure</Option>
                  <Option value="Administrative">Administrative</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="auditorName"
                label="Auditor Name"
                rules={[{ required: true, message: 'Please enter auditor name' }]}
              >
                <Input placeholder="Enter auditor name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="designation"
                label="Designation"
                rules={[{ required: true, message: 'Please enter designation' }]}
              >
                <Input placeholder="Enter designation" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="scopeOfAudit"
            label="Scope of Audit"
            rules={[{ required: true, message: 'Please enter scope of audit' }]}
          >
            <TextArea rows={3} placeholder="Describe the scope of the audit" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="complianceStatus"
                label="Compliance Status"
                rules={[{ required: true, message: 'Please select compliance status' }]}
              >
                <Select placeholder="Select compliance status">
                  <Option value="Compliant">Compliant</Option>
                  <Option value="Partially Compliant">Partially Compliant</Option>
                  <Option value="Non-Compliant">Non-Compliant</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetCompletionDate"
                label="Target Completion Date"
                rules={[{ required: true, message: 'Please select target completion date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="nonConformitiesIdentified"
            label="Non-Conformities Identified"
          >
            <TextArea rows={3} placeholder="Describe any non-conformities identified" />
          </Form.Item>

          <Form.Item
            name="recommendations"
            label="Recommendations / Corrective Actions"
          >
            <TextArea rows={3} placeholder="Describe recommendations and corrective actions" />
          </Form.Item>

          <Form.Item
            name="responsiblePerson"
            label="Responsible Person"
            rules={[{ required: true, message: 'Please enter responsible person' }]}
          >
            <Input placeholder="Enter responsible person name" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Additional Notes"
          >
            <TextArea rows={2} placeholder="Any additional notes" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAudit ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingAudit(null);
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
        title="Audit Log Details"
        open={!!viewingAudit}
        onCancel={() => setViewingAudit(null)}
        footer={null}
        width={800}
      >
        {viewingAudit && (
          <div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Date of Audit:</strong> {dayjs(viewingAudit.dateOfAudit).format('DD/MM/YYYY')}
              </Col>
              <Col span={12}>
                <strong>Audit Type:</strong> <Tag color="blue">{viewingAudit.auditType}</Tag>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Auditor:</strong> {viewingAudit.auditorName}
              </Col>
              <Col span={12}>
                <strong>Designation:</strong> {viewingAudit.designation}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Compliance Status:</strong> 
                <Badge 
                  color={
                    viewingAudit.complianceStatus === 'Compliant' ? 'green' :
                    viewingAudit.complianceStatus === 'Partially Compliant' ? 'orange' : 'red'
                  } 
                  text={viewingAudit.complianceStatus} 
                />
              </Col>
              <Col span={12}>
                <strong>Status:</strong> 
                <Badge 
                  status={viewingAudit.status === 'Open' ? 'processing' : 'success'} 
                  text={viewingAudit.status} 
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Target Completion:</strong> {dayjs(viewingAudit.targetCompletionDate).format('DD/MM/YYYY')}
              </Col>
              <Col span={12}>
                <strong>Responsible Person:</strong> {viewingAudit.responsiblePerson}
              </Col>
            </Row>
            <div style={{ marginBottom: '16px' }}>
              <strong>Scope of Audit:</strong>
              <p>{viewingAudit.scopeOfAudit}</p>
            </div>
            {viewingAudit.nonConformitiesIdentified && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Non-Conformities Identified:</strong>
                <p>{viewingAudit.nonConformitiesIdentified}</p>
              </div>
            )}
            {viewingAudit.recommendations && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Recommendations:</strong>
                <p>{viewingAudit.recommendations}</p>
              </div>
            )}
            {viewingAudit.notes && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Notes:</strong>
                <p>{viewingAudit.notes}</p>
              </div>
            )}
            <Row gutter={16}>
              <Col span={12}>
                <strong>Created By:</strong> {viewingAudit.createdBy?.name || 'Unknown'}
              </Col>
              {viewingAudit.lastEditedBy && (
                <Col span={12}>
                  <strong>Last Edited By:</strong> {viewingAudit.lastEditedBy.name}
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLog; 