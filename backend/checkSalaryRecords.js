const mongoose = require('mongoose');
const StaffSalaryRecord = require('./models/Finance/staffSalaryRecordModel');
const Staff = require('./models/Staff/staffModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edutool')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check salary records
      const salaryCount = await StaffSalaryRecord.countDocuments();
      console.log('Salary records count:', salaryCount);
      
      if (salaryCount > 0) {
        const salaryRecords = await StaffSalaryRecord.find().limit(5);
        console.log('Sample salary records:');
        salaryRecords.forEach(record => {
          console.log(`- ${record.staffName} (${record.employeeId}): ₹${record.netSalary} - ${record.paymentStatus}`);
        });
      }
      
      // Check staff records
      const staffCount = await Staff.countDocuments();
      console.log('Staff records count:', staffCount);
      
      if (staffCount > 0) {
        const staffRecords = await Staff.find().limit(5);
        console.log('Sample staff records:');
        staffRecords.forEach(staff => {
          console.log(`- ${staff.name} (${staff.employeeId || 'No ID'}): ${staff.role}`);
        });
      }
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 