const StudentFeeRecord = require('../../../models/Finance/studentFeeRecordModel');
const StaffSalaryRecord = require('../../../models/Finance/staffSalaryRecordModel');
const Student = require('../../../models/Student/studentModel');
const Staff = require('../../../models/Staff/staffModel');
const ApprovalRequest = require('../../../models/Staff/HOD/approvalRequest.model');

// Student Fee Records Management

// Get all student fee records
exports.getStudentFeeRecords = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      class: studentClass, 
      section, 
      paymentStatus, 
      status,
      academicYear,
      term 
    } = req.query;

    const query = {};
    
    if (studentClass) query.class = studentClass;
    if (section) query.section = section;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;

    const skip = (page - 1) * limit;
    
    const records = await StudentFeeRecord.find(query)
      .populate('studentId', 'name rollNumber class section')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudentFeeRecord.countDocuments(query);

    res.json({
      data: records,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching student fee records:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create individual student fee record
exports.createStudentFeeRecord = async (req, res) => {
  try {
    console.log('📝 Creating student fee record with data:', req.body);
    console.log('👤 User info:', req.user);
    
    const {
      studentId,
      academicYear,
      term,
      totalFee,
      paymentReceived,
      dueDate,
      parentName,
      contactNumber,
      admissionNumber,
      paymentMethod,
      reminderDate,
      followUpDate,
      noticeIssueDate,
      modeOfContact,
      remarks,
      parentContact
    } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error('❌ User not authenticated');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate required fields
    if (!studentId || !academicYear || !term || !totalFee || !parentName || !contactNumber || !admissionNumber) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ message: 'Missing required fields: studentId, academicYear, term, totalFee, parentName, contactNumber, admissionNumber are required' });
    }

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      console.error('❌ Student not found:', studentId);
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('✅ Student found:', student.name);

    // Create approval request instead of direct creation
    const approvalRequest = new ApprovalRequest({
      requesterId: req.user.id,
      requesterName: req.user.name || 'Admin',
      requestType: 'StudentFeeRecord',
      title: `Student Fee Record - ${student.name} (${student.class}-${student.section})`,
      description: `Fee record for ${student.name} - Total fee of ₹${totalFee} for ${term} ${academicYear}`,
      requestData: {
        studentId,
        studentName: student.name,
        rollNumber: student.rollNumber,
        admissionNumber,
        class: student.class,
        section: student.section,
        academicYear,
        term,
        totalFee: parseFloat(totalFee),
        paymentReceived: parseFloat(paymentReceived || 0),
        balanceDue: parseFloat(totalFee) - parseFloat(paymentReceived || 0),
        dueDate: new Date(dueDate),
        parentName,
        contactNumber,
        paymentMethod,
        reminderDate: reminderDate ? new Date(reminderDate) : undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        noticeIssueDate: noticeIssueDate ? new Date(noticeIssueDate) : undefined,
        modeOfContact,
        remarks,
        parentContact
      },
      status: 'Pending',
      currentApprover: 'Principal'
    });

    console.log('📋 Approval request created:', approvalRequest);

    await approvalRequest.save();
    console.log('✅ Approval request saved successfully');

    res.status(201).json({
      message: 'Student fee record approval request submitted successfully',
      approvalRequest
    });
  } catch (error) {
    console.error('❌ Error creating student fee record:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Bulk import student fee records from Google Sheets
exports.bulkImportStudentFeeRecords = async (req, res) => {
  try {
    const { records } = req.body;
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Records array is required and cannot be empty' });
    }

    const results = {
      successful: [],
      failed: [],
      total: records.length
    };

    for (const recordData of records) {
      try {
        const {
          studentName,
          rollNumber,
          class: studentClass,
          section,
          academicYear,
          term,
          totalFee,
          paymentReceived,
          dueDate,
          parentName,
          contactNumber,
          admissionNumber,
          paymentMethod,
          reminderDate,
          followUpDate,
          noticeIssueDate,
          modeOfContact,
          remarks,
          parentContact
        } = recordData;

        // Validate required fields
        if (!studentName || !rollNumber || !studentClass || !section || !academicYear || !term || !totalFee || !parentName || !contactNumber || !admissionNumber) {
          results.failed.push({
            ...recordData,
            error: 'Missing required fields: studentName, rollNumber, class, section, academicYear, term, totalFee, parentName, contactNumber, admissionNumber are required'
          });
          continue;
        }

        // Find student by roll number
        const student = await Student.findOne({ rollNumber });
        if (!student) {
          results.failed.push({
            ...recordData,
            error: 'Student not found with this roll number'
          });
          continue;
        }

        // Create approval request for each record
        const approvalRequest = new ApprovalRequest({
          requesterId: req.user.id,
          requesterName: req.user.name || 'Admin',
          requestType: 'StudentFeeRecord',
          title: `Student Fee Record - ${studentName} (${studentClass}-${section})`,
          description: `Fee record for ${studentName} - Total fee of ₹${totalFee} for ${term} ${academicYear}`,
          requestData: {
            studentId: student._id,
            studentName,
            rollNumber,
            admissionNumber,
            class: studentClass,
            section,
            academicYear,
            term,
            totalFee: parseFloat(totalFee),
            paymentReceived: parseFloat(paymentReceived || 0),
            balanceDue: parseFloat(totalFee) - parseFloat(paymentReceived || 0),
            dueDate: dueDate ? new Date(dueDate) : new Date(),
            parentName,
            contactNumber,
            paymentMethod,
            reminderDate: reminderDate ? new Date(reminderDate) : undefined,
            followUpDate: followUpDate ? new Date(followUpDate) : undefined,
            noticeIssueDate: noticeIssueDate ? new Date(noticeIssueDate) : undefined,
            modeOfContact,
            remarks,
            parentContact
          },
          status: 'Pending',
          currentApprover: 'Principal'
        });

        await approvalRequest.save();
        results.successful.push({
          ...recordData,
          approvalId: approvalRequest._id
        });

      } catch (error) {
        console.error('Error importing student fee record:', recordData, error);
        results.failed.push({
          ...recordData,
          error: error.message || 'Unknown error'
        });
      }
    }

    res.status(200).json({
      message: `Bulk import completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      results
    });

  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ message: 'Server error during bulk import' });
  }
};

// Create individual student fee record (Direct creation for testing)
exports.createStudentFeeRecordDirect = async (req, res) => {
  try {
    console.log('📝 Creating student fee record directly with data:', req.body);
    console.log('👤 User info:', req.user);
    
    const {
      studentId,
      academicYear,
      term,
      totalFee,
      paymentReceived,
      dueDate,
      parentName,
      contactNumber,
      admissionNumber,
      paymentMethod,
      reminderDate,
      followUpDate,
      noticeIssueDate,
      modeOfContact,
      remarks,
      parentContact
    } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error('❌ User not authenticated');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate required fields
    if (!studentId || !academicYear || !term || !totalFee || !parentName || !contactNumber || !admissionNumber) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ message: 'Missing required fields: studentId, academicYear, term, totalFee, parentName, contactNumber, admissionNumber are required' });
    }

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      console.error('❌ Student not found:', studentId);
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('✅ Student found:', student.name);

    // Create fee record directly
    const newFeeRecord = new StudentFeeRecord({
      studentId,
      studentName: student.name,
      rollNumber: student.rollNumber,
      admissionNumber,
      class: student.class,
      section: student.section,
      academicYear,
      term,
      totalFee: parseFloat(totalFee),
      paymentReceived: parseFloat(paymentReceived || 0),
      balanceDue: parseFloat(totalFee) - parseFloat(paymentReceived || 0),
      dueDate: new Date(dueDate),
      parentName,
      contactNumber,
      paymentMethod,
      reminderDate: reminderDate ? new Date(reminderDate) : undefined,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      noticeIssueDate: noticeIssueDate ? new Date(noticeIssueDate) : undefined,
      modeOfContact,
      remarks,
      parentContact,
      createdBy: req.user.id,
      status: 'Approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    console.log('📋 Fee record created:', newFeeRecord);

    const savedRecord = await newFeeRecord.save();
    console.log('✅ Fee record saved successfully:', savedRecord._id);

    res.status(201).json({
      message: 'Student fee record created successfully',
      feeRecord: savedRecord
    });
  } catch (error) {
    console.error('❌ Error creating student fee record:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get pending approval requests for fee records
exports.getPendingFeeRecordApprovals = async (req, res) => {
  try {
    const pendingApprovals = await ApprovalRequest.find({
      requestType: 'StudentFeeRecord',
      status: 'Pending'
    })
    .populate('requesterId', 'name email role')
    .sort({ createdAt: -1 });

    res.json({
      pendingApprovals,
      count: pendingApprovals.length
    });
  } catch (error) {
    console.error('Error fetching pending fee record approvals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Staff Salary Records Management

// Get all staff salary records
exports.getStaffSalaryRecords = async (req, res) => {
  try {
    console.log('getStaffSalaryRecords called with query:', req.query);
    
    const { 
      page = 1, 
      limit, 
      department, 
      paymentStatus, 
      status,
      month,
      year,
      staffId // <-- add staffId support
    } = req.query;

    const query = {};
    
    if (department) query.department = department;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (status) query.status = status;
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    if (staffId) query.staffId = staffId; // <-- filter by staffId if provided

    console.log('Final query:', query);

    const skip = limit ? (page - 1) * limit : 0;
    
    let queryBuilder = StaffSalaryRecord.find(query)
      .populate('staffId', 'name employeeId designation')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    
    if (limit) {
      queryBuilder = queryBuilder.skip(skip).limit(parseInt(limit));
    }
    
    const records = await queryBuilder;

    console.log('Found records:', records.length);

    const total = await StaffSalaryRecord.countDocuments(query);

    const response = {
      data: records,
      pagination: {
        current: parseInt(page),
        total: limit ? Math.ceil(total / limit) : 1,
        totalRecords: total
      }
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching staff salary records:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create individual staff salary record
exports.createStaffSalaryRecord = async (req, res) => {
  try {
    console.log('📝 Creating staff salary record with data:', req.body);
    console.log('👤 User info:', req.user);
    
    const {
      staffId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      remarks,
      attendance,
      performance
    } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error('❌ User not authenticated');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate required fields
    if (!staffId || !month || !year || !basicSalary) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      console.error('❌ Staff not found:', staffId);
      return res.status(404).json({ message: 'Staff not found' });
    }

    console.log('✅ Staff found:', staff.name);

    // Calculate gross and net salary
    const totalAllowances = Object.values(allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
    const totalDeductions = Object.values(deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
    const grossSalary = basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    console.log('💰 Salary calculation:', { basicSalary, totalAllowances, totalDeductions, grossSalary, netSalary });

    // Create approval request instead of direct creation
    const approvalRequest = new ApprovalRequest({
      requesterId: req.user.id,
      requesterName: req.user.name || 'Admin',
      requestType: 'StaffSalaryRecord',
      title: `Staff Salary Record - ${staff.name} (${staff.employeeId})`,
      description: `Salary record for ${staff.name} - ${month} ${year}, Net Salary: ₹${netSalary}`,
      requestData: {
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
        remarks,
        attendance,
        performance
      },
      status: 'Pending',
      currentApprover: 'Principal'
    });

    console.log('📋 Approval request created:', approvalRequest);

    await approvalRequest.save();
    console.log('✅ Approval request saved successfully');

    res.status(201).json({
      message: 'Staff salary record approval request submitted successfully',
      approvalRequest
    });
  } catch (error) {
    console.error('❌ Error creating staff salary record:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Bulk import staff salary records from Google Sheets
exports.bulkImportStaffSalaryRecords = async (req, res) => {
  try {
    const { records } = req.body;
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Records array is required and cannot be empty' });
    }

    const results = {
      successful: [],
      failed: [],
      total: records.length
    };

    for (const recordData of records) {
      try {
        const {
          staffName,
          employeeId,
          designation,
          department,
          month,
          year,
          basicSalary,
          allowances,
          deductions,
          remarks,
          attendance,
          performance
        } = recordData;

        // Validate required fields
        if (!staffName || !employeeId || !designation || !month || !year || !basicSalary) {
          results.failed.push({
            ...recordData,
            error: 'Missing required fields'
          });
          continue;
        }

        // Find staff by employee ID
        const staff = await Staff.findOne({ employeeId });
        if (!staff) {
          results.failed.push({
            ...recordData,
            error: 'Staff not found with this employee ID'
          });
          continue;
        }

        // Calculate gross and net salary
        const totalAllowances = Object.values(allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
        const totalDeductions = Object.values(deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
        const grossSalary = basicSalary + totalAllowances;
        const netSalary = grossSalary - totalDeductions;

        // Create approval request for each record
        const approvalRequest = new ApprovalRequest({
          requesterId: req.user.id,
          requesterName: req.user.name || 'Admin',
          requestType: 'StaffSalaryRecord',
          title: `Staff Salary Record - ${staffName} (${employeeId})`,
          description: `Salary record for ${staffName} - ${month} ${year}, Net Salary: ₹${netSalary}`,
          requestData: {
            staffId: staff._id,
            staffName,
            employeeId,
            designation,
            department,
            month,
            year: parseInt(year),
            basicSalary: parseFloat(basicSalary),
            allowances,
            deductions,
            grossSalary,
            netSalary,
            remarks,
            attendance,
            performance
          },
          status: 'Pending',
          currentApprover: 'Principal'
        });

        await approvalRequest.save();
        results.successful.push({
          ...recordData,
          approvalId: approvalRequest._id
        });

      } catch (error) {
        console.error('Error importing staff salary record:', recordData, error);
        results.failed.push({
          ...recordData,
          error: error.message || 'Unknown error'
        });
      }
    }

    res.status(200).json({
      message: `Bulk import completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      results
    });

  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ message: 'Server error during bulk import' });
  }
};

// Get fee records statistics
exports.getFeeRecordsStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Student fee records stats
    const studentFeeStats = await StudentFeeRecord.aggregate([
      {
        $match: {
          academicYear: currentYear.toString()
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$totalFee', '$amount', 0] } },
          totalPaid: { $sum: { $ifNull: ['$paymentReceived', '$amountPaid', 0] } },
          pendingAmount: { 
            $sum: { 
              $subtract: [
                { $ifNull: ['$totalFee', '$amount', 0] }, 
                { $ifNull: ['$paymentReceived', '$amountPaid', 0] }
              ] 
            } 
          }
        }
      }
    ]);

    // Staff salary records stats
    const staffSalaryStats = await StaffSalaryRecord.aggregate([
      {
        $match: {
          year: currentYear
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalGrossSalary: { $sum: '$grossSalary' },
          totalNetSalary: { $sum: '$netSalary' },
          totalPaid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$netSalary', 0] } }
        }
      }
    ]);

    res.json({
      studentFeeRecords: studentFeeStats[0] || {
        totalRecords: 0,
        totalAmount: 0,
        totalPaid: 0,
        pendingAmount: 0
      },
      staffSalaryRecords: staffSalaryStats[0] || {
        totalRecords: 0,
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalPaid: 0
      }
    });
  } catch (error) {
    console.error('Error fetching fee records stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 