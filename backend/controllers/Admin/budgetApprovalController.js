const BudgetApproval = require('../../models/Admin/BudgetApproval');
const Staff = require('../../models/Staff/staffModel');
const PDFGenerator = require('../../services/pdfGenerator');

// Get all budget approvals with pagination and filtering
exports.getAllBudgetApprovals = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, academicYear, budgetType, approvalStatus } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;
    if (budgetType) filter.budgetType = budgetType;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    const budgetApprovals = await BudgetApproval.find(filter)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('lastModifiedBy', 'name email role')
      .sort({ dateOfSubmission: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BudgetApproval.countDocuments(filter);

    res.json({
      budgetApprovals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching budget approvals:', error);
    res.status(500).json({ message: 'Error fetching budget approvals' });
  }
};

// Get single budget approval by ID
exports.getBudgetApprovalById = async (req, res) => {
  try {
    const budgetApproval = await BudgetApproval.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('lastModifiedBy', 'name email role');

    if (!budgetApproval) {
      return res.status(404).json({ message: 'Budget approval not found' });
    }

    res.json(budgetApproval);
  } catch (error) {
    console.error('Error fetching budget approval:', error);
    res.status(500).json({ message: 'Error fetching budget approval' });
  }
};

// Create new budget approval (Admin and Accountant only)
exports.createBudgetApproval = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is Admin, AdminStaff, or Accountant
    if (!['Admin', 'AdminStaff', 'Accountant'].includes(role)) {
      return res.status(403).json({ message: 'Only Admin, AdminStaff, and Accountant staff can create budget approvals' });
    }

    const budgetData = {
      ...req.body,
      createdBy: req.user.id,
      dateOfSubmission: req.body.dateOfSubmission || new Date()
    };

    // Calculate total proposed amount
    if (budgetData.budgetItems && budgetData.budgetItems.length > 0) {
      budgetData.totalProposedAmount = budgetData.budgetItems.reduce((sum, item) => sum + (item.proposedAmount || 0), 0);
    }

    const budgetApproval = new BudgetApproval(budgetData);
    await budgetApproval.save();

    const populatedBudgetApproval = await BudgetApproval.findById(budgetApproval._id)
      .populate('createdBy', 'name email role');

    res.status(201).json({
      message: 'Budget approval created successfully',
      budgetApproval: populatedBudgetApproval
    });
  } catch (error) {
    console.error('Error creating budget approval:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating budget approval' });
  }
};

// Update budget approval (Admin and Accountant only)
exports.updateBudgetApproval = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is Admin, AdminStaff, or Accountant
    if (!['Admin', 'AdminStaff', 'Accountant'].includes(role)) {
      return res.status(403).json({ message: 'Only Admin, AdminStaff, and Accountant staff can edit budget approvals' });
    }

    const budgetApproval = await BudgetApproval.findById(req.params.id);
    if (!budgetApproval) {
      return res.status(404).json({ message: 'Budget approval not found' });
    }

    // Only allow editing if not yet approved
    if (budgetApproval.approvalStatus !== 'Pending') {
      return res.status(400).json({ message: 'Cannot edit budget approval that has already been processed' });
    }

    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id,
      lastModifiedAt: new Date()
    };

    // Recalculate totals if budget items changed
    if (updateData.budgetItems && updateData.budgetItems.length > 0) {
      updateData.totalProposedAmount = updateData.budgetItems.reduce((sum, item) => sum + (item.proposedAmount || 0), 0);
    }

    const updatedBudgetApproval = await BudgetApproval.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role');

    res.json({
      message: 'Budget approval updated successfully',
      budgetApproval: updatedBudgetApproval
    });
  } catch (error) {
    console.error('Error updating budget approval:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error updating budget approval' });
  }
};

// Approve/Reject budget approval (Principal only)
exports.approveBudgetApproval = async (req, res) => {
  try {
    const { role } = req.user;
    const { approvalType, approvalRemarks, approvedAmounts } = req.body;
    
    // Check if user is Principal
    if (role !== 'Principal') {
      return res.status(403).json({ message: 'Only Principal can approve budget approvals' });
    }

    const budgetApproval = await BudgetApproval.findById(req.params.id);
    if (!budgetApproval) {
      return res.status(404).json({ message: 'Budget approval not found' });
    }

    if (budgetApproval.approvalStatus !== 'Pending') {
      return res.status(400).json({ message: 'Budget approval has already been processed' });
    }

    // Update approval information
    const updateData = {
      approvalStatus: approvalType === 'Approved as presented' ? 'Approved as Presented' : 'Approved with Revisions',
      approvalType,
      principalName: req.user.name,
      approvalDate: new Date(),
      approvalRemarks,
      approvedBy: req.user.id,
      lastModifiedBy: req.user.id,
      lastModifiedAt: new Date(),
      status: approvalType === 'Approved as presented' ? 'Approved' : 'Under Review'
    };

    // Update individual budget item approved amounts if provided
    if (approvedAmounts && Array.isArray(approvedAmounts)) {
      budgetApproval.budgetItems = budgetApproval.budgetItems.map((item, index) => {
        if (approvedAmounts[index] && approvedAmounts[index].approvedAmount !== undefined) {
          item.approvedAmount = approvedAmounts[index].approvedAmount;
          item.remarks = approvedAmounts[index].remarks || item.remarks;
        }
        return item;
      });

      // Calculate total approved amount
      const approvedItems = budgetApproval.budgetItems.filter(item => item.approvedAmount !== undefined && item.approvedAmount !== null);
      if (approvedItems.length > 0) {
        updateData.totalApprovedAmount = approvedItems.reduce((sum, item) => sum + (item.approvedAmount || 0), 0);
      }
    }

    const updatedBudgetApproval = await BudgetApproval.findByIdAndUpdate(
      req.params.id,
      { ...updateData, budgetItems: budgetApproval.budgetItems },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('approvedBy', 'name email role')
     .populate('lastModifiedBy', 'name email role');

    res.json({
      message: 'Budget approval processed successfully',
      budgetApproval: updatedBudgetApproval
    });
  } catch (error) {
    console.error('Error approving budget approval:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error processing budget approval' });
  }
};

// Reject budget approval (Principal only)
exports.rejectBudgetApproval = async (req, res) => {
  try {
    const { role } = req.user;
    const { rejectionReason } = req.body;
    
    // Check if user is Principal
    if (role !== 'Principal') {
      return res.status(403).json({ message: 'Only Principal can reject budget approvals' });
    }

    const budgetApproval = await BudgetApproval.findById(req.params.id);
    if (!budgetApproval) {
      return res.status(404).json({ message: 'Budget approval not found' });
    }

    if (budgetApproval.approvalStatus !== 'Pending') {
      return res.status(400).json({ message: 'Budget approval has already been processed' });
    }

    const updateData = {
      approvalStatus: 'Rejected',
      approvalRemarks: rejectionReason,
      principalName: req.user.name,
      approvalDate: new Date(),
      approvedBy: req.user.id,
      lastModifiedBy: req.user.id,
      lastModifiedAt: new Date(),
      status: 'Rejected'
    };

    const updatedBudgetApproval = await BudgetApproval.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('approvedBy', 'name email role')
     .populate('lastModifiedBy', 'name email role');

    res.json({
      message: 'Budget approval rejected successfully',
      budgetApproval: updatedBudgetApproval
    });
  } catch (error) {
    console.error('Error rejecting budget approval:', error);
    res.status(500).json({ message: 'Error rejecting budget approval' });
  }
};

// Delete budget approval (Admin only)
exports.deleteBudgetApproval = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is Admin
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admin staff can delete budget approvals' });
    }

    const budgetApproval = await BudgetApproval.findById(req.params.id);
    if (!budgetApproval) {
      return res.status(404).json({ message: 'Budget approval not found' });
    }

    await BudgetApproval.findByIdAndDelete(req.params.id);

    res.json({ message: 'Budget approval deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget approval:', error);
    res.status(500).json({ message: 'Error deleting budget approval' });
  }
};

// Get budget approval statistics
exports.getBudgetApprovalStats = async (req, res) => {
  try {
    const stats = await BudgetApproval.aggregate([
      {
        $group: {
          _id: null,
          totalBudgets: { $sum: 1 },
          pendingBudgets: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'Pending'] }, 1, 0] }
          },
          approvedBudgets: {
            $sum: { $cond: [{ $in: ['$approvalStatus', ['Approved as Presented', 'Approved with Revisions']] }, 1, 0] }
          },
          rejectedBudgets: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'Rejected'] }, 1, 0] }
          },
          totalProposedAmount: { $sum: '$totalProposedAmount' },
          totalApprovedAmount: { $sum: '$totalApprovedAmount' }
        }
      }
    ]);

    const budgetTypeStats = await BudgetApproval.aggregate([
      {
        $group: {
          _id: '$budgetType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalProposedAmount' }
        }
      }
    ]);

    const academicYearStats = await BudgetApproval.aggregate([
      {
        $group: {
          _id: '$academicYear',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalProposedAmount' }
        }
      }
    ]);

    res.json({
      overall: stats[0] || { 
        totalBudgets: 0, 
        pendingBudgets: 0, 
        approvedBudgets: 0, 
        rejectedBudgets: 0,
        totalProposedAmount: 0,
        totalApprovedAmount: 0
      },
      byBudgetType: budgetTypeStats,
      byAcademicYear: academicYearStats
    });
  } catch (error) {
    console.error('Error fetching budget approval stats:', error);
    res.status(500).json({ message: 'Error fetching budget approval statistics' });
  }
};

// Submit budget approval for review
exports.submitBudgetApproval = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is Admin or Accountant
    if (!['Admin', 'Accountant'].includes(role)) {
      return res.status(403).json({ message: 'Only Admin and Accountant staff can submit budget approvals' });
    }

    const budgetApproval = await BudgetApproval.findById(req.params.id);
    if (!budgetApproval) {
      return res.status(404).json({ message: 'Budget approval not found' });
    }

    if (budgetApproval.status !== 'Draft') {
      return res.status(400).json({ message: 'Only draft budget approvals can be submitted' });
    }

    const updateData = {
      status: 'Submitted',
      lastModifiedBy: req.user.id,
      lastModifiedAt: new Date()
    };

    const updatedBudgetApproval = await BudgetApproval.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role')
     .populate('lastModifiedBy', 'name email role');

    res.json({
      message: 'Budget approval submitted successfully',
      budgetApproval: updatedBudgetApproval
    });
  } catch (error) {
    console.error('Error submitting budget approval:', error);
    res.status(500).json({ message: 'Error submitting budget approval' });
  }
};

// Download budget approval PDF
exports.downloadBudgetApprovalPDF = async (req, res) => {
  try {
    const budgetApproval = await BudgetApproval.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('lastModifiedBy', 'name email role');

    if (!budgetApproval) {
      return res.status(404).json({ message: 'Budget approval not found' });
    }

    // Generate PDF
    const pdfBuffer = await PDFGenerator.generateBudgetApprovalPDF(budgetApproval);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="budget-approval-${budgetApproval._id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading budget approval PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
}; 