const mongoose = require('mongoose');
const StaffSalaryRecord = require('./models/Finance/staffSalaryRecordModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edutool')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if data already exists
      const count = await StaffSalaryRecord.countDocuments();
      console.log('Current salary records count:', count);
      
      if (count === 0) {
        console.log('No salary records found. Creating sample data...');
        
        const sampleData = [
          {
            staffId: '6841a1f150b446b78c1da7f5',
            staffName: 'Gokulpriyan Karthikeyan',
            employeeId: 'EMP1750772396534567',
            designation: 'HOD',
            department: 'Computer Science',
            month: 'July',
            year: 2025,
            basicSalary: 10000,
            allowances: {
              houseRentAllowance: 5000,
              dearnessAllowance: 2000,
              transportAllowance: 1500,
              medicalAllowance: 1000,
              otherAllowances: 500
            },
            deductions: {
              providentFund: 1200,
              tax: 800,
              insurance: 300,
              otherDeductions: 200
            },
            grossSalary: 20000,
            netSalary: 17500,
            paymentStatus: 'Paid',
            paymentMethod: 'Bank Transfer',
            remarks: 'Salary processed successfully',
            status: 'Approved',
            createdBy: '685abc35d60acdac26b2f9c3',
            approvedBy: '685abc35d60acdac26b2f9c3',
            approvedAt: new Date('2025-07-13T15:20:29.217Z'),
            attendance: {
              totalDays: 22,
              presentDays: 20,
              absentDays: 1,
              leaveDays: 1
            },
            performance: {
              rating: 5,
              comments: 'Excellent performance this month'
            },
            bankDetails: {
              accountNumber: '1234567890',
              bankName: 'State Bank of India',
              ifscCode: 'SBIN0001234',
              branch: 'Main Branch'
            }
          },
          {
            staffId: '6841a1f150b446b78c1da7f5',
            staffName: 'Gokulpriyan Karthikeyan',
            employeeId: 'EMP1750772396534567',
            designation: 'HOD',
            department: 'Computer Science',
            month: 'June',
            year: 2025,
            basicSalary: 10000,
            allowances: {
              houseRentAllowance: 5000,
              dearnessAllowance: 2000,
              transportAllowance: 1500,
              medicalAllowance: 1000,
              otherAllowances: 500
            },
            deductions: {
              providentFund: 1200,
              tax: 800,
              insurance: 300,
              otherDeductions: 200
            },
            grossSalary: 20000,
            netSalary: 17500,
            paymentStatus: 'Paid',
            paymentMethod: 'Bank Transfer',
            remarks: 'Salary processed successfully',
            status: 'Approved',
            createdBy: '685abc35d60acdac26b2f9c3',
            approvedBy: '685abc35d60acdac26b2f9c3',
            approvedAt: new Date('2025-06-13T15:20:29.217Z'),
            attendance: {
              totalDays: 21,
              presentDays: 19,
              absentDays: 1,
              leaveDays: 1
            },
            performance: {
              rating: 4,
              comments: 'Good performance this month'
            },
            bankDetails: {
              accountNumber: '1234567890',
              bankName: 'State Bank of India',
              ifscCode: 'SBIN0001234',
              branch: 'Main Branch'
            }
          },
          {
            staffId: '6841a1f150b446b78c1da7f5',
            staffName: 'Gokulpriyan Karthikeyan',
            employeeId: 'EMP1750772396534567',
            designation: 'HOD',
            department: 'Computer Science',
            month: 'May',
            year: 2025,
            basicSalary: 10000,
            allowances: {
              houseRentAllowance: 5000,
              dearnessAllowance: 2000,
              transportAllowance: 1500,
              medicalAllowance: 1000,
              otherAllowances: 500
            },
            deductions: {
              providentFund: 1200,
              tax: 800,
              insurance: 300,
              otherDeductions: 200
            },
            grossSalary: 20000,
            netSalary: 17500,
            paymentStatus: 'Paid',
            paymentMethod: 'Bank Transfer',
            remarks: 'Salary processed successfully',
            status: 'Approved',
            createdBy: '685abc35d60acdac26b2f9c3',
            approvedBy: '685abc35d60acdac26b2f9c3',
            approvedAt: new Date('2025-05-13T15:20:29.217Z'),
            attendance: {
              totalDays: 23,
              presentDays: 22,
              absentDays: 0,
              leaveDays: 1
            },
            performance: {
              rating: 5,
              comments: 'Outstanding performance this month'
            },
            bankDetails: {
              accountNumber: '1234567890',
              bankName: 'State Bank of India',
              ifscCode: 'SBIN0001234',
              branch: 'Main Branch'
            }
          }
        ];
        
        await StaffSalaryRecord.insertMany(sampleData);
        console.log('Sample salary data created successfully!');
      } else {
        console.log('Salary records data already exists.');
      }
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.connection.close();
      console.log('Database connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 