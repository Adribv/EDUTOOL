const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const Department = require('./models/Staff/HOD/department.model');

// MongoDB connection string from dbRetry.js
const MONGODB_URI = 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/EDULIVES?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority';

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check departments
    const departments = await Department.find();
    console.log(`📁 Found ${departments.length} departments:`, departments.map(d => d.name));

    // Check staff members
    const allStaff = await Staff.find();
    console.log(`👥 Found ${allStaff.length} total staff members`);

    const activeStaff = await Staff.find({ status: 'active' });
    console.log(`✅ Found ${activeStaff.length} active staff members`);

    if (activeStaff.length === 0) {
      console.log('⚠️ No active staff members found. Adding some test staff...');
      
      // Add departments if none exist
      if (departments.length === 0) {
        const newDepartments = [
          { name: 'Administration', description: 'Administrative Department' },
          { name: 'Computer Science', description: 'Computer Science Department' },
          { name: 'Mathematics', description: 'Mathematics Department' },
          { name: 'Physics', description: 'Physics Department' }
        ];
        
        const createdDepts = await Department.insertMany(newDepartments);
        console.log('✅ Created departments:', createdDepts.map(d => d.name));
      }

      // Get first department
      const firstDept = await Department.findOne();
      
      // Add some staff members
      const newStaff = [
        {
          name: 'Dr. John Smith',
          email: 'john.smith@university.edu',
          designation: 'Principal',
          role: 'Principal',
          department: firstDept._id,
          status: 'active'
        },
        {
          name: 'Prof. Sarah Johnson',
          email: 'sarah.johnson@university.edu',
          designation: 'Vice Principal',
          role: 'VicePrincipal',
          department: firstDept._id,
          status: 'active'
        },
        {
          name: 'Dr. Michael Brown',
          email: 'michael.brown@university.edu',
          designation: 'Head of Department',
          role: 'HOD',
          department: firstDept._id,
          status: 'active'
        },
        {
          name: 'Prof. Emily Davis',
          email: 'emily.davis@university.edu',
          designation: 'Professor',
          role: 'Teacher',
          department: firstDept._id,
          status: 'active'
        }
      ];

      const createdStaff = await Staff.insertMany(newStaff);
      console.log('✅ Created staff members:', createdStaff.map(s => s.name));
    }

    // Final check
    const finalActiveStaff = await Staff.find({ status: 'active' });
    console.log(`🎯 Final count: ${finalActiveStaff.length} active staff members`);
    console.log('Active staff:', finalActiveStaff.map(s => `${s.name} (${s.designation})`));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkDatabase(); 