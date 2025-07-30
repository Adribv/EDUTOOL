const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const Department = require('./models/Staff/HOD/department.model');

// MongoDB connection string from dbRetry.js
const MONGODB_URI = 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/EDULIVES?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority';

async function addStaffMembers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if departments exist, if not create them
    let departments = await Department.find();
    if (departments.length === 0) {
      console.log('📁 No departments found, creating departments...');
      const departmentData = [
        { name: 'Computer Science', description: 'Computer Science Department' },
        { name: 'Mathematics', description: 'Mathematics Department' },
        { name: 'Physics', description: 'Physics Department' },
        { name: 'Chemistry', description: 'Chemistry Department' },
        { name: 'Biology', description: 'Biology Department' },
        { name: 'Administration', description: 'Administration Department' }
      ];
      
      departments = await Department.insertMany(departmentData);
      console.log(`✅ Created ${departments.length} departments`);
    } else {
      console.log(`📁 Found ${departments.length} existing departments`);
    }

    // Check if staff members exist
    const existingStaff = await Staff.find();
    console.log(`👥 Found ${existingStaff.length} existing staff members`);

    if (existingStaff.length === 0) {
      console.log('👥 No staff members found, creating staff members...');
      
      // Create staff members with active status
      const staffData = [
        {
          name: 'Dr. John Smith',
          email: 'john.smith@university.edu',
          designation: 'Principal',
          department: departments.find(d => d.name === 'Administration')._id,
          role: 'Principal',
          status: 'active'
        },
        {
          name: 'Prof. Sarah Johnson',
          email: 'sarah.johnson@university.edu',
          designation: 'Vice Principal',
          department: departments.find(d => d.name === 'Administration')._id,
          role: 'VicePrincipal',
          status: 'active'
        },
        {
          name: 'Dr. Michael Brown',
          email: 'michael.brown@university.edu',
          designation: 'Head of Department',
          department: departments.find(d => d.name === 'Computer Science')._id,
          role: 'HOD',
          status: 'active'
        },
        {
          name: 'Prof. Emily Davis',
          email: 'emily.davis@university.edu',
          designation: 'Professor',
          department: departments.find(d => d.name === 'Computer Science')._id,
          role: 'Teacher',
          status: 'active'
        },
        {
          name: 'Dr. Robert Wilson',
          email: 'robert.wilson@university.edu',
          designation: 'Associate Professor',
          department: departments.find(d => d.name === 'Mathematics')._id,
          role: 'Teacher',
          status: 'active'
        },
        {
          name: 'Prof. Lisa Anderson',
          email: 'lisa.anderson@university.edu',
          designation: 'Professor',
          department: departments.find(d => d.name === 'Physics')._id,
          role: 'Teacher',
          status: 'active'
        }
      ];

      const newStaff = await Staff.insertMany(staffData);
      console.log(`✅ Created ${newStaff.length} staff members`);
    } else {
      // Update existing staff to active status if they don't have status
      const staffToUpdate = existingStaff.filter(staff => !staff.status);
      if (staffToUpdate.length > 0) {
        console.log(`🔄 Updating ${staffToUpdate.length} staff members to active status...`);
        await Staff.updateMany(
          { _id: { $in: staffToUpdate.map(s => s._id) } },
          { $set: { status: 'active' } }
        );
        console.log('✅ Updated staff members to active status');
      }
    }

    // Verify the data
    const activeStaff = await Staff.find({ status: 'active' }).populate('department', 'name');
    console.log('\n📋 Active Staff Members:');
    activeStaff.forEach(staff => {
      console.log(`- ${staff.name} (${staff.designation}) - ${staff.department?.name || 'No Department'}`);
    });

    console.log('\n✅ Staff members setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addStaffMembers(); 