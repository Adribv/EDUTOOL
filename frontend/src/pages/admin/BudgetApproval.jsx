import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Input, Select, DatePicker, Space, Row, Col, Statistic, Tag, Tooltip, message, InputNumber, Divider, Typography, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CloseOutlined, UploadOutlined, DollarOutlined, CalendarOutlined, UserOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const BudgetApproval = () => {
  const [budgetApprovals, setBudgetApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Sample data for testing
  const sampleBudgetData = [
    {
      _id: '1',
      schoolName: 'ABC Public School',
      academicYear: '2024-2025',
      preparedBy: 'John Smith',
      department: 'Administration',
      dateOfSubmission: '2024-01-15T00:00:00.000Z',
      budgetType: 'Annual',
      priority: 'High',
      status: 'Submitted',
      approvalStatus: 'Pending',
      totalProposedAmount: 2500000,
      totalApprovedAmount: 0,
      budgetItems: [
        {
          serialNumber: 1,
          budgetCategory: 'Salaries',
          description: 'Teaching staff salaries',
          proposedAmount: 1500000,
          approvedAmount: 0,
          remarks: 'Includes all teaching staff'
        },
        {
          serialNumber: 2,
          budgetCategory: 'Academic Materials',
          description: 'Textbooks and learning resources',
          proposedAmount: 300000,
          approvedAmount: 0,
          remarks: 'Updated curriculum materials'
        }
      ],
      notes: 'Comprehensive annual budget for 2024-2025 academic year'
    },
    {
      _id: '2',
      schoolName: 'ABC Public School',
      academicYear: '2024-2025',
      preparedBy: 'Sarah Johnson',
      department: 'Science Department',
      dateOfSubmission: '2024-01-20T00:00:00.000Z',
      budgetType: 'Quarterly',
      priority: 'Medium',
      status: 'Draft',
      approvalStatus: 'Pending',
      totalProposedAmount: 500000,
      totalApprovedAmount: 0,
      budgetItems: [
        {
          serialNumber: 1,
          budgetCategory: 'Academic Materials',
          description: 'Science lab equipment',
          proposedAmount: 250000,
          approvedAmount: 0,
          remarks: 'New lab instruments'
        }
      ],
      notes: 'Q1 budget for science department improvements'
    },
    {
      _id: '3',
      schoolName: 'ABC Public School',
      academicYear: '2024-2025',
      preparedBy: 'Michael Brown',
      department: 'Sports Department',
      dateOfSubmission: '2024-01-25T00:00:00.000Z',
      budgetType: 'Special Project',
      priority: 'High',
      status: 'Approved',
      approvalStatus: 'Approved as Presented',
      totalProposedAmount: 800000,
      totalApprovedAmount: 800000,
      budgetItems: [
        {
          serialNumber: 1,
          budgetCategory: 'Infrastructure',
          description: 'Sports ground renovation',
          proposedAmount: 500000,
          approvedAmount: 500000,
          remarks: 'Complete ground renovation'
        }
      ],
      notes: 'Special project for sports infrastructure development',
      approvalDate: '2024-02-01T00:00:00.000Z',
      principalName: 'Dr. Robert Wilson',
      approvalRemarks: 'Approved as presented. Excellent proposal for sports development.'
    }
  ];
  const [modalVisible, setModalVisible] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [viewingBudget, setViewingBudget] = useState(null);
  const [approvingBudget, setApprovingBudget] = useState(null);
  const [form] = Form.useForm();
  const [approvalForm] = Form.useForm();
  const { user } = useAuth();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});

  // Budget categories from the PDF
  const budgetCategories = [
    'Salaries',
    'Academic Materials',
    'Infrastructure',
    'Technology',
    'Utilities & Maintenance',
    'Events & Activities',
    'Miscellaneous'
  ];

  // Fetch budget approvals
  const fetchBudgetApprovals = async (page = 1, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.pageSize,
        ...filters
      });
      
      const response = await api.get(`/budget-approvals?${params}`);
      setBudgetApprovals(response.data.budgetApprovals);
      setPagination(prev => ({
        ...prev,
        current: response.data.pagination.currentPage,
        total: response.data.pagination.totalItems
      }));
    } catch (error) {
      message.error('Failed to fetch budget approvals');
      console.error('Error fetching budget approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/budget-approvals/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    // Load sample data for immediate display
    setBudgetApprovals(sampleBudgetData);
    
    // Set sample stats
    setStats({
      overall: {
        totalBudgets: sampleBudgetData.length,
        pendingBudgets: sampleBudgetData.filter(b => b.status === 'Submitted').length,
        approvedBudgets: sampleBudgetData.filter(b => b.status === 'Approved').length,
        rejectedBudgets: sampleBudgetData.filter(b => b.status === 'Rejected').length,
        totalProposedAmount: sampleBudgetData.reduce((sum, b) => sum + b.totalProposedAmount, 0),
        totalApprovedAmount: sampleBudgetData.reduce((sum, b) => sum + b.totalApprovedAmount, 0)
      }
    });
    
    // Don't fetch real data for now - just use sample data
    // fetchBudgetApprovals();
    // fetchStats();
  }, []);

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    const newFilters = {};
    if (filters.status) newFilters.status = filters.status[0];
    if (filters.academicYear) newFilters.academicYear = filters.academicYear[0];
    if (filters.budgetType) newFilters.budgetType = filters.budgetType[0];
    if (filters.approvalStatus) newFilters.approvalStatus = filters.approvalStatus[0];
    
    setFilters(newFilters);
    fetchBudgetApprovals(pagination.current, newFilters);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      
      // Add form data
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          if (key === 'dateOfSubmission') {
            formData.append(key, values[key]?.toISOString());
          } else if (key === 'budgetItems') {
            formData.append(key, JSON.stringify(values[key] || []));
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      // Add missing required fields
      formData.append('priority', values.priority || 'Medium');
      formData.append('status', 'Draft');
      formData.append('totalProposedAmount', '0'); // Will be calculated by the model

      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        formData.append('supportingDocuments', file);
      });

      if (editingBudget) {
        await api.put(`/budget-approvals/${editingBudget._id}`, formData);
        message.success('Budget approval updated successfully');
      } else {
        await api.post('/budget-approvals', formData);
        message.success('Budget approval created successfully');
      }

      setModalVisible(false);
      setEditingBudget(null);
      setUploadedFiles([]);
      form.resetFields();
      fetchBudgetApprovals();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Handle approval submission
  const handleApprovalSubmit = async (values) => {
    try {
      const approvalData = {
        approvalType: values.approvalType,
        approvalRemarks: values.approvalRemarks,
        approvedAmounts: values.approvedAmounts || []
      };

      await api.patch(`/budget-approvals/${approvingBudget._id}/approve`, approvalData);
      message.success('Budget approval processed successfully');
      
      setApprovalModalVisible(false);
      setApprovingBudget(null);
      approvalForm.resetFields();
      fetchBudgetApprovals();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Approval failed');
    }
  };

  // Handle rejection
  const handleReject = async (values) => {
    try {
      await api.patch(`/budget-approvals/${approvingBudget._id}/reject`, {
        rejectionReason: values.rejectionReason
      });
      message.success('Budget approval rejected successfully');
      
      setApprovalModalVisible(false);
      setApprovingBudget(null);
      approvalForm.resetFields();
      fetchBudgetApprovals();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Rejection failed');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    // Add confirmation dialog
    Modal.confirm({
      title: 'Are you sure you want to delete this budget approval?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          // For sample data, remove from local state
          if (id === '1' || id === '2' || id === '3') {
            const updatedBudgets = budgetApprovals.filter(b => b._id !== id);
            setBudgetApprovals(updatedBudgets);
            
            // Update stats
            const newStats = {
              overall: {
                totalBudgets: updatedBudgets.length,
                pendingBudgets: updatedBudgets.filter(b => b.status === 'Submitted').length,
                approvedBudgets: updatedBudgets.filter(b => b.status === 'Approved').length,
                rejectedBudgets: updatedBudgets.filter(b => b.status === 'Rejected').length,
                totalProposedAmount: updatedBudgets.reduce((sum, b) => sum + b.totalProposedAmount, 0),
                totalApprovedAmount: updatedBudgets.reduce((sum, b) => sum + b.totalApprovedAmount, 0)
              }
            };
            
            setStats(newStats);
            message.success('Budget approval deleted successfully');
            return;
          }

          // For real data, use the API
          await api.delete(`/budget-approvals/${id}`);
          message.success('Budget approval deleted successfully');
          fetchBudgetApprovals();
          fetchStats();
        } catch (error) {
          console.error('Error in delete operation:', error);
          message.error('Failed to delete budget approval');
        }
      }
    });
  };

  // Handle submit for review
  const handleSubmitForReview = async (id) => {
    try {
      await api.patch(`/budget-approvals/${id}/submit`);
      message.success('Budget approval submitted for review');
      fetchBudgetApprovals();
      fetchStats();
    } catch (error) {
      message.error('Failed to submit budget approval');
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async (id) => {
    try {
      // Find the budget data
      const budget = budgetApprovals.find(b => b._id === id);
      if (!budget) {
        message.error('Budget not found');
        return;
      }

      // For sample data, create a proper PDF using jsPDF
      if (id === '1' || id === '2' || id === '3') {
        
        const doc = new jsPDF();
        
        // Page setup
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);
        
        // Helper function to format currency properly - FIXED FORMATTING
        const formatCurrency = (amount) => {
          if (!amount || amount === 0) return '-';
          // Manual formatting to avoid any locale issues
          const numStr = amount.toString();
          let result = '';
          for (let i = numStr.length - 1, j = 0; i >= 0; i--, j++) {
            if (j > 0 && j % 3 === 0) {
              result = ',' + result;
            }
            result = numStr[i] + result;
          }
          return `₹${result}`;
        };
        
        // Helper function to wrap text
        const wrapText = (text, maxWidth) => {
          const words = text.split(' ');
          const lines = [];
          let currentLine = '';
          
          words.forEach(word => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = doc.getTextWidth(testLine);
            
            if (testWidth <= maxWidth) {
              currentLine = testLine;
            } else {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            }
          });
          
          if (currentLine) lines.push(currentLine);
          return lines;
        };
        
        let yPosition = 30;
        
        // Yellow header bar with title (like in the image)
        doc.setFillColor(255, 215, 0); // Yellow background
        doc.rect(0, yPosition - 10, pageWidth, 20, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('School Budget Approval', pageWidth / 2, yPosition + 5, { align: 'center' });
        
        yPosition += 25;
        
        // School Information Section (like in the image)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        const schoolInfo = [
          { label: 'School Name:', value: budget.schoolName },
          { label: 'Academic year:', value: budget.academicYear },
          { label: 'Prepared By:', value: budget.preparedBy },
          { label: 'Dept/Committee:', value: budget.department },
          { label: 'Date of Submission:', value: new Date(budget.dateOfSubmission).toLocaleDateString('en-IN') }
        ];
        
        schoolInfo.forEach(info => {
          doc.text(info.label, margin, yPosition);
          doc.text(info.value, margin + 50, yPosition);
          yPosition += 8;
        });
        
        yPosition += 10;
        
        // Budget Summary Table (like in the image)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Budget Summary Table:', margin, yPosition);
        
        yPosition += 12;
        
        // Table setup - EXACTLY LIKE THE IMAGE
        const tableHeaders = ['S.No', 'Budget category', 'Description', 'Proposed Amount', 'Approved Amount', 'Remarks'];
        const colWidths = [15, 35, 50, 30, 30, 35];
        const tableX = margin;
        const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
        
        // Draw table border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(tableX, yPosition - 5, tableWidth, 8, 'S');
        
        // Header row
        doc.setFillColor(240, 240, 240);
        doc.rect(tableX, yPosition - 5, tableWidth, 8, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        
        let xPos = tableX;
        tableHeaders.forEach((header, index) => {
          doc.text(header, xPos + 2, yPosition, { maxWidth: colWidths[index] - 4 });
          xPos += colWidths[index];
        });
        
        yPosition += 12;
        
        // Data rows - SHOW ACTUAL BUDGET DATA
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        budget.budgetItems.forEach((item, index) => {
          xPos = tableX;
          
          // S.No
          doc.text(item.serialNumber.toString(), xPos + 2, yPosition);
          xPos += colWidths[0];
          
          // Budget category
          doc.text(item.budgetCategory, xPos + 2, yPosition, { maxWidth: colWidths[1] - 4 });
          xPos += colWidths[1];
          
          // Description
          doc.text(item.description, xPos + 2, yPosition, { maxWidth: colWidths[2] - 4 });
          xPos += colWidths[2];
          
          // Proposed Amount
          const proposedText = formatCurrency(item.proposedAmount);
          doc.text(proposedText, xPos + 2, yPosition, { maxWidth: colWidths[3] - 4 });
          xPos += colWidths[3];
          
          // Approved Amount
          const approvedText = formatCurrency(item.approvedAmount);
          doc.text(approvedText, xPos + 2, yPosition, { maxWidth: colWidths[4] - 4 });
          xPos += colWidths[4];
          
          // Remarks
          doc.text(item.remarks || '-', xPos + 2, yPosition, { maxWidth: colWidths[5] - 4 });
          
          yPosition += 8;
        });
        
        // Total row (like in the image)
        yPosition += 5;
        doc.setFillColor(220, 220, 220);
        doc.rect(tableX, yPosition - 3, tableWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        
        xPos = tableX;
        doc.text('Total', xPos + 2, yPosition);
        xPos += colWidths[0] + colWidths[1];
        doc.text('', xPos + 2, yPosition); // Empty description
        xPos += colWidths[2];
        const totalProposedText = formatCurrency(budget.totalProposedAmount);
        doc.text(totalProposedText, xPos + 2, yPosition, { maxWidth: colWidths[3] - 4 });
        xPos += colWidths[3];
        const totalApprovedText = formatCurrency(budget.totalApprovedAmount);
        doc.text(totalApprovedText, xPos + 2, yPosition, { maxWidth: colWidths[4] - 4 });
        xPos += colWidths[4];
        doc.text('', xPos + 2, yPosition); // Empty remarks
        
        // Notes section (if available)
        if (budget.notes) {
          yPosition += 20;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Notes:', margin, yPosition);
          yPosition += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(budget.notes, margin, yPosition, { maxWidth: contentWidth });
          yPosition += 15;
        }
        
        // Approval section (like in the image)
        yPosition += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('I, the undersigned Principal, have reviewed the above budget proposal and', margin, yPosition);
        
        yPosition += 15;
        
        // Approval options with checkboxes (like in the image)
        const approvalOptions = [
          'Approved as presented',
          'Approve with the following revisions'
        ];
        
        approvalOptions.forEach((option, index) => {
          // Checkbox
          doc.rect(margin, yPosition - 2, 4, 4, 'S');
          
          // Option text
          doc.text(option, margin + 10, yPosition);
          yPosition += 8;
        });
        
        // Signature section (like in the image)
        yPosition += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('Principal Name:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        doc.text('Signature:', margin, yPosition);
        yPosition += 8;
        doc.text('Date:', margin, yPosition);
        yPosition += 8;
        doc.text('Attachments (if any):', margin, yPosition);
        
        // Save the PDF with cache-busting
        const timestamp = Date.now();
        doc.save(`budget-${timestamp}.pdf`);
        
      } else {
        // For real data, use the backend API
        const response = await api.get(`/budget-approvals/${id}/download`, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `budget-approval-${budget.schoolName}-${budget.academicYear}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
      
      message.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      message.error('Failed to download PDF');
    }
  };

  // Open create modal
  const showCreateModal = () => {
    setEditingBudget(null);
    setModalVisible(true);
    form.resetFields();
  };

  // Open edit modal
  const showEditModal = (budget) => {
    setEditingBudget(budget);
    setModalVisible(true);
    setUploadedFiles([]); // Reset uploaded files for editing
    form.setFieldsValue({
      ...budget,
      dateOfSubmission: budget.dateOfSubmission ? dayjs(budget.dateOfSubmission) : null
    });
  };

  // Open view modal
  const showViewModal = (budget) => {
    setViewingBudget(budget);
  };

  // Open approval modal
  const showApprovalModal = (budget) => {
    setApprovingBudget(budget);
    setApprovalModalVisible(true);
    approvalForm.resetFields();
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'default',
      'Submitted': 'processing',
      'Under Review': 'warning',
      'Approved': 'success',
      'Rejected': 'error',
      'Archived': 'default'
    };
    return colors[status] || 'default';
  };

  // Get approval status color
  const getApprovalStatusColor = (status) => {
    const colors = {
      'Pending': 'orange',
      'Approved as Presented': 'green',
      'Approved with Revisions': 'blue',
      'Rejected': 'red'
    };
    return colors[status] || 'default';
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '-';
    const num = parseInt(amount);
    const formatted = num.toLocaleString('en-US');
    return `₹${formatted}`;
  };

  // Columns for the table
  const columns = [
    {
      title: 'School Name',
      dataIndex: 'schoolName',
      key: 'schoolName',
      render: (name) => <strong>{name}</strong>
    },
    {
      title: 'Academic Year',
      dataIndex: 'academicYear',
      key: 'academicYear',
      filters: budgetApprovals && budgetApprovals.length > 0 
        ? budgetApprovals.map(b => ({ text: b.academicYear, value: b.academicYear })).filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)
        : [],
      render: (year) => <Tag color="blue">{year}</Tag>
    },
    {
      title: 'Budget Type',
      dataIndex: 'budgetType',
      key: 'budgetType',
      filters: [
        { text: 'Annual', value: 'Annual' },
        { text: 'Quarterly', value: 'Quarterly' },
        { text: 'Monthly', value: 'Monthly' },
        { text: 'Special Project', value: 'Special Project' }
      ],
      render: (type) => <Tag color="purple">{type}</Tag>
    },
    {
      title: 'Proposed Amount',
      dataIndex: 'totalProposedAmount',
      key: 'totalProposedAmount',
      render: (amount) => <Text strong style={{ color: '#1890ff' }}>{formatCurrency(amount)}</Text>,
      sorter: true
    },
    {
      title: 'Approved Amount',
      dataIndex: 'totalApprovedAmount',
      key: 'totalApprovedAmount',
      render: (amount) => amount ? <Text strong style={{ color: '#52c41a' }}>{formatCurrency(amount)}</Text> : '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Draft', value: 'Draft' },
        { text: 'Submitted', value: 'Submitted' },
        { text: 'Under Review', value: 'Under Review' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' }
      ],
      render: (status) => <Badge status={getStatusColor(status)} text={status} />
    },
    {
      title: 'Approval Status',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Approved as Presented', value: 'Approved as Presented' },
        { text: 'Approved with Revisions', value: 'Approved with Revisions' },
        { text: 'Rejected', value: 'Rejected' }
      ],
      render: (status) => <Tag color={getApprovalStatusColor(status)}>{status}</Tag>
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
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadPDF(record._id)}
          >
            Download PDF
          </Button>
          {['Admin', 'Accountant'].includes(user?.role) && record.status === 'Draft' && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            >
              Edit
            </Button>
          )}
          {['Admin', 'Accountant'].includes(user?.role) && record.status === 'Draft' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleSubmitForReview(record._id)}
            >
              Submit
            </Button>
          )}
          {user?.role === 'Principal' && record.approvalStatus === 'Pending' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => showApprovalModal(record)}
            >
              Review
            </Button>
          )}
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          <DollarOutlined style={{ marginRight: '8px' }} />
          School Budget Approval Management
        </Title>
        <Space>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (budgetApprovals.length > 0) {
                handleDownloadPDF(budgetApprovals[0]._id);
              } else {
                message.info('No budget approvals available for download');
              }
            }}
          >
            Generate PDF
          </Button>
          <Button
            type="default"
            icon={<FileTextOutlined />}
            onClick={() => {
              setBudgetApprovals(sampleBudgetData);
              setStats({
                overall: {
                  totalBudgets: sampleBudgetData.length,
                  pendingBudgets: sampleBudgetData.filter(b => b.status === 'Submitted').length,
                  approvedBudgets: sampleBudgetData.filter(b => b.status === 'Approved').length,
                  rejectedBudgets: sampleBudgetData.filter(b => b.status === 'Rejected').length,
                  totalProposedAmount: sampleBudgetData.reduce((sum, b) => sum + b.totalProposedAmount, 0),
                  totalApprovedAmount: sampleBudgetData.reduce((sum, b) => sum + b.totalApprovedAmount, 0)
                }
              });
              message.success('Sample data loaded!');
            }}
          >
            Load Sample Data
          </Button>
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Clear all data?',
                content: 'This will remove all budget approvals from the table.',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => {
                  setBudgetApprovals([]);
                  setStats({
                    overall: {
                      totalBudgets: 0,
                      pendingBudgets: 0,
                      approvedBudgets: 0,
                      rejectedBudgets: 0,
                      totalProposedAmount: 0,
                      totalApprovedAmount: 0
                    }
                  });
                  message.success('All data cleared!');
                }
              });
            }}
          >
            Clear All
          </Button>
          <Button
            type="default"
            onClick={() => {
              if (budgetApprovals.length > 0) {
                handleDownloadPDF(budgetApprovals[0]._id);
                message.info('Generating PDF with clean number formatting...');
              } else {
                message.info('No budgets to generate PDF for');
              }
            }}
          >
            Test PDF
          </Button>

          {['Admin', 'AdminStaff', 'Accountant'].includes(user?.role) && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showCreateModal}
            >
              Create Budget Approval
            </Button>
          )}
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Budgets"
              value={stats.overall?.totalBudgets || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={stats.overall?.pendingBudgets || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Approved Budgets"
              value={stats.overall?.approvedBudgets || 0}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Proposed Amount"
              value={formatCurrency(stats.overall?.totalProposedAmount || 0)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Budget Approvals Table */}
      <Card title="Budget Approvals" style={{ marginBottom: '24px' }}>
        <Table
          columns={columns}
          dataSource={budgetApprovals}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>





      {/* Create/Edit Modal */}
      <Modal
        title={editingBudget ? 'Edit Budget Approval' : 'Create Budget Approval'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingBudget(null);
          form.resetFields();
        }}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="schoolName"
                label="School Name"
                rules={[{ required: true, message: 'Please enter school name' }]}
              >
                <Input placeholder="Enter school name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="academicYear"
                label="Academic Year"
                rules={[{ required: true, message: 'Please enter academic year' }]}
              >
                <Input placeholder="e.g., 2024-2025" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="preparedBy"
                label="Prepared By"
                rules={[{ required: true, message: 'Please enter preparer name' }]}
              >
                <Input placeholder="Enter preparer name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department/Committee"
                rules={[{ required: true, message: 'Please enter department' }]}
              >
                <Input placeholder="Enter department or committee" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfSubmission"
                label="Date of Submission"
                rules={[{ required: true, message: 'Please select submission date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="budgetType"
                label="Budget Type"
                rules={[{ required: true, message: 'Please select budget type' }]}
              >
                <Select placeholder="Select budget type">
                  <Option value="Annual">Annual</Option>
                  <Option value="Quarterly">Quarterly</Option>
                  <Option value="Monthly">Monthly</Option>
                  <Option value="Special Project">Special Project</Option>
                </Select>
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
                name="notes"
                label="Additional Notes"
              >
                <TextArea placeholder="Any additional notes or comments" rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Budget Items</Divider>
          
          <Form.List name="budgetItems">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key} style={{ marginBottom: '16px' }}>
                    <Col span={2}>
                      <Form.Item
                        {...restField}
                        name={[name, 'serialNumber']}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <InputNumber min={1} placeholder="S.No" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'budgetCategory']}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Select placeholder="Category">
                          {budgetCategories.map(category => (
                            <Option key={category} value={category}>{category}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Input placeholder="Description" />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        {...restField}
                        name={[name, 'proposedAmount']}
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <InputNumber
                          min={0}
                          placeholder="Amount"
                          style={{ width: '100%' }}
                          formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/₹\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        {...restField}
                        name={[name, 'remarks']}
                      >
                        <Input placeholder="Remarks" />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button type="link" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Budget Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            name="notes"
            label="Additional Notes"
          >
            <TextArea rows={3} placeholder="Any additional notes or comments" />
          </Form.Item>

          <Form.Item
            label="Supporting Documents"
          >
            <Upload
              multiple
              beforeUpload={(file) => {
                setUploadedFiles(prev => [...prev, file]);
                return false; // Prevent default upload
              }}
              onRemove={(file) => {
                setUploadedFiles(prev => prev.filter(f => f.uid !== file.uid));
              }}
              fileList={uploadedFiles.map((file, index) => ({
                uid: index,
                name: file.name,
                status: 'done'
              }))}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />}>Upload Supporting Documents</Button>
            </Upload>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBudget ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingBudget(null);
                setUploadedFiles([]);
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
        title="Budget Approval Details"
        open={!!viewingBudget}
        onCancel={() => setViewingBudget(null)}
        footer={
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => {
                if (viewingBudget) {
                  handleDownloadPDF(viewingBudget._id);
                }
              }}
            >
              Download PDF
            </Button>
            <Button onClick={() => setViewingBudget(null)}>
              Close
            </Button>
          </Space>
        }
        width={1000}
      >
        {viewingBudget && (
          <div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>School Name:</strong> {viewingBudget.schoolName}
              </Col>
              <Col span={12}>
                <strong>Academic Year:</strong> <Tag color="blue">{viewingBudget.academicYear}</Tag>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Prepared By:</strong> {viewingBudget.preparedBy}
              </Col>
              <Col span={12}>
                <strong>Department:</strong> {viewingBudget.department}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Date of Submission:</strong> {dayjs(viewingBudget.dateOfSubmission).format('DD/MM/YYYY')}
              </Col>
              <Col span={12}>
                <strong>Budget Type:</strong> <Tag color="purple">{viewingBudget.budgetType}</Tag>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Status:</strong> <Badge status={getStatusColor(viewingBudget.status)} text={viewingBudget.status} />
              </Col>
              <Col span={12}>
                <strong>Approval Status:</strong> <Tag color={getApprovalStatusColor(viewingBudget.approvalStatus)}>{viewingBudget.approvalStatus}</Tag>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <strong>Total Proposed Amount:</strong> <Text strong style={{ color: '#1890ff' }}>{formatCurrency(viewingBudget.totalProposedAmount)}</Text>
              </Col>
              <Col span={12}>
                <strong>Total Approved Amount:</strong> {viewingBudget.totalApprovedAmount ? <Text strong style={{ color: '#52c41a' }}>{formatCurrency(viewingBudget.totalApprovedAmount)}</Text> : '-'}
              </Col>
            </Row>

            <Divider orientation="left">Budget Items</Divider>
            
            <Table
              dataSource={viewingBudget.budgetItems}
              columns={[
                { title: 'S.No', dataIndex: 'serialNumber', key: 'serialNumber' },
                { title: 'Budget Category', dataIndex: 'budgetCategory', key: 'budgetCategory' },
                { title: 'Description', dataIndex: 'description', key: 'description' },
                { 
                  title: 'Proposed Amount', 
                  dataIndex: 'proposedAmount', 
                  key: 'proposedAmount',
                  render: (amount) => formatCurrency(amount)
                },
                { 
                  title: 'Approved Amount', 
                  dataIndex: 'approvedAmount', 
                  key: 'approvedAmount',
                  render: (amount) => amount ? formatCurrency(amount) : '-'
                },
                { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' }
              ]}
              pagination={false}
              size="small"
            />

            {viewingBudget.notes && (
              <div style={{ marginTop: '16px' }}>
                <strong>Notes:</strong>
                <p>{viewingBudget.notes}</p>
              </div>
            )}

            {viewingBudget.approvalRemarks && (
              <div style={{ marginTop: '16px' }}>
                <strong>Approval Remarks:</strong>
                <p>{viewingBudget.approvalRemarks}</p>
              </div>
            )}

            <Row gutter={16} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <strong>Created By:</strong> {viewingBudget.createdBy?.name || 'Unknown'}
              </Col>
              {viewingBudget.approvedBy && (
                <Col span={12}>
                  <strong>Approved By:</strong> {viewingBudget.approvedBy.name}
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        title="Review Budget Approval"
        open={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false);
          setApprovingBudget(null);
          approvalForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        {approvingBudget && (
          <Form
            form={approvalForm}
            layout="vertical"
            onFinish={handleApprovalSubmit}
          >
            <Form.Item
              name="approvalType"
              label="Approval Decision"
              rules={[{ required: true, message: 'Please select approval type' }]}
            >
              <Select placeholder="Select approval type">
                <Option value="Approved as presented">Approved as presented</Option>
                <Option value="Approve with the following revisions">Approve with the following revisions</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="approvalRemarks"
              label="Approval Remarks"
              rules={[{ required: true, message: 'Please enter approval remarks' }]}
            >
              <TextArea rows={4} placeholder="Enter approval remarks or revision details" />
            </Form.Item>

            <Divider orientation="left">Budget Items Review</Divider>
            
            <Form.List name="approvedAmounts">
              {(fields) => (
                <>
                  {approvingBudget.budgetItems.map((item, index) => (
                    <Row gutter={16} key={index} style={{ marginBottom: '16px' }}>
                      <Col span={4}>
                        <Text strong>{item.serialNumber}. {item.budgetCategory}</Text>
                      </Col>
                      <Col span={6}>
                        <Text>{item.description}</Text>
                      </Col>
                      <Col span={4}>
                        <Text>Proposed: {formatCurrency(item.proposedAmount)}</Text>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          name={['approvedAmounts', index, 'approvedAmount']}
                          label="Approved Amount"
                        >
                          <InputNumber
                            min={0}
                            placeholder="Amount"
                            style={{ width: '100%' }}
                            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/₹\s?|(,*)/g, '')}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          name={['approvedAmounts', index, 'remarks']}
                          label="Remarks"
                        >
                          <Input placeholder="Remarks" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </Form.List>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
                  Approve
                </Button>
                <Button 
                  danger 
                  onClick={() => {
                    const rejectionReason = approvalForm.getFieldValue('approvalRemarks');
                    if (!rejectionReason) {
                      message.error('Please enter rejection reason');
                      return;
                    }
                    handleReject({ rejectionReason });
                  }}
                  icon={<CloseOutlined />}
                >
                  Reject
                </Button>
                <Button onClick={() => {
                  setApprovalModalVisible(false);
                  setApprovingBudget(null);
                  approvalForm.resetFields();
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default BudgetApproval; 