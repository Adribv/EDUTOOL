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
      section,
      dateOfBirth,
      gender,
      address,
      contactNumber,
      email,
      parentInfo
    } = req.body;

    // Check if student with roll number already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    const newStudent = new Student({
      name,
      rollNumber,
      password,
      class: studentClass,
      section,
      dateOfBirth,
      gender,
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
exports.configureFeeStructure = async (req, res) => {
  try {
    const {
      academicYear,
      class: studentClass,
      feeComponents,
      dueDate,
      latePaymentCharges
    } = req.body;

    // Check if fee structure for this class and academic year already exists
    const existingFeeStructure = await FeeStructure.findOne({
      academicYear,
      class: studentClass
    });

    if (existingFeeStructure) {
      // Update existing fee structure
      existingFeeStructure.feeComponents = feeComponents;
      existingFeeStructure.dueDate = dueDate;
      existingFeeStructure.latePaymentCharges = latePaymentCharges;
      
      await existingFeeStructure.save();
      return res.json({ 
        message: 'Fee structure updated successfully', 
        feeStructure: existingFeeStructure 
      });
    }

    // Create new fee structure
    const newFeeStructure = new FeeStructure({
      academicYear,
      class: studentClass,
      feeComponents,
      dueDate,
      latePaymentCharges
    });

    await newFeeStructure.save();
    res.status(201).json({ 
      message: 'Fee structure created successfully', 
      feeStructure: newFeeStructure 
    });
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
    const totalAmount = feeStructure.feeComponents.reduce(
      (total, component) => total + component.amount, 0
    );

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
      feeComponents: feeStructure.feeComponents,
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
    const totalFeeAmount = feeStructure.feeComponents.reduce(
      (total, component) => total + component.amount, 0
    );

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
    const {
      name,
      category,
      quantity,
      unit,
      unitPrice,
      supplier,
      purchaseDate,
      location,
      minimumStockLevel,
      description
    } = req.body;

    const newItem = new Inventory({
      name,
      category,
      quantity,
      unit,
      unitPrice,
      supplier,
      purchaseDate,
      location,
      minimumStockLevel,
      description,
      status: 'Available'
    });

    await newItem.save();
    
    res.status(201).json({ 
      message: 'Inventory item added successfully', 
      item: newItem 
    });
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

// 9. Reporting and Records
exports.generateEnrollmentReport = async (req, res) => {
  try {
    const { academicYear, class: studentClass, section, gender, status } = req.query;
    
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
    
    res.json(report);
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
    const { academicYear, term, startDate, endDate, class: studentClass } = req.query;
    
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
    
    res.json(report);
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