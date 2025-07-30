import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select, DatePicker, Space, Row, Col, Statistic, Tag, Tooltip, message, Divider, Typography, TimePicker, Upload, List, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CalendarOutlined, UserOutlined, FileTextOutlined, CheckOutlined, CloseOutlined, SendOutlined, ClockCircleOutlined, TeamOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { meetingMinutesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const MeetingMinutes = () => {
  const [meetingMinutes, setMeetingMinutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [viewingMeeting, setViewingMeeting] = useState(null);
  const [approvingMeeting, setApprovingMeeting] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const { user } = useAuth();

  const [form] = Form.useForm();
  const [approvalForm] = Form.useForm();

  // Meeting types
  const meetingTypes = [
    'Academic', 'Administrative', 'Staff', 'Parent-Teacher', 'Board', 'Other'
  ];

  // Status options
  const statusOptions = ['Draft', 'Submitted', 'VP Approved', 'Principal Approved', 'Rejected'];

  // Action item status options
  const actionStatusOptions = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

  useEffect(() => {
    fetchMeetingMinutes();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchMeetingMinutes = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };
      
      const response = await meetingMinutesAPI.getMeetingMinutes(params);
      setMeetingMinutes(response.docs || []);
      setPagination(prev => ({
        ...prev,
        total: response.totalDocs || 0
      }));
    } catch (error) {
      message.error('Failed to fetch meeting minutes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await meetingMinutesAPI.getMeetingMinutesStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreate = async (values) => {
    try {
      const meetingData = {
        ...values,
        meetingDate: values.meetingDate.toDate(),
        meetingTime: values.meetingTime.format('HH:mm'),
        attendees: values.attendees ? values.attendees.split('\n').filter(a => a.trim()) : [],
        apologies: values.apologies ? values.apologies.split('\n').filter(a => a.trim()) : []
      };
      
      await meetingMinutesAPI.createMeetingMinutes(meetingData);
      message.success('Meeting minutes created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      fetchMeetingMinutes();
      fetchStats();
    } catch (error) {
      message.error('Failed to create meeting minutes');
    }
  };

  const handleUpdate = async (values) => {
    try {
      const meetingData = {
        ...values,
        meetingDate: values.meetingDate.toDate(),
        meetingTime: values.meetingTime.format('HH:mm'),
        attendees: values.attendees ? values.attendees.split('\n').filter(a => a.trim()) : [],
        apologies: values.apologies ? values.apologies.split('\n').filter(a => a.trim()) : []
      };
      
      await meetingMinutesAPI.updateMeetingMinutes(editingMeeting._id, meetingData);
      message.success('Meeting minutes updated successfully');
      setEditModalVisible(false);
      setEditingMeeting(null);
      form.resetFields();
      fetchMeetingMinutes();
      fetchStats();
    } catch (error) {
      message.error('Failed to update meeting minutes');
    }
  };

  const handleDelete = async (id) => {
    try {
      await meetingMinutesAPI.deleteMeetingMinutes(id);
      message.success('Meeting minutes deleted successfully');
      fetchMeetingMinutes();
      fetchStats();
    } catch (error) {
      message.error('Failed to delete meeting minutes');
    }
  };

  const handleSubmit = async (id) => {
    try {
      await meetingMinutesAPI.submitMeetingMinutes(id);
      message.success('Meeting minutes submitted for approval');
      fetchMeetingMinutes();
      fetchStats();
    } catch (error) {
      message.error('Failed to submit meeting minutes');
    }
  };

  const handleApproval = async (values) => {
    try {
      const { approvalType, remarks } = values;
      
      if (approvalType === 'approve') {
        if (user.role === 'VP') {
          await meetingMinutesAPI.vpApproveMeetingMinutes(approvingMeeting._id, { remarks });
          message.success('Meeting minutes approved by VP');
        } else if (user.role === 'Principal') {
          await meetingMinutesAPI.principalApproveMeetingMinutes(approvingMeeting._id, { remarks });
          message.success('Meeting minutes approved by Principal');
        }
      } else {
        await meetingMinutesAPI.rejectMeetingMinutes(approvingMeeting._id, { remarks });
        message.success('Meeting minutes rejected');
      }
      
      setApprovalModalVisible(false);
      setApprovingMeeting(null);
      approvalForm.resetFields();
      fetchMeetingMinutes();
      fetchStats();
    } catch (error) {
      message.error('Failed to process approval');
    }
  };

  const showCreateModal = () => {
    setCreateModalVisible(true);
    form.resetFields();
  };

  const showEditModal = (meeting) => {
    setEditingMeeting(meeting);
    setEditModalVisible(true);
    form.setFieldsValue({
      ...meeting,
      meetingDate: dayjs(meeting.meetingDate),
      meetingTime: dayjs(meeting.meetingTime, 'HH:mm'),
      attendees: meeting.attendees ? meeting.attendees.join('\n') : '',
      apologies: meeting.apologies ? meeting.apologies.join('\n') : ''
    });
  };

  const showViewModal = (meeting) => {
    setViewingMeeting(meeting);
    setViewModalVisible(true);
  };

  const showApprovalModal = (meeting) => {
    setApprovingMeeting(meeting);
    setApprovalModalVisible(true);
    approvalForm.resetFields();
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
      'Draft': 'default',
      'Submitted': 'processing',
      'VP Approved': 'warning',
      'Principal Approved': 'success',
      'Rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getActionStatusColor = (status) => {
    const colors = {
      'Not Started': 'default',
      'In Progress': 'processing',
      'Completed': 'success',
      'On Hold': 'warning',
      'Cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  const canEdit = (meeting) => {
    const userRole = user?.role;
    const status = meeting.approvalStatus;
    
    if (userRole === 'Admin') {
      return ['Draft', 'Submitted'].includes(status);
    }
    if (userRole === 'VP') {
      return ['Submitted', 'VP Approved'].includes(status);
    }
    if (userRole === 'Principal') {
      return ['VP Approved', 'Principal Approved'].includes(status);
    }
    return false;
  };

  const canApprove = (meeting) => {
    const userRole = user?.role;
    const status = meeting.approvalStatus;
    
    if (userRole === 'VP' && status === 'Submitted') {
      return true;
    }
    if (userRole === 'Principal' && status === 'VP Approved') {
      return true;
    }
    return false;
  };

  const columns = [
    {
      title: 'Meeting Number',
      dataIndex: 'meetingNumber',
      key: 'meetingNumber',
      width: 150
    },
    {
      title: 'Meeting Title',
      dataIndex: 'meetingTitle',
      key: 'meetingTitle',
      width: 200,
      ellipsis: true
    },
    {
      title: 'Date & Time',
      key: 'dateTime',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{dayjs(record.meetingDate).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.meetingTime}</div>
        </div>
      )
    },
    {
      title: 'Chairperson',
      dataIndex: 'chairperson',
      key: 'chairperson',
      width: 120,
      ellipsis: true
    },
    {
      title: 'Type',
      dataIndex: 'meetingType',
      key: 'meetingType',
      width: 120,
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      width: 120,
      render: (status) => <Badge status={getStatusColor(status)} text={status} />
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
          {canEdit(record) && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            >
              Edit
            </Button>
          )}
          {user?.role === 'Admin' && record.approvalStatus === 'Draft' && (
            <Button
              type="link"
              icon={<SendOutlined />}
              onClick={() => handleSubmit(record._id)}
            >
              Submit
            </Button>
          )}
          {canApprove(record) && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => showApprovalModal(record)}
            >
              Approve
            </Button>
          )}
          {user?.role === 'Admin' && record.approvalStatus === 'Draft' && (
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
      <Card title="School Meeting Minutes Management" extra={
        user?.role === 'Admin' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
            Create Meeting Minutes
          </Button>
        )
      }>
        {/* Statistics Row */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="Total Meetings"
                value={stats.overview?.totalMeetings || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Draft"
                value={stats.overview?.draftCount || 0}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Submitted"
                value={stats.overview?.submittedCount || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="VP Approved"
                value={stats.overview?.vpApprovedCount || 0}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Principal Approved"
                value={stats.overview?.principalApprovedCount || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Rejected"
                value={stats.overview?.rejectedCount || 0}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Input
                placeholder="Search meeting title, chairperson, meeting number..."
                prefix={<FileTextOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Meeting Type"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => handleFilter('meetingType', value)}
              >
                {meetingTypes.map(type => (
                  <Option key={type} value={type}>{type}</Option>
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
            <Col span={10}>
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
          dataSource={meetingMinutes}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create Meeting Minutes"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          {/* Meeting Details Section */}
          <Card title="Meeting Details" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="meetingTitle"
                  label="Meeting Title"
                  rules={[{ required: true, message: 'Please enter meeting title' }]}
                >
                  <Input placeholder="Enter meeting title" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="meetingType"
                  label="Meeting Type"
                  rules={[{ required: true, message: 'Please select meeting type' }]}
                >
                  <Select placeholder="Select meeting type">
                    {meetingTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="meetingDate"
                  label="Meeting Date"
                  rules={[{ required: true, message: 'Please select meeting date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="meetingTime"
                  label="Meeting Time"
                  rules={[{ required: true, message: 'Please select meeting time' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="venue"
                  label="Venue"
                  rules={[{ required: true, message: 'Please enter venue' }]}
                >
                  <Input placeholder="Enter venue" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="chairperson"
                  label="Chairperson"
                  rules={[{ required: true, message: 'Please enter chairperson' }]}
                >
                  <Input placeholder="Enter chairperson name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="recorder"
                  label="Recorder (Minutes by)"
                  rules={[{ required: true, message: 'Please enter recorder' }]}
                >
                  <Input placeholder="Enter recorder name" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="attendees"
                  label="Attendees"
                >
                  <TextArea rows={3} placeholder="Enter attendees (one per line)" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="apologies"
                  label="Apologies"
                >
                  <TextArea rows={3} placeholder="Enter apologies (one per line)" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Agenda Items Section */}
          <Card title="Agenda Items & Discussions" style={{ marginBottom: 16 }}>
            <Form.List name="agendaItems">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" style={{ marginBottom: 8 }}>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'agendaItem']}
                            label="Agenda Item"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="Enter agenda item" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'discussionSummary']}
                            label="Discussion Summary"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <TextArea rows={2} placeholder="Brief discussion summary" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'decisionsTaken']}
                            label="Decisions Taken"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <TextArea rows={2} placeholder="Decisions made" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'remarks']}
                            label="Remarks"
                          >
                            <TextArea rows={2} placeholder="Additional remarks" />
                          </Form.Item>
                        </Col>
                        <Col span={1}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            style={{ marginTop: 32 }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Agenda Item
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          {/* Action Items Section */}
          <Card title="Action Log (Task Follow-up)" style={{ marginBottom: 16 }}>
            <Form.List name="actionItems">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" style={{ marginBottom: 8 }}>
                      <Row gutter={16}>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'actionItem']}
                            label="Action Item/Task"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="Enter action item" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'responsiblePerson']}
                            label="Responsible Person"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="Enter responsible person" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'deadline']}
                            label="Deadline"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <DatePicker style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'status']}
                            label="Status"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Select placeholder="Select status">
                              {actionStatusOptions.map(status => (
                                <Option key={status} value={status}>{status}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'remarks']}
                            label="Remarks"
                          >
                            <TextArea rows={2} placeholder="Additional remarks" />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            style={{ marginTop: 32 }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Action Item
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Meeting Minutes
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal - Similar structure to Create Modal */}
      <Modal
        title="Edit Meeting Minutes"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          {/* Same form structure as Create Modal */}
          <Card title="Meeting Details" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="meetingTitle"
                  label="Meeting Title"
                  rules={[{ required: true, message: 'Please enter meeting title' }]}
                >
                  <Input placeholder="Enter meeting title" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="meetingType"
                  label="Meeting Type"
                  rules={[{ required: true, message: 'Please select meeting type' }]}
                >
                  <Select placeholder="Select meeting type">
                    {meetingTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="meetingDate"
                  label="Meeting Date"
                  rules={[{ required: true, message: 'Please select meeting date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="meetingTime"
                  label="Meeting Time"
                  rules={[{ required: true, message: 'Please select meeting time' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="venue"
                  label="Venue"
                  rules={[{ required: true, message: 'Please enter venue' }]}
                >
                  <Input placeholder="Enter venue" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="chairperson"
                  label="Chairperson"
                  rules={[{ required: true, message: 'Please enter chairperson' }]}
                >
                  <Input placeholder="Enter chairperson name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="recorder"
                  label="Recorder (Minutes by)"
                  rules={[{ required: true, message: 'Please enter recorder' }]}
                >
                  <Input placeholder="Enter recorder name" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="attendees"
                  label="Attendees"
                >
                  <TextArea rows={3} placeholder="Enter attendees (one per line)" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="apologies"
                  label="Apologies"
                >
                  <TextArea rows={3} placeholder="Enter apologies (one per line)" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Agenda Items Section */}
          <Card title="Agenda Items & Discussions" style={{ marginBottom: 16 }}>
            <Form.List name="agendaItems">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" style={{ marginBottom: 8 }}>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'agendaItem']}
                            label="Agenda Item"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="Enter agenda item" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'discussionSummary']}
                            label="Discussion Summary"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <TextArea rows={2} placeholder="Brief discussion summary" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'decisionsTaken']}
                            label="Decisions Taken"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <TextArea rows={2} placeholder="Decisions made" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'remarks']}
                            label="Remarks"
                          >
                            <TextArea rows={2} placeholder="Additional remarks" />
                          </Form.Item>
                        </Col>
                        <Col span={1}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            style={{ marginTop: 32 }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Agenda Item
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          {/* Action Items Section */}
          <Card title="Action Log (Task Follow-up)" style={{ marginBottom: 16 }}>
            <Form.List name="actionItems">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" style={{ marginBottom: 8 }}>
                      <Row gutter={16}>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, 'actionItem']}
                            label="Action Item/Task"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="Enter action item" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'responsiblePerson']}
                            label="Responsible Person"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="Enter responsible person" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'deadline']}
                            label="Deadline"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <DatePicker style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'status']}
                            label="Status"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Select placeholder="Select status">
                              {actionStatusOptions.map(status => (
                                <Option key={status} value={status}>{status}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'remarks']}
                            label="Remarks"
                          >
                            <TextArea rows={2} placeholder="Additional remarks" />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            style={{ marginTop: 32 }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Action Item
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Meeting Minutes
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
        title="Meeting Minutes Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={
          <Button onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        }
        width={1200}
      >
        {viewingMeeting && (
          <div>
            {/* Meeting Details */}
            <Card title="Meeting Details" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Typography.Text strong>Meeting Number:</Typography.Text>
                  <br />
                  <Typography.Text>{viewingMeeting.meetingNumber}</Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong>Meeting Title:</Typography.Text>
                  <br />
                  <Typography.Text>{viewingMeeting.meetingTitle}</Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong>Meeting Type:</Typography.Text>
                  <br />
                  <Tag color="blue">{viewingMeeting.meetingType}</Tag>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Typography.Text strong>Date:</Typography.Text>
                  <br />
                  <Typography.Text>{dayjs(viewingMeeting.meetingDate).format('DD/MM/YYYY')}</Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong>Time:</Typography.Text>
                  <br />
                  <Typography.Text>{viewingMeeting.meetingTime}</Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong>Venue:</Typography.Text>
                  <br />
                  <Typography.Text>{viewingMeeting.venue}</Typography.Text>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Typography.Text strong>Chairperson:</Typography.Text>
                  <br />
                  <Typography.Text>{viewingMeeting.chairperson}</Typography.Text>
                </Col>
                <Col span={12}>
                  <Typography.Text strong>Recorder:</Typography.Text>
                  <br />
                  <Typography.Text>{viewingMeeting.recorder}</Typography.Text>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Typography.Text strong>Attendees:</Typography.Text>
                  <br />
                  {viewingMeeting.attendees && viewingMeeting.attendees.length > 0 ? (
                    <List
                      size="small"
                      dataSource={viewingMeeting.attendees}
                      renderItem={item => <List.Item>{item}</List.Item>}
                    />
                  ) : (
                    <Typography.Text type="secondary">No attendees listed</Typography.Text>
                  )}
                </Col>
                <Col span={12}>
                  <Typography.Text strong>Apologies:</Typography.Text>
                  <br />
                  {viewingMeeting.apologies && viewingMeeting.apologies.length > 0 ? (
                    <List
                      size="small"
                      dataSource={viewingMeeting.apologies}
                      renderItem={item => <List.Item>{item}</List.Item>}
                    />
                  ) : (
                    <Typography.Text type="secondary">No apologies listed</Typography.Text>
                  )}
                </Col>
              </Row>
            </Card>

            {/* Agenda Items */}
            <Card title="Agenda Items & Discussions" style={{ marginBottom: 16 }}>
              <Table
                columns={[
                  { title: 'S.NO', dataIndex: 'serialNumber', width: 60 },
                  { title: 'Agenda Item', dataIndex: 'agendaItem', width: 200 },
                  { title: 'Discussion Summary', dataIndex: 'discussionSummary', width: 250 },
                  { title: 'Decisions Taken', dataIndex: 'decisionsTaken', width: 200 },
                  { title: 'Remarks', dataIndex: 'remarks', width: 150 }
                ]}
                dataSource={viewingMeeting.agendaItems}
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
              />
            </Card>

            {/* Action Items */}
            <Card title="Action Log (Task Follow-up)" style={{ marginBottom: 16 }}>
              <Table
                columns={[
                  { title: 'S.No', dataIndex: 'serialNumber', width: 60 },
                  { title: 'Action Item/Task', dataIndex: 'actionItem', width: 200 },
                  { title: 'Responsible Person', dataIndex: 'responsiblePerson', width: 150 },
                  { 
                    title: 'Deadline', 
                    dataIndex: 'deadline', 
                    width: 120,
                    render: (date) => dayjs(date).format('DD/MM/YYYY')
                  },
                  { 
                    title: 'Status', 
                    dataIndex: 'status', 
                    width: 120,
                    render: (status) => <Badge status={getActionStatusColor(status)} text={status} />
                  },
                  { title: 'Remarks', dataIndex: 'remarks', width: 150 }
                ]}
                dataSource={viewingMeeting.actionItems}
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
              />
            </Card>

            {/* Approval Status */}
            <Card title="Approval Status" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Typography.Text strong>Current Status:</Typography.Text>
                  <br />
                  <Badge status={getStatusColor(viewingMeeting.approvalStatus)} text={viewingMeeting.approvalStatus} />
                </Col>
                <Col span={8}>
                  <Typography.Text strong>Created By:</Typography.Text>
                  <br />
                  <Typography.Text>{viewingMeeting.createdBy?.name || 'N/A'}</Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong>Last Modified:</Typography.Text>
                  <br />
                  <Typography.Text>{dayjs(viewingMeeting.lastModifiedAt).format('DD/MM/YYYY HH:mm')}</Typography.Text>
                </Col>
              </Row>
              {viewingMeeting.vpApproval && (
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Typography.Text strong>VP Approval:</Typography.Text>
                    <br />
                    <Typography.Text>By: {viewingMeeting.vpApproval.approvedBy?.name || 'N/A'}</Typography.Text>
                    <br />
                    <Typography.Text>Date: {dayjs(viewingMeeting.vpApproval.approvedAt).format('DD/MM/YYYY HH:mm')}</Typography.Text>
                    {viewingMeeting.vpApproval.remarks && (
                      <>
                        <br />
                        <Typography.Text>Remarks: {viewingMeeting.vpApproval.remarks}</Typography.Text>
                      </>
                    )}
                  </Col>
                </Row>
              )}
              {viewingMeeting.principalApproval && (
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={12}>
                    <Typography.Text strong>Principal Approval:</Typography.Text>
                    <br />
                    <Typography.Text>By: {viewingMeeting.principalApproval.approvedBy?.name || 'N/A'}</Typography.Text>
                    <br />
                    <Typography.Text>Date: {dayjs(viewingMeeting.principalApproval.approvedAt).format('DD/MM/YYYY HH:mm')}</Typography.Text>
                    {viewingMeeting.principalApproval.remarks && (
                      <>
                        <br />
                        <Typography.Text>Remarks: {viewingMeeting.principalApproval.remarks}</Typography.Text>
                      </>
                    )}
                  </Col>
                </Row>
              )}
            </Card>
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        title="Approve/Reject Meeting Minutes"
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={approvalForm}
          layout="vertical"
          onFinish={handleApproval}
        >
          <Form.Item
            name="approvalType"
            label="Action"
            rules={[{ required: true, message: 'Please select action' }]}
          >
            <Select placeholder="Select action">
              <Option value="approve">Approve</Option>
              <Option value="reject">Reject</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="remarks"
            label="Remarks"
          >
            <TextArea rows={4} placeholder="Enter approval/rejection remarks" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button onClick={() => setApprovalModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MeetingMinutes; 