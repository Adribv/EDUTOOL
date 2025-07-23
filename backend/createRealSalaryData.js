const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const StaffSalaryRecord = require('./models/Finance/staffSalaryRecordModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edutool')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get existing staff members
      const staffMembers = await Staff.find({}).select('_id name employeeId role designation department');
      console.log(`Found ${staffMembers.length} staff members`);
      
      if (staffMembers.length === 0) {
        console.log('No staff members found. Please create staff members first.');
        return;
      }
      
      // Check if salary records already exist
      const existingRecords = await StaffSalaryRecord.countDocuments();
      console.log('Current salary records count:', existingRecords);
      
      if (existingRecords > 0) {
        console.log('Salary records already exist. Skipping creation.');
        return;
      }
      
      console.log('Creating salary records for existing staff members...');
      
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
      const currentYear = currentDate.getFullYear();
      
      // Create salary records for each staff member for the current month
      for (const staff of staffMembers) {
        try {
          // Generate realistic salary data based on role
          let basicSalary = 25000; // Default
          let allowances = {
            houseRentAllowance: 5000,
            dearnessAllowance: 2000,
            transportAllowance: 1500,
            medicalAllowance: 1000,
            otherAllowances: 500
          };
          
          // Adjust salary based on role
          switch (staff.role) {
            case 'Teacher':
              basicSalary = 30000;
              break;
            case 'HOD':
              basicSalary = 45000;
              allowances.houseRentAllowance = 8000;
              break;
            case 'Principal':
              basicSalary = 60000;
              allowances.houseRentAllowance = 10000;
              allowances.dearnessAllowance = 3000;
              break;
            case 'Accountant':
              basicSalary = 35000;
              break;
            case 'AdminStaff':
              basicSalary = 28000;
              break;
            default:
              basicSalary = 25000;
          }
          
          const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
          const deductions = {
            providentFund: Math.round(basicSalary * 0.12),
            tax: Math.round(basicSalary * 0.08),
            insurance: 300,
            otherDeductions: 200
          };
          const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
          const grossSalary = basicSalary + totalAllowances;
          const netSalary = grossSalary - totalDeductions;
          
          const salaryRecord = new StaffSalaryRecord({
            staffId: staff._id,
            staffName: staff.name,
            employeeId: staff.employeeId || `EMP${Date.now()}`,
            designation: staff.designation || staff.role,
            department: staff.department?.name || 'General',
            month: currentMonth,
            year: currentYear,
            basicSalary,
            allowances,
            deductions,
            grossSalary,
            netSalary,
            paymentStatus: 'Paid',
            paymentMethod: 'Bank Transfer',
            remarks: 'Salary processed successfully',
            status: 'Approved',
            createdBy: staff._id, // Using staff as creator for demo
            approvedBy: staff._id,
            approvedAt: new Date(),
            attendance: {
              totalDays: 22,
              presentDays: 20,
              absentDays: 1,
              leaveDays: 1
            },
            performance: {
              rating: 4,
              comments: 'Good performance this month'
            },
            bankDetails: {
              accountNumber: '',
              bankName: '',
              ifscCode: '',
              branch: ''
            }
          });
          
          await salaryRecord.save();
          console.log(`Created salary record for ${staff.name} (${staff.role})`);
          
        } catch (error) {
          console.error(`Error creating salary record for ${staff.name}:`, error.message);
        }
      }
      
      console.log('Salary records creation completed!');
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 