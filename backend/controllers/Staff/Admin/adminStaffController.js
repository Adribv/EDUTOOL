const Student = require('../../../models/Student/studentModel');
const Staff = require('../../../models/Staff/staffModel');
const FeeStructure = require('../../../models/Finance/feeStructureModel');
const FeePayment = require('../../../models/Finance/feePaymentModel');
const Inventory = require('../../../models/Admin/inventoryModel');
const Transport = require('../../../models/Admin/transportModel');
const Visitor = require('../../../models/Admin/visitorModel');
const Event = require('../../../models/Admin/eventModel');
const Communication = require('../../../models/Communication/communicationModel');
const Calendar = require('../../../models/Academic/calendarModel');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const ClassModel = require('../../../models/Admin/classModel');
const SubjectModel = require('../../../models/Admin/subjectModel');
const ScheduleModel = require('../../../models/Admin/scheduleModel');
const Parent = require('../../../models/Parent/parentModel');

// 1. Student Records Management
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      password,
      class: studentClass,
      grade,
      section,
      dateOfBirth,
      gender,
      address,
      contactNumber,
      email,
      parentInfo
    } = req.body;

    const finalClass = studentClass || grade;
    let finalPassword = password;
    if (!finalPassword) {
      finalPassword = rollNumber ? `${rollNumber}@123` : Math.random().toString(36).slice(-8);
    }
    let finalGender = gender;
    if (gender) {
      const cap = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      finalGender = cap;
    }

    // Check if student with roll number already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    const newStudent = new Student({
      name,
      rollNumber,
      password: finalPassword,
      class: finalClass,
      section,
      dateOfBirth,
      gender: finalGender,
      address,
      contactNumber,
      email,
      parentInfo,
      status: 'Active'
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student registered successfully', student: newStudent });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const updateData = req.body;
    
    // Remove password from update data if it exists
    if (updateData.password) {
      delete updateData.password;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generateStudentID = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate ID card data
    const idCardData = {
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      contactNumber: student.contactNumber,
      validUntil: new Date(new Date().getFullYear() + 1, 3, 30), // Valid until April 30 next year
      issueDate: new Date(),
      photo: student.photo || 'default_photo.jpg'
    };

    res.json({ message: 'ID card generated successfully', idCardData });
  } catch (error) {
    console.error('Error generating student ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.processTransfer = async (req, res) => {
  try {
    const { studentId, transferReason, transferDate, transferTo } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student status to transferred
    student.status = 'Transferred';
    student.transferDetails = {
      reason: transferReason,
      date: transferDate,
      transferredTo: transferTo
    };

    await student.save();
    
    res.json({ message: 'Student transfer processed successfully', student });
  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Staff Records Administration
exports.getAllStaff = async (req, res) => {
  console.log('getAllStaff called with params:', req.query);
  try {
    const staff = await Staff.find().select('-password');
    console.log('Found staff:', staff);
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerStaff = async (req, res) => {
  console.log('Register staff request body:', req.body);
  try {
    const {
      name,
      employeeId,
      password,
      role,
      department,
      joiningDate,
      qualification,
      experience,
      contactNumber,
      email,
      address
    } = req.body;

    // Check if staff with employee ID already exists
    const existingStaff = await Staff.findOne({ employeeId });
    if (existingStaff) {
      return res.status(400).json({ message: 'Staff with this employee ID already exists' });
    }

    const newStaff = new Staff({
      name,
      email,
      password,
      role,
      department,
      employeeId,
      joiningDate,
      qualification,
      experience,
      contactNumber,
      address,
      assignedSubjects: []
    });

    await newStaff.save();
    res.status(201).json({ message: 'Staff registered successfully', staff: newStaff });
  } catch (error) {
    console.error('Error registering staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const updateData = req.body;
    
    // Remove password from update data if it exists
    if (updateData.password) {
      delete updateData.password;
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      staffId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ message: 'Staff updated successfully', staff: updatedStaff });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    
    const deletedStaff = await Staff.findByIdAndDelete(staffId);
    
    if (!deletedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generateStaffID = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Generate ID card data
    const idCardData = {
      name: staff.name,
      employeeId: staff.employeeId,
      role: staff.role,
      department: staff.department,
      joiningDate: staff.joiningDate,
      contactNumber: staff.contactNumber,
      email: staff.email,
      validUntil: new Date(new Date().getFullYear() + 1, 3, 30), // Valid until April 30 next year
      issueDate: new Date(),
      photo: staff.photo || 'default_photo.jpg'
    };

    res.json({ message: 'ID card generated successfully', idCardData });
  } catch (error) {
    console.error('Error generating staff ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.trackStaffAttendance = async (req, res) => {
  try {
    const { staffId, date, status, remarks } = req.body;
    
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Add attendance record
    if (!staff.attendance) {
      staff.attendance = [];
    }

    // Check if attendance for this date already exists
    const existingAttendanceIndex = staff.attendance.findIndex(
      a => new Date(a.date).toDateString() === new Date(date).toDateString()
    );

    if (existingAttendanceIndex >= 0) {
      // Update existing attendance
      staff.attendance[existingAttendanceIndex] = { date, status, remarks };
    } else {
      // Add new attendance record
      staff.attendance.push({ date, status, remarks });
    }

    await staff.save();
    
    res.json({ message: 'Staff attendance recorded successfully', staff });
  } catch (error) {
    console.error('Error recording staff attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Fee Management System
exports.getFeeStructures = async (req, res) => {
  try {
    const feeStructures = await FeeStructure.find();
    // Transform to simple format expected by frontend
    const simplified = feeStructures.map(fs => {
      const comps = fs.components?.length ? fs.components : fs.feeComponents;
      const first = comps && comps.length ? comps[0] : {};
      return {
        _id: fs._id,
        grade: fs.class,
        feeType: first.name,
        amount: fs.totalAmount || first.amount,
        dueDate: fs.dueDate,
        description: first.description || '',
      };
    });
    res.json(simplified);
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.configureFeeStructure = async (req, res) => {
  try {
    // Support both detailed and simple payloads
    let {
      academicYear,
      class: studentClass,
      term,
      feeComponents,
      dueDate,
      latePaymentCharges,
      grade,
      feeType,
      amount,
      description
    } = req.body;

    // Map simple payload to detailed structure
    if (!academicYear) {
      academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    }
    if (!studentClass && grade) studentClass = grade;
    if (!term) term = 'Annual';

    // Build feeComponents if not provided but feeType & amount exist
    if (!feeComponents && feeType && amount) {
      feeComponents = [{ name: feeType, amount, description }];
    }

    if (!feeComponents || feeComponents.length === 0) {
      return res.status(400).json({ message: 'Fee components are required' });
    }

    // Calculate total amount
    const totalAmount = feeComponents.reduce((sum, c) => sum + c.amount, 0);

    // Check existing
    const existingFeeStructure = await FeeStructure.findOne({
      academicYear,
      class: studentClass,
      term
    });

    if (existingFeeStructure) {
      existingFeeStructure.feeComponents = feeComponents;
      existingFeeStructure.components = feeComponents;
      existingFeeStructure.totalAmount = totalAmount;
      existingFeeStructure.dueDate = dueDate;
      existingFeeStructure.latePaymentFee = latePaymentCharges;
      await existingFeeStructure.save();
      return res.json({ message: 'Fee structure updated successfully', feeStructure: existingFeeStructure });
    }

    const newFeeStructure = new FeeStructure({
      academicYear,
      class: studentClass,
      term,
      feeComponents,
      components: feeComponents,
      totalAmount,
      dueDate,
      latePaymentFee: latePaymentCharges,
      createdBy: req.user.id
    });

    await newFeeStructure.save();
    res.status(201).json({ message: 'Fee structure created successfully', feeStructure: newFeeStructure });
  } catch (error) {
    console.error('Error configuring fee structure:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generateFeeInvoice = async (req, res) => {
  try {
    const { studentId, academicYear, term } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const feeStructure = await FeeStructure.findOne({
      academicYear,
      class: student.class
    });

    if (!feeStructure) {
      return res.status(404).json({ message: 'Fee structure not found for this class and academic year' });
    }

    // Calculate total fee amount
    const componentList = feeStructure.feeComponents?.length ? feeStructure.feeComponents : feeStructure.components;
    const totalAmount = componentList.reduce((total, component) => total + component.amount, 0);

    // Create fee invoice
    const invoice = {
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      academicYear,
      term,
      issueDate: new Date(),
      dueDate: feeStructure.dueDate,
      feeComponents: componentList,
      totalAmount,
      status: 'Pending'
    };

    res.json({ message: 'Fee invoice generated successfully', invoice });
  } catch (error) {
    console.error('Error generating fee invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.processFeePayment = async (req, res) => {
  try {
    const {
      studentId,
      academicYear,
      term,
      paymentDate,
      paymentMethod,
      paymentDetails,
      amount,
      remarks
    } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create new payment record
    const newPayment = new FeePayment({
      studentId,
      studentName: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      academicYear,
      term,
      paymentDate,
      paymentMethod,
      paymentDetails,
      amount,
      remarks,
      receiptNumber: `REC-${Date.now()}-${student.rollNumber}`
    });

    await newPayment.save();
    
    res.status(201).json({ 
      message: 'Fee payment processed successfully', 
      payment: newPayment 
    });
  } catch (error) {
    console.error('Error processing fee payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFeeDefaulters = async (req, res) => {
  try {
    const { academicYear, term, class: studentClass } = req.query;
    
    // Get all students in the specified class
    const students = await Student.find({ 
      class: studentClass,
      status: 'Active'
    });

    // Get all payments for the specified academic year and term
    const payments = await FeePayment.find({
      academicYear,
      term
    });

    // Get fee structure for the class
    const feeStructure = await FeeStructure.findOne({
      academicYear,
      class: studentClass
    });

    if (!feeStructure) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }

    // Calculate total fee amount
    const componentListDef = feeStructure.feeComponents?.length ? feeStructure.feeComponents : feeStructure.components;
    const totalFeeAmount = componentListDef.reduce((total, component) => total + component.amount, 0);

    // Identify defaulters
    const defaulters = students.map(student => {
      // Find payments made by this student
      const studentPayments = payments.filter(
        payment => payment.studentId.toString() === student._id.toString()
      );
      
      // Calculate total paid amount
      const paidAmount = studentPayments.reduce(
        (total, payment) => total + payment.amount, 0
      );
      
      // Calculate pending amount
      const pendingAmount = totalFeeAmount - paidAmount;
      
      return {
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section,
        totalFeeAmount,
        paidAmount,
        pendingAmount,
        isDefaulter: pendingAmount > 0
      };
    }).filter(student => student.isDefaulter);

    res.json(defaulters);
  } catch (error) {
    console.error('Error getting fee defaulters:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. Inventory Control
exports.addInventoryItem = async (req, res) => {
  try {
    const data = req.body;
    if (data.category) {
      const cap = data.category.charAt(0).toUpperCase() + data.category.slice(1).toLowerCase();
      data.category = cap;
    }
    const item = await Inventory.create(data);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateInventoryItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const updateData = req.body;

    const updatedItem = await Inventory.findByIdAndUpdate(
      itemId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ 
      message: 'Inventory item updated successfully', 
      item: updatedItem 
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.issueInventoryItem = async (req, res) => {
  try {
    const {
      itemId,
      issuedTo,
      issuedQuantity,
      issueDate,
      expectedReturnDate,
      purpose,
      remarks
    } = req.body;

    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Check if sufficient quantity is available
    if (item.quantity < issuedQuantity) {
      return res.status(400).json({ 
        message: 'Insufficient quantity available',
        available: item.quantity,
        requested: issuedQuantity
      });
    }

    // Update item quantity
    item.quantity -= issuedQuantity;
    
    // Add issue record
    if (!item.issueRecords) {
      item.issueRecords = [];
    }
    
    item.issueRecords.push({
      issuedTo,
      quantity: issuedQuantity,
      issueDate,
      expectedReturnDate,
      purpose,
      remarks,
      status: 'Issued'
    });

    await item.save();
    
    res.json({ 
      message: 'Inventory item issued successfully', 
      item 
    });
  } catch (error) {
    console.error('Error issuing inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$quantity", "$minimumStockLevel"] }
    });

    res.json(lowStockItems);
  } catch (error) {
    console.error('Error getting low stock items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 5. Transport Management
exports.addTransportVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      vehicleType,
      capacity,
      driverName,
      driverContact,
      driverLicense,
      routeNumber,
      routeDescription,
      stops
    } = req.body;

    const newVehicle = new Transport({
      vehicleNumber,
      vehicleType,
      capacity,
      driverName,
      driverContact,
      driverLicense,
      routeNumber,
      routeDescription,
      stops,
      status: 'Active',
      maintenanceSchedule: []
    });

    await newVehicle.save();
    
    res.status(201).json({ 
      message: 'Transport vehicle added successfully', 
      vehicle: newVehicle 
    });
  } catch (error) {
    console.error('Error adding transport vehicle:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTransportVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const updateData = req.body;

    const updatedVehicle = await Transport.findByIdAndUpdate(
      vehicleId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Transport vehicle not found' });
    }

    res.json({ 
      message: 'Transport vehicle updated successfully', 
      vehicle: updatedVehicle 
    });
  } catch (error) {
    console.error('Error updating transport vehicle:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignStudentToTransport = async (req, res) => {
  try {
    const { studentId, vehicleId, pickupStop, dropStop, effectiveFrom } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const vehicle = await Transport.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Transport vehicle not found' });
    }

    // Update student's transport information
    student.transportInfo = {
      vehicleId,
      routeNumber: vehicle.routeNumber,
      pickupStop,
      dropStop,
      effectiveFrom
    };

    await student.save();
    
    // Add student to vehicle's student list if not already present
    if (!vehicle.students) {
      vehicle.students = [];
    }
    
    const studentExists = vehicle.students.some(
      s => s.studentId.toString() === studentId
    );
    
    if (!studentExists) {
      vehicle.students.push({
        studentId,
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section,
        pickupStop,
        dropStop
      });
      
      await vehicle.save();
    }
    
    res.json({ 
      message: 'Student assigned to transport successfully', 
      student,
      vehicle
    });
  } catch (error) {
    console.error('Error assigning student to transport:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.scheduleVehicleMaintenance = async (req, res) => {
  try {
    const { vehicleId, maintenanceType, scheduledDate, description } = req.body;
    
    const vehicle = await Transport.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Transport vehicle not found' });
    }

    // Add maintenance schedule
    if (!vehicle.maintenanceSchedule) {
      vehicle.maintenanceSchedule = [];
    }
    
    vehicle.maintenanceSchedule.push({
      maintenanceType,
      scheduledDate,
      description,
      status: 'Scheduled'
    });

    await vehicle.save();
    
    res.json({ 
      message: 'Vehicle maintenance scheduled successfully', 
      vehicle 
    });
  } catch (error) {
    console.error('Error scheduling vehicle maintenance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 6. Visitor Management
exports.recordVisitor = async (req, res) => {
  try {
    const {
      name,
      contactNumber,
      purpose,
      whomToMeet,
      idProofType,
      idProofNumber,
      entryTime,
      expectedExitTime
    } = req.body;

    const newVisitor = new Visitor({
      name,
      contactNumber,
      purpose,
      whomToMeet,
      idProofType,
      idProofNumber,
      entryTime: entryTime || new Date(),
      expectedExitTime,
      status: 'Inside'
    });

    await newVisitor.save();
    
    res.status(201).json({ 
      message: 'Visitor recorded successfully', 
      visitor: newVisitor,
      visitorPass: {
        passId: newVisitor._id,
        name: newVisitor.name,
        purpose: newVisitor.purpose,
        whomToMeet: newVisitor.whomToMeet,
        entryTime: newVisitor.entryTime,
        expectedExitTime: newVisitor.expectedExitTime
      }
    });
  } catch (error) {
    console.error('Error recording visitor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateVisitorExit = async (req, res) => {
  try {
    const visitorId = req.params.id;
    const { exitTime, remarks } = req.body;
    
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor record not found' });
    }

    visitor.exitTime = exitTime || new Date();
    visitor.remarks = remarks;
    visitor.status = 'Left';

    await visitor.save();
    
    res.json({ 
      message: 'Visitor exit recorded successfully', 
      visitor 
    });
  } catch (error) {
    console.error('Error updating visitor exit:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVisitorLog = async (req, res) => {
  try {
    const { date, status } = req.query;
    
    const query = {};
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.entryTime = { $gte: startDate, $lte: endDate };
    }
    
    if (status) {
      query.status = status;
    }
    
    const visitors = await Visitor.find(query).sort({ entryTime: -1 });
    
    res.json(visitors);
  } catch (error) {
    console.error('Error getting visitor log:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 7. Event and Facility Coordination
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      venue,
      organizer,
      participants,
      resources,
      budget
    } = req.body;

    const newEvent = new Event({
      title,
      description,
      startDate,
      endDate,
      venue,
      organizer,
      participants,
      resources,
      budget,
      status: 'Scheduled'
    });

    await newEvent.save();
    
    res.status(201).json({ 
      message: 'Event created successfully', 
      event: newEvent 
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ 
      message: 'Event updated successfully', 
      event: updatedEvent 
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.bookFacility = async (req, res) => {
  try {
    const {
      facilityName,
      purpose,
      startDateTime,
      endDateTime,
      requestedBy,
      contactNumber,
      requirements
    } = req.body;

    // Check if facility is already booked for the requested time
    const conflictingEvents = await Event.find({
      venue: facilityName,
      $or: [
        {
          startDate: { $lte: new Date(startDateTime) },
          endDate: { $gte: new Date(startDateTime) }
        },
        {
          startDate: { $lte: new Date(endDateTime) },
          endDate: { $gte: new Date(endDateTime) }
        },
        {
          startDate: { $gte: new Date(startDateTime) },
          endDate: { $lte: new Date(endDateTime) }
        }
      ],
      status: { $in: ['Scheduled', 'In Progress'] }
    });

    if (conflictingEvents.length > 0) {
      return res.status(409).json({ 
        message: 'Facility already booked for the requested time',
        conflictingEvents
      });
    }

    // Create a new event for the facility booking
    const facilityBooking = new Event({
      title: `${facilityName} Booking - ${purpose}`,
      description: purpose,
      startDate: startDateTime,
      endDate: endDateTime,
      venue: facilityName,
      organizer: requestedBy,
      participants: [],
      resources: requirements,
      status: 'Scheduled',
      bookingDetails: {
        contactNumber,
        requirements
      }
    });

    await facilityBooking.save();
    
    res.status(201).json({
      message: 'Facility booked successfully', 
      booking: facilityBooking 
    });
  } catch (error) {
    console.error('Error booking facility:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 8. Communication Support
exports.sendBulkCommunication = async (req, res) => {
  try {
    const {
      subject,
      content,
      recipients,
      communicationType,
      scheduledDate,
      attachments
    } = req.body;

    const newCommunication = new Communication({
      subject,
      content,
      recipients,
      communicationType,
      scheduledDate: scheduledDate || new Date(),
      attachments,
      sentBy: req.user.id,
      status: scheduledDate && new Date(scheduledDate) > new Date() ? 'Scheduled' : 'Sent',
      sentDate: scheduledDate && new Date(scheduledDate) > new Date() ? null : new Date()
    });

    await newCommunication.save();
    
    res.status(201).json({ 
      message: 'Communication created successfully', 
      communication: newCommunication 
    });
  } catch (error) {
    console.error('Error sending bulk communication:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCommunicationHistory = async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    
    const query = {};
    
    if (type) {
      query.communicationType = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.scheduledDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const communications = await Communication.find(query)
      .sort({ scheduledDate: -1 })
      .populate('sentBy', 'name employeeId');
    
    res.json(communications);
  } catch (error) {
    console.error('Error getting communication history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCommunicationStatus = async (req, res) => {
  try {
    const communicationId = req.params.id;
    const { status } = req.body;
    
    const communication = await Communication.findById(communicationId);
    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    communication.status = status;
    
    if (status === 'Sent') {
      communication.sentDate = new Date();
    }

    await communication.save();
    
    res.json({ 
      message: 'Communication status updated successfully', 
      communication 
    });
  } catch (error) {
    console.error('Error updating communication status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCommunication = async (req, res) => {
  try {
    const communicationId = req.params.id;
    const updateData = req.body;

    const allowedFields = [
      'subject',
      'content',
      'recipients',
      'communicationType',
      'scheduledDate',
      'attachments',
      'status',
      'sentDate',
      'priority',
      'endDate'
    ];

    const sanitizedData = {};
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field];
      }
    });

    const updatedComm = await Communication.findByIdAndUpdate(
      communicationId,
      { $set: sanitizedData },
      { new: true, runValidators: true }
    );

    if (!updatedComm) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    res.json({ message: 'Communication updated successfully', communication: updatedComm });
  } catch (error) {
    console.error('Error updating communication:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 9. Reporting and Records
exports.generateEnrollmentReport = async (req, res) => {
  try {
    const { academicYear, class: studentClass, section, gender, status, format } = req.query;
    
    const query = { status: 'Active' };
    
    if (academicYear) {
      query.academicYear = academicYear;
    }
    
    if (studentClass) {
      query.class = studentClass;
    }
    
    if (section) {
      query.section = section;
    }
    
    if (gender) {
      query.gender = gender;
    }
    
    if (status) {
      query.status = status;
    }
    
    const students = await Student.find(query).select('-password');
    
    // Generate enrollment statistics
    const totalStudents = students.length;
    
    // Group by class
    const classCounts = {};
    students.forEach(student => {
      const studentClass = student.class;
      if (!classCounts[studentClass]) {
        classCounts[studentClass] = 0;
      }
      classCounts[studentClass]++;
    });
    
    // Group by gender
    const genderCounts = {
      Male: students.filter(s => s.gender === 'Male').length,
      Female: students.filter(s => s.gender === 'Female').length,
      Other: students.filter(s => s.gender === 'Other').length
    };
    
    const report = {
      totalStudents,
      classCounts,
      genderCounts,
      generatedAt: new Date(),
      filters: {
        academicYear,
        class: studentClass,
        section,
        gender,
        status
      }
    };
    
    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="student-enrollment-report.pdf"');
      doc.pipe(res);

      doc.fontSize(18).text('Student Enrollment Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Generated At: ${new Date().toLocaleString()}`);
      if (academicYear) doc.text(`Academic Year: ${academicYear}`);
      if (studentClass) doc.text(`Class: ${studentClass}`);
      if (section) doc.text(`Section: ${section}`);
      if (gender) doc.text(`Gender: ${gender}`);
      doc.moveDown();

      doc.text(`Total Students: ${totalStudents}`);
      doc.moveDown();

      doc.fontSize(14).text('Students by Class');
      Object.entries(classCounts).forEach(([cls, count]) => {
        doc.fontSize(12).text(`${cls}: ${count}`);
      });
      doc.moveDown();

      doc.fontSize(14).text('Gender Distribution');
      Object.entries(genderCounts).forEach(([g, count]) => {
        doc.fontSize(12).text(`${g}: ${count}`);
      });

      doc.end();
    } else {
      res.json(report);
    }
  } catch (error) {
    console.error('Error generating enrollment report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generateStaffReport = async (req, res) => {
  try {
    const { department, role, status } = req.query;
    
    const query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }
    
    const staff = await Staff.find(query).select('-password');
    
    // Generate staff statistics
    const totalStaff = staff.length;
    
    // Group by department
    const departmentCounts = {};
    staff.forEach(s => {
      const dept = s.department;
      if (!departmentCounts[dept]) {
        departmentCounts[dept] = 0;
      }
      departmentCounts[dept]++;
    });
    
    // Group by role
    const roleCounts = {};
    staff.forEach(s => {
      const role = s.role;
      if (!roleCounts[role]) {
        roleCounts[role] = 0;
      }
      roleCounts[role]++;
    });
    
    const report = {
      totalStaff,
      departmentCounts,
      roleCounts,
      generatedAt: new Date(),
      filters: {
        department,
        role,
        status
      }
    };
    
    res.json(report);
  } catch (error) {
    console.error('Error generating staff report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generateFeeCollectionReport = async (req, res) => {
  try {
    const { academicYear, term, startDate, endDate, class: studentClass, format } = req.query;
    
    const query = {};
    
    if (academicYear) {
      query.academicYear = academicYear;
    }
    
    if (term) {
      query.term = term;
    }
    
    if (startDate && endDate) {
      query.paymentDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    if (studentClass) {
      query.class = studentClass;
    }
    
    const payments = await FeePayment.find(query);
    
    // Calculate total collection
    const totalCollection = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Group by payment method
    const paymentMethodCounts = {};
    payments.forEach(payment => {
      const method = payment.paymentMethod;
      if (!paymentMethodCounts[method]) {
        paymentMethodCounts[method] = {
          count: 0,
          amount: 0
        };
      }
      paymentMethodCounts[method].count++;
      paymentMethodCounts[method].amount += payment.amount;
    });
    
    // Group by class
    const classCollection = {};
    payments.forEach(payment => {
      const cls = payment.class;
      if (!classCollection[cls]) {
        classCollection[cls] = 0;
      }
      classCollection[cls] += payment.amount;
    });
    
    const report = {
      totalCollection,
      paymentMethodCounts,
      classCollection,
      totalPayments: payments.length,
      generatedAt: new Date(),
      filters: {
        academicYear,
        term,
        startDate,
        endDate,
        class: studentClass
      }
    };
    
    if (format === 'pdf') {
      // Generate PDF on the fly
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="fee-collection-report.pdf"');
      doc.pipe(res);

      doc.fontSize(18).text('Fee Collection Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Generated At: ${new Date().toLocaleString()}`);
      if (academicYear) doc.text(`Academic Year: ${academicYear}`);
      if (term) doc.text(`Term: ${term}`);
      if (studentClass) doc.text(`Class: ${studentClass}`);
      if (startDate && endDate) doc.text(`From ${startDate} to ${endDate}`);
      doc.moveDown();

      doc.text(`Total Collection: ₹${totalCollection}`);
      doc.text(`Total Payments: ${payments.length}`);
      doc.moveDown();

      doc.fontSize(14).text('Collection by Payment Method');
      Object.entries(paymentMethodCounts).forEach(([method, info]) => {
        doc.fontSize(12).text(`${method}: ₹${info.amount} (${info.count} payments)`);
      });
      doc.moveDown();

      doc.fontSize(14).text('Collection by Class');
      Object.entries(classCollection).forEach(([cls, amount]) => {
        doc.fontSize(12).text(`${cls}: ₹${amount}`);
      });

      doc.end();
    } else {
      res.json(report);
    }
  } catch (error) {
    console.error('Error generating fee collection report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 10. Calendar Management
exports.addCalendarEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      isHoliday,
      targetAudience,
      location,
      organizer
    } = req.body;

    const newCalendarEvent = new Calendar({
      title,
      description,
      eventType,
      startDate,
      endDate,
      isHoliday,
      targetAudience,
      location,
      organizer,
      createdBy: req.user.id,
      status: 'Active'
    });

    await newCalendarEvent.save();
    
    res.status(201).json({ 
      message: 'Calendar event added successfully', 
      event: newCalendarEvent 
    });
  } catch (error) {
    console.error('Error adding calendar event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCalendarEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    const updatedEvent = await Calendar.findByIdAndUpdate(
      eventId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }

    res.json({ 
      message: 'Calendar event updated successfully', 
      event: updatedEvent 
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCalendarEvents = async (req, res) => {
  try {
    const { month, year, eventType, isHoliday } = req.query;
    
    const query = { status: 'Active' };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      query.$or = [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        {
          startDate: { $lte: startDate },
          endDate: { $gte: endDate }
        }
      ];
    }
    
    if (eventType) {
      query.eventType = eventType;
    }
    
    if (isHoliday !== undefined) {
      query.isHoliday = isHoliday === 'true';
    }
    
    const events = await Calendar.find(query)
      .sort({ startDate: 1 })
      .populate('createdBy', 'name employeeId');
    
    res.json(events);
  } catch (error) {
    console.error('Error getting calendar events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCalendarEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const event = await Calendar.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Calendar event not found' });
    }

    // Soft delete by updating status
    event.status = 'Deleted';
    await event.save();
    
    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Additional utility functions
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts of various entities
    const studentCount = await Student.countDocuments({ status: 'Active' });
    const staffCount = await Staff.countDocuments({ status: 'Active' });
    const visitorCount = await Visitor.countDocuments({ 
      entryTime: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
      },
      status: 'Inside'
    });
    
    // Get upcoming events
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingEvents = await Calendar.find({
      startDate: { $gte: today, $lte: nextWeek },
      status: 'Active'
    }).sort({ startDate: 1 }).limit(5);
    
    // Get low stock inventory items
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$quantity", "$minimumStockLevel"] }
    }).limit(5);
    
    // Get recent fee payments
    const recentPayments = await FeePayment.find()
      .sort({ paymentDate: -1 })
      .limit(5);
    
    const stats = {
      counts: {
        students: studentCount,
        staff: staffCount,
        activeVisitors: visitorCount
      },
      upcomingEvents,
      lowStockItems,
      recentPayments
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, contactNumber, address } = req.body;
    
    // Find staff by ID
    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Update fields
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (contactNumber) staff.contactNumber = contactNumber;
    if (address) staff.address = address;

    // Save changes
    await staff.save();

    // Return updated staff without password
    const updatedStaff = await Staff.findById(req.user.id).select('-password');
    res.json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Update profile image path
    const relativePath = path.relative(path.join(__dirname, '..', '..', '..'), req.file.path);
    staff.profileImage = relativePath.replace(/\\/g, '/');
    await staff.save();

    res.json({ 
      message: 'Profile image updated successfully',
      profileImage: staff.profileImage
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ message: 'Server error while updating profile image' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' });
    }

    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Verify current password
    const isMatch = await staff.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password (will be hashed by the pre-save middleware)
    staff.password = newPassword;
    await staff.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error while updating password' });
  }
};

exports.deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const feeStructure = await FeeStructure.findByIdAndDelete(id);
    if (!feeStructure) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }
    res.json({ message: 'Fee structure deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee structure:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Class Management
exports.getClasses = async (req,res)=>{
  try{
    const classes=await ClassModel.find();
    res.json(classes);
  }catch(err){
    console.error('Error fetching classes:',err);
    res.status(500).json({message:'Server error'});
  }
};

exports.createClass = async(req,res)=>{
  try{
    const newClass = await ClassModel.create(req.body);
    res.status(201).json(newClass);
  }catch(err){
    console.error('Error creating class:',err);
    res.status(500).json({message:'Server error'});
  }
};

exports.updateClass = async(req,res)=>{
  try{
    const {id}=req.params;
    const updated=await ClassModel.findByIdAndUpdate(id,{$set:req.body},{new:true,runValidators:true});
    if(!updated) return res.status(404).json({message:'Class not found'});
    res.json(updated);
  }catch(err){
    console.error('Error updating class:',err);
    res.status(500).json({message:'Server error'});
  }
};

exports.deleteClass = async(req,res)=>{
  try{
    const {id}=req.params;
    const del=await ClassModel.findByIdAndDelete(id);
    if(!del) return res.status(404).json({message:'Class not found'});
    res.json({message:'Class deleted'});
  }catch(err){
    console.error('Error deleting class:',err);
    res.status(500).json({message:'Server error'});
  }
};

// Subject Management
exports.getSubjects=async(req,res)=>{
  try{const subs=await SubjectModel.find();res.json(subs);}catch(e){console.error(e);res.status(500).json({message:'Server error'});} };
exports.createSubject=async(req,res)=>{try{const s=await SubjectModel.create(req.body);res.status(201).json(s);}catch(e){console.error(e);res.status(500).json({message:'Server error'});} };
exports.updateSubject=async(req,res)=>{try{const s=await SubjectModel.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true,runValidators:true});if(!s)return res.status(404).json({message:'Subject not found'});res.json(s);}catch(e){console.error(e);res.status(500).json({message:'Server error'});} };
exports.deleteSubject=async(req,res)=>{try{const s=await SubjectModel.findByIdAndDelete(req.params.id);if(!s)return res.status(404).json({message:'Subject not found'});res.json({message:'Subject deleted'});}catch(e){console.error(e);res.status(500).json({message:'Server error'});} };

// Schedule Management
exports.getSchedules=async(req,res)=>{try{const list=await ScheduleModel.find();res.json(list);}catch(e){console.error(e);res.status(500).json({message:'Server error'});} };
exports.createSchedule=async(req,res)=>{try{const sch=await ScheduleModel.create(req.body);res.status(201).json(sch);}catch(e){console.error(e);res.status(500).json({message:'Server error'});} };
exports.updateSchedule=async(req,res)=>{try{const sch=await ScheduleModel.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true,runValidators:true});if(!sch)return res.status(404).json({message:'Schedule not found'});res.json(sch);}catch(e){console.error(e);res.status(500).json({message:'Server error'});} };
exports.deleteSchedule=async(req,res)=>{try{const sch=await ScheduleModel.findByIdAndDelete(req.params.id);if(!sch)return res.status(404).json({message:'Schedule not found'});res.json({message:'Schedule deleted'});}catch(e){console.error(e);res.status(500).json({message:'Server error'});} };

// Parent Management
exports.getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find().populate('children', 'name rollNumber class section');
    res.json(parents);
  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await Parent.findById(id).populate('children', 'name rollNumber class section');
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    res.json(parent);
  } catch (error) {
    console.error('Error fetching parent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerParent = async (req, res) => {
  try {
    const { name, email, password, contactNumber, address, childRollNumbers } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required fields' 
      });
    }
    
    // Check if parent already exists
    const existingParent = await Parent.findOne({ email });
    if (existingParent) {
      return res.status(400).json({ message: 'Parent with this email already exists' });
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create parent
    const parent = new Parent({
      name,
      email,
      password: hashedPassword,
      contactNumber: contactNumber || '',
      address: address || {},
      childRollNumbers: childRollNumbers || []
    });
    
    await parent.save();
    
    // Return parent without password
    const parentResponse = await Parent.findById(parent._id).select('-password');
    res.status(201).json(parentResponse);
  } catch (error) {
    console.error('Error registering parent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, contactNumber, address, childRollNumbers } = req.body;
    
    const parent = await Parent.findById(id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Update fields
    if (name) parent.name = name;
    if (email) parent.email = email;
    if (contactNumber) parent.contactNumber = contactNumber;
    if (address) parent.address = address;
    if (childRollNumbers) parent.childRollNumbers = childRollNumbers;
    
    await parent.save();
    
    // Return updated parent without password
    const updatedParent = await Parent.findById(id).select('-password').populate('children', 'name rollNumber class section');
    res.json(updatedParent);
  } catch (error) {
    console.error('Error updating parent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await Parent.findByIdAndDelete(id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    res.json({ message: 'Parent deleted successfully' });
  } catch (error) {
    console.error('Error deleting parent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};