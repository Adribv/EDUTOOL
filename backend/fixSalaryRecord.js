const mongoose = require('mongoose');
const StaffSalaryRecord = require('./models/Finance/staffSalaryRecordModel');
const Staff = require('./models/Staff/staffModel');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/hope_edu', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Get all salary records
    const salaryRecords = await StaffSalaryRecord.find({});
    console.log(`📊 Found ${salaryRecords.length} salary records to process`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const record of salaryRecords) {
      try {
        // Calculate total allowances
        const allowances = record.allowances || {};
        const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + (val || 0), 0);
        
        // Calculate total deductions
        const deductions = record.deductions || {};
        const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
        
        // Calculate gross and net salary
        const basicSalary = record.basicSalary || 0;
        const grossSalary = basicSalary + totalAllowances;
        const netSalary = grossSalary - totalDeductions;
        
        // Update the record with correct calculations
        await StaffSalaryRecord.findByIdAndUpdate(record._id, {
          grossSalary: grossSalary,
          netSalary: netSalary,
          allowances: allowances,
          deductions: deductions,
          basicSalary: basicSalary
        });
        
        console.log(`✅ Updated record for ${record.staffName} (${record.month} ${record.year}): Gross: ₹${grossSalary}, Net: ₹${netSalary}`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error updating record ${record._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`✅ Successfully updated: ${updatedCount} records`);
    console.log(`❌ Errors: ${errorCount} records`);
    
    // Create sample salary records for staff without any records
    console.log('\n🔧 Creating sample salary records for staff without records...');
    
    const staffMembers = await Staff.find({ status: 'active' });
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    let createdCount = 0;
    
    for (const staff of staffMembers) {
      try {
        // Check if salary record already exists for current month/year
        const existingRecord = await StaffSalaryRecord.findOne({
          staffId: staff._id,
          month: currentMonth,
          year: currentYear
        });
        
        if (existingRecord) {
          console.log(`⏭️  Record already exists for ${staff.name} (${currentMonth} ${currentYear})`);
          continue;
        }
        
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
          case 'VicePrincipal':
            basicSalary = 50000;
            allowances.houseRentAllowance = 9000;
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
          employeeId: staff.employeeId,
          designation: staff.designation || staff.role,
          department: staff.department?.name || '',
          month: currentMonth,
          year: currentYear,
          basicSalary: basicSalary,
          allowances: allowances,
          deductions: deductions,
          grossSalary: grossSalary,
          netSalary: netSalary,
          paymentStatus: 'Pending',
          paymentMethod: 'Bank Transfer',
          status: 'Approved',
          createdBy: staff._id, // Use staff ID as creator
          approvedBy: staff._id, // Use staff ID as approver
          approvedAt: new Date()
        });
        
        await salaryRecord.save();
        console.log(`✅ Created salary record for ${staff.name}: ₹${netSalary}`);
        createdCount++;
        
      } catch (error) {
        console.error(`❌ Error creating record for ${staff.name}:`, error.message);
      }
    }
    
    console.log(`\n📈 Sample Records Summary:`);
    console.log(`✅ Created: ${createdCount} new salary records`);
    
    console.log('\n🎉 Salary record fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during salary record fix:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
}); 