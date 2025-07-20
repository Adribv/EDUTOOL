const FeePayment = require('../../../models/Finance/feePaymentModel');
const Expense = require('../../../models/Finance/expenseModel');
const StaffSalaryRecord = require('../../../models/Finance/staffSalaryRecordModel');
const Staff = require('../../../models/Staff/staffModel');
const SalaryTemplate = require('../../../models/Finance/salaryTemplateModel');
const ApprovalRequest = require('../../../models/Staff/HOD/approvalRequest.model');
const mongoose = require('mongoose');

// GET /api/accountant/summary
exports.getSummary = async (req, res) => {
  try {
    // Total income (approved / completed fee payments)
    const incomeAgg = await FeePayment.aggregate([
      { $match: { status: { $in: ['Completed'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
    const totalIncome = incomeAgg[0]?.total || 0;

    // Total dues (pending / failed etc.)
    const duesAgg = await FeePayment.aggregate([
      { $match: { status: { $in: ['Pending'] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$amountPaid'] } } } },
    ]);
    const totalDues = duesAgg[0]?.total || 0;

    // Total expenses (approved only)
    const expenseAgg = await Expense.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalExpenses = expenseAgg[0]?.total || 0;

    // Staff salary statistics
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    const salaryStats = await StaffSalaryRecord.aggregate([
      { $match: { year: currentYear } },
      { $group: { 
        _id: null, 
        totalSalaryPaid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$netSalary', 0] } },
        totalSalaryPending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, '$netSalary', 0] } },
        totalRecords: { $sum: 1 },
        avgSalary: { $avg: '$netSalary' }
      } }
    ]);

    const profitLoss = totalIncome - totalExpenses - (salaryStats[0]?.totalSalaryPaid || 0);

    res.json({
      income: totalIncome,
      expenses: totalExpenses,
      dues: totalDues,
      profitLoss,
      salaryStats: salaryStats[0] || {
        totalSalaryPaid: 0,
        totalSalaryPending: 0,
        totalRecords: 0,
        avgSalary: 0
      },
      currentYear,
      currentMonth
    });
  } catch (err) {
    console.error('Error fetching accountant summary:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/accountant/expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/accountant/expenses
exports.createExpense = async (req, res) => {
  try {
    const { title, description, category, amount, date } = req.body;
    const expense = await Expense.create({
      title,
      description,
      category,
      amount,
      date,
      createdBy: req.user.id,
      status: 'Pending',
    });

    // Create approval request for Principal
    await ApprovalRequest.create({
      requesterId: req.user.id,
      requesterName: req.user.name || 'Accountant',
      requestType: 'Budget',
      title: `Expense Approval: ${title}`,
      description: description || `Approve expense of ₹${amount}`,
      requestData: { expenseId: expense._id },
      status: 'Pending',
      currentApprover: 'Principal',
      approvalHistory: [],
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/accountant/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, amount, date } = req.body;

    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending expenses can be updated' });
    }
    // Update allowed fields
    if (title) expense.title = title;
    if (description) expense.description = description;
    if (category) expense.category = category;
    if (amount) expense.amount = amount;
    if (date) expense.date = date;

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Utility to generate random integer in range
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// POST /api/accountant/sample-data
exports.generateSampleData = async (req, res) => {
  try {
    // Generate sample expense data
    const sampleExpenses = [
      { category: 'Utilities', amount: 15000, date: new Date(), status: 'Approved' },
      { category: 'Maintenance', amount: 8000, date: new Date(), status: 'Approved' },
      { category: 'Supplies', amount: 5000, date: new Date(), status: 'Approved' }
    ];
    
    await Expense.insertMany(sampleExpenses);
    
    res.json({ message: 'Sample data generated successfully' });
  } catch (err) {
    console.error('Error generating sample data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/accountant/incomes
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await FeePayment.find({ status: 'Completed' }).sort({ paymentDate: -1 });
    res.json(incomes);
  } catch (err) {
    console.error('Error fetching incomes:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 

// ENHANCED SALARY TEMPLATE MANAGEMENT

// GET /api/accountant/salary-templates
exports.getSalaryTemplates = async (req, res) => {
  try {
    const templates = await SalaryTemplate.find({ isActive: true })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ role: 1 });

    // Get all available roles from staff model
    const availableRoles = [
      'Teacher', 'HOD', 'VicePrincipal', 'Principal', 
      'AdminStaff', 'ITAdmin', 'Counsellor', 'Accountant', 'ClassCoord'
    ];

    // Create role display names mapping
    const roleDisplayNames = {
      'Teacher': 'Teacher',
      'HOD': 'Head of Department',
      'VicePrincipal': 'Vice Principal',
      'Principal': 'Principal',
      'AdminStaff': 'Admin Staff',
      'ITAdmin': 'IT Administrator',
      'Counsellor': 'Counsellor',
      'Accountant': 'Accountant',
      'ClassCoord': 'Class Coordinator'
    };

    // Create templates for roles that don't have one
    const missingRoles = availableRoles.filter(role => 
      !templates.find(template => template.role === role)
    );

    const defaultTemplates = missingRoles.map(role => ({
      role,
      roleDisplayName: roleDisplayNames[role],
      basicSalary: 30000,
      allowances: {
        houseRentAllowance: 5000,
        dearnessAllowance: 3000,
        transportAllowance: 2000,
        medicalAllowance: 1500,
        otherAllowances: 500
      },
      deductions: {
        providentFund: 3000,
        tax: 1500,
        insurance: 300,
        otherDeductions: 0
      },
      description: `Default salary template for ${roleDisplayNames[role]}`,
      isActive: true,
      createdBy: req.user.id,
      version: 1
    }));

    if (defaultTemplates.length > 0) {
      await SalaryTemplate.insertMany(defaultTemplates);
      // Fetch updated templates
      const updatedTemplates = await SalaryTemplate.find({ isActive: true })
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .sort({ role: 1 });
      
      return res.json(updatedTemplates);
    }

    res.json(templates);
  } catch (error) {
    console.error('Error fetching salary templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/accountant/salary-templates/:id
exports.getSalaryTemplateById = async (req, res) => {
  try {
    const template = await SalaryTemplate.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!template) {
      return res.status(404).json({ message: 'Salary template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching salary template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/accountant/salary-templates
exports.createSalaryTemplate = async (req, res) => {
  try {
    const {
      role,
      roleDisplayName,
      basicSalary,
      allowances,
      deductions,
      taxSettings,
      pfSettings,
      benefits,
      description,
      effectiveFrom,
      effectiveTo
    } = req.body;

    // Check if template already exists for this role
    const existingTemplate = await SalaryTemplate.findOne({ role, isActive: true });
    if (existingTemplate) {
      return res.status(400).json({ message: 'Salary template already exists for this role' });
    }

    const template = new SalaryTemplate({
      role,
      roleDisplayName,
      basicSalary,
      allowances,
      deductions,
      taxSettings,
      pfSettings,
      benefits,
      description,
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined,
      createdBy: req.user.id
    });

    await template.save();

    // Get all staff members with this role
    const staffWithRole = await Staff.find({ role, status: 'active' });
    
    const populatedTemplate = await SalaryTemplate.findById(template._id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    res.status(201).json({
      message: 'Salary template created successfully',
      template: populatedTemplate,
      affectedStaff: staffWithRole.length,
      staffList: staffWithRole.map(staff => ({
        id: staff._id,
        name: staff.name,
        employeeId: staff.employeeId,
        email: staff.email
      }))
    });
  } catch (error) {
    console.error('Error creating salary template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/accountant/salary-templates/:id
exports.updateSalaryTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const template = await SalaryTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Salary template not found' });
    }

    // Store current values for change history
    const currentValues = {
      basicSalary: template.basicSalary,
      allowances: { ...template.allowances },
      deductions: { ...template.deductions }
    };

    // Update template
    Object.assign(template, updateData);
    template.updatedBy = req.user.id;
    template.version += 1;

    // Add to change history
    const changes = {
      version: template.version,
      changedBy: req.user.id,
      changedAt: new Date(),
      changes: {
        basicSalary: { from: currentValues.basicSalary, to: updateData.basicSalary },
        allowances: {},
        deductions: {}
      },
      reason: updateData.changeReason || 'Template updated'
    };

    // Track allowance changes
    Object.keys(currentValues.allowances).forEach(key => {
      if (currentValues.allowances[key] !== updateData.allowances[key]) {
        changes.changes.allowances[key] = {
          from: currentValues.allowances[key],
          to: updateData.allowances[key]
        };
      }
    });

    // Track deduction changes
    Object.keys(currentValues.deductions).forEach(key => {
      if (currentValues.deductions[key] !== updateData.deductions[key]) {
        changes.changes.deductions[key] = {
          from: currentValues.deductions[key],
          to: updateData.deductions[key]
        };
      }
    });

    template.changeHistory.push(changes);
    await template.save();

    const updatedTemplate = await SalaryTemplate.findById(id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    res.json({
      message: 'Salary template updated successfully',
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Error updating salary template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/accountant/salary-templates/:id
exports.deleteSalaryTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await SalaryTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Salary template not found' });
    }

    // Soft delete by setting isActive to false
    template.isActive = false;
    template.updatedBy = req.user.id;
    await template.save();

    res.json({ message: 'Salary template deleted successfully' });
  } catch (error) {
    console.error('Error deleting salary template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/accountant/salary-template-stats
exports.getSalaryTemplateStats = async (req, res) => {
  try {
    const templates = await SalaryTemplate.find({ isActive: true });

    // Calculate statistics
    const stats = {
      totalTemplates: templates.length,
      totalBasicSalary: templates.reduce((sum, t) => sum + t.basicSalary, 0),
      totalAllowances: templates.reduce((sum, t) => sum + t.totalAllowances, 0),
      totalDeductions: templates.reduce((sum, t) => sum + t.totalDeductions, 0),
      totalGrossSalary: templates.reduce((sum, t) => sum + t.grossSalary, 0),
      totalNetSalary: templates.reduce((sum, t) => sum + t.netSalary, 0),
      averageBasicSalary: templates.length > 0 ? templates.reduce((sum, t) => sum + t.basicSalary, 0) / templates.length : 0,
      averageNetSalary: templates.length > 0 ? templates.reduce((sum, t) => sum + t.netSalary, 0) / templates.length : 0,
      roleDistribution: templates.map(t => ({
        role: t.role,
        roleDisplayName: t.roleDisplayName,
        basicSalary: t.basicSalary,
        netSalary: t.netSalary,
        totalAllowances: t.totalAllowances,
        totalDeductions: t.totalDeductions
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching salary template stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/accountant/available-roles
exports.getAvailableRoles = async (req, res) => {
  try {
    const availableRoles = [
      { value: 'Teacher', label: 'Teacher' },
      { value: 'HOD', label: 'Head of Department' },
      { value: 'VicePrincipal', label: 'Vice Principal' },
      { value: 'Principal', label: 'Principal' },
      { value: 'AdminStaff', label: 'Admin Staff' },
      { value: 'ITAdmin', label: 'IT Administrator' },
      { value: 'Counsellor', label: 'Counsellor' },
      { value: 'Accountant', label: 'Accountant' },
      { value: 'ClassCoord', label: 'Class Coordinator' }
    ];

    res.json(availableRoles);
  } catch (error) {
    console.error('Error fetching available roles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// STAFF SALARY MANAGEMENT

// GET /api/accountant/staff-list
exports.getStaffList = async (req, res) => {
  try {
    const { role, department, status } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (status) query.status = status;

    const staff = await Staff.find(query)
      .populate('department', 'name')
      .select('-password')
      .sort({ name: 1 });

    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/accountant/staff-salary-history/:staffId
exports.getStaffSalaryHistory = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, month } = req.query;

    let query = { staffId };
    if (year) query.year = parseInt(year);
    if (month) query.month = month;

    const salaryHistory = await StaffSalaryRecord.find(query)
      .sort({ year: -1, month: -1 })
      .populate('staffId', 'name employeeId role designation');

    res.json(salaryHistory);
  } catch (error) {
    console.error('Error fetching staff salary history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/accountant/create-salary-record
exports.createSalaryRecord = async (req, res) => {
  try {
    const {
      staffId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      paymentDate,
      paymentMethod,
      remarks,
      attendance,
      performance
    } = req.body;

    // Validate staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Calculate gross and net salary
    const totalAllowances = Object.values(allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
    const totalDeductions = Object.values(deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
    const grossSalary = basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    // Check if salary record already exists for this month/year
    const existingRecord = await StaffSalaryRecord.findOne({
      staffId,
      month,
      year
    });

    if (existingRecord) {
      return res.status(400).json({ message: 'Salary record already exists for this month and year' });
    }

    const salaryRecord = new StaffSalaryRecord({
      staffId,
      staffName: staff.name,
      employeeId: staff.employeeId,
      designation: staff.designation || staff.role,
      department: staff.department?.name || '',
      month,
      year: parseInt(year),
      basicSalary: parseFloat(basicSalary),
      allowances,
      deductions,
      grossSalary,
      netSalary,
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      paymentMethod,
      remarks,
      attendance,
      performance,
      createdBy: req.user.id,
      status: 'Approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    await salaryRecord.save();

    res.status(201).json({
      message: 'Salary record created successfully',
      salaryRecord
    });
  } catch (error) {
    console.error('Error creating salary record:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/accountant/update-salary-record/:id
exports.updateSalaryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Recalculate salary if basic salary, allowances, or deductions changed
    if (updateData.basicSalary || updateData.allowances || updateData.deductions) {
      const record = await StaffSalaryRecord.findById(id);
      if (!record) {
        return res.status(404).json({ message: 'Salary record not found' });
      }

      const basicSalary = updateData.basicSalary || record.basicSalary;
      const allowances = updateData.allowances || record.allowances;
      const deductions = updateData.deductions || record.deductions;

      const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + (val || 0), 0);
      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
      
      updateData.grossSalary = basicSalary + totalAllowances;
      updateData.netSalary = updateData.grossSalary - totalDeductions;
    }

    const updatedRecord = await StaffSalaryRecord.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('staffId', 'name employeeId role designation');

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json({
      message: 'Salary record updated successfully',
      salaryRecord: updatedRecord
    });
  } catch (error) {
    console.error('Error updating salary record:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/accountant/bulk-salary-creation
exports.bulkSalaryCreation = async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Records array is required' });
    }

    const results = {
      successful: [],
      failed: [],
      total: records.length
    };

    for (const recordData of records) {
      try {
        const {
          staffId,
          month,
          year,
          basicSalary,
          allowances,
          deductions,
          paymentDate,
          paymentMethod,
          remarks
        } = recordData;

        // Validate required fields
        if (!staffId || !month || !year || !basicSalary) {
          results.failed.push({
            ...recordData,
            error: 'Missing required fields'
          });
          continue;
        }

        // Check if record already exists
        const existingRecord = await StaffSalaryRecord.findOne({
          staffId,
          month,
          year
        });

        if (existingRecord) {
          results.failed.push({
            ...recordData,
            error: 'Salary record already exists for this month and year'
          });
          continue;
        }

        // Get staff details
        const staff = await Staff.findById(staffId);
        if (!staff) {
          results.failed.push({
            ...recordData,
            error: 'Staff not found'
          });
          continue;
        }

        // Calculate salary
        const totalAllowances = Object.values(allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
        const totalDeductions = Object.values(deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
        const grossSalary = basicSalary + totalAllowances;
        const netSalary = grossSalary - totalDeductions;

        const salaryRecord = new StaffSalaryRecord({
          staffId,
          staffName: staff.name,
          employeeId: staff.employeeId,
          designation: staff.designation || staff.role,
          department: staff.department?.name || '',
          month,
          year: parseInt(year),
          basicSalary: parseFloat(basicSalary),
          allowances,
          deductions,
          grossSalary,
          netSalary,
          paymentDate: paymentDate ? new Date(paymentDate) : undefined,
          paymentMethod,
          remarks,
          createdBy: req.user.id,
          status: 'Approved',
          approvedBy: req.user.id,
          approvedAt: new Date()
        });

        await salaryRecord.save();
        results.successful.push({
          ...recordData,
          salaryRecordId: salaryRecord._id
        });

      } catch (error) {
        results.failed.push({
          ...recordData,
          error: error.message
        });
      }
    }

    res.json({
      message: `Bulk salary creation completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    console.error('Error in bulk salary creation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/accountant/pending-salary-approvals
exports.getPendingSalaryApprovals = async (req, res) => {
  try {
    const pendingApprovals = await ApprovalRequest.find({
      requestType: 'StaffSalaryRecord',
      status: 'Pending'
    })
    .populate('requesterId', 'name email role')
    .sort({ createdAt: -1 });

    res.json({
      pendingApprovals,
      count: pendingApprovals.length
    });
  } catch (error) {
    console.error('Error fetching pending salary approvals:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 

// GET /api/accountant/staff-by-role/:role
exports.getStaffByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    const staff = await Staff.find({ 
      role, 
      status: 'active' 
    })
    .select('name employeeId email phone department designation joiningDate')
    .populate('department', 'name')
    .sort({ name: 1 });

    res.json({
      role,
      staffCount: staff.length,
      staff: staff
    });
  } catch (error) {
    console.error('Error fetching staff by role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/accountant/apply-template-to-staff
exports.applyTemplateToStaff = async (req, res) => {
  try {
    const { templateId, staffIds, month, year, customAdjustments } = req.body;

    const template = await SalaryTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Salary template not found' });
    }

    const staff = await Staff.find({ _id: { $in: staffIds } });
    if (staff.length === 0) {
      return res.status(404).json({ message: 'No staff members found' });
    }

    const results = {
      successful: [],
      failed: [],
      total: staffIds.length
    };

    for (const staffMember of staff) {
      try {
        // Check if salary record already exists for this month/year
        const existingRecord = await StaffSalaryRecord.findOne({
          staffId: staffMember._id,
          month,
          year
        });

        if (existingRecord) {
          results.failed.push({
            staffId: staffMember._id,
            staffName: staffMember.name,
            error: 'Salary record already exists for this month and year'
          });
          continue;
        }

        // Apply template with custom adjustments
        const adjustments = customAdjustments?.[staffMember._id] || {};
        
        const salaryRecord = new StaffSalaryRecord({
          staffId: staffMember._id,
          staffName: staffMember.name,
          employeeId: staffMember.employeeId,
          designation: staffMember.designation || staffMember.role,
          department: staffMember.department?.name || '',
          month,
          year: parseInt(year),
          basicSalary: template.basicSalary + (adjustments.basicSalary || 0),
          allowances: {
            ...template.allowances,
            ...adjustments.allowances
          },
          deductions: {
            ...template.deductions,
            ...adjustments.deductions
          },
          grossSalary: template.grossSalary + (adjustments.basicSalary || 0) + 
            Object.values(adjustments.allowances || {}).reduce((sum, val) => sum + (val || 0), 0),
          netSalary: template.netSalary + (adjustments.basicSalary || 0) + 
            Object.values(adjustments.allowances || {}).reduce((sum, val) => sum + (val || 0), 0) -
            Object.values(adjustments.deductions || {}).reduce((sum, val) => sum + (val || 0), 0),
          templateId: template._id,
          templateVersion: template.version,
          customAdjustments: adjustments,
          createdBy: req.user.id,
          status: 'Approved',
          approvedBy: req.user.id,
          approvedAt: new Date()
        });

        await salaryRecord.save();
        
        results.successful.push({
          staffId: staffMember._id,
          staffName: staffMember.name,
          salaryRecordId: salaryRecord._id,
          netSalary: salaryRecord.netSalary
        });

      } catch (error) {
        results.failed.push({
          staffId: staffMember._id,
          staffName: staffMember.name,
          error: error.message
        });
      }
    }

    res.json({
      message: `Template applied successfully. ${results.successful.length} successful, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    console.error('Error applying template to staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/accountant/template-preview/:templateId
exports.getTemplatePreview = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { staffIds } = req.query;

    const template = await SalaryTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Salary template not found' });
    }

    let staff = [];
    if (staffIds) {
      staff = await Staff.find({ 
        _id: { $in: staffIds.split(',') },
        status: 'active' 
      })
      .select('name employeeId email role department designation')
      .populate('department', 'name');
    } else {
      // Get all staff with this role
      staff = await Staff.find({ 
        role: template.role,
        status: 'active' 
      })
      .select('name employeeId email role department designation')
      .populate('department', 'name');
    }

    const preview = staff.map(staffMember => ({
      staffId: staffMember._id,
      staffName: staffMember.name,
      employeeId: staffMember.employeeId,
      role: staffMember.role,
      department: staffMember.department?.name || 'N/A',
      designation: staffMember.designation || staffMember.role,
      salaryBreakdown: {
        basicSalary: template.basicSalary,
        totalAllowances: template.totalAllowances,
        totalDeductions: template.totalDeductions,
        grossSalary: template.grossSalary,
        netSalary: template.netSalary,
        calculatedPF: template.calculatedPF,
        calculatedTax: template.calculatedTax
      }
    }));

    res.json({
      template: {
        id: template._id,
        role: template.role,
        roleDisplayName: template.roleDisplayName,
        version: template.version,
        basicSalary: template.basicSalary,
        allowances: template.allowances,
        deductions: template.deductions,
        taxSettings: template.taxSettings,
        pfSettings: template.pfSettings,
        benefits: template.benefits
      },
      affectedStaff: preview,
      totalStaff: preview.length,
      totalSalaryCost: preview.length * template.netSalary
    });
  } catch (error) {
    console.error('Error generating template preview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/accountant/role-statistics
exports.getRoleStatistics = async (req, res) => {
  try {
    const roleStats = await Staff.aggregate([
      { $match: { status: 'active' } },
      { $group: { 
        _id: '$role', 
        count: { $sum: 1 },
        avgExperience: { $avg: { $toInt: '$experience' } }
      }},
      { $sort: { count: -1 } }
    ]);

    // Get salary templates for each role
    const templates = await SalaryTemplate.find({ isActive: true });
    const templateMap = {};
    templates.forEach(template => {
      templateMap[template.role] = template;
    });

    const statistics = roleStats.map(stat => ({
      role: stat._id,
      staffCount: stat.count,
      avgExperience: Math.round(stat.avgExperience || 0),
      hasTemplate: !!templateMap[stat._id],
      template: templateMap[stat._id] ? {
        basicSalary: templateMap[stat._id].basicSalary,
        netSalary: templateMap[stat._id].netSalary,
        version: templateMap[stat._id].version
      } : null
    }));

    res.json({
      totalStaff: roleStats.reduce((sum, stat) => sum + stat.count, 0),
      totalRoles: roleStats.length,
      rolesWithTemplates: templates.length,
      statistics
    });
  } catch (error) {
    console.error('Error fetching role statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 