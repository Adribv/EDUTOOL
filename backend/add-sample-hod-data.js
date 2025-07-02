const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const Department = require('./models/Staff/HOD/department.model');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addSampleHODData = async () => {
  try {
    console.log('🚀 Starting to add sample HOD data...');

    // Clear existing departments
    await Department.deleteMany({});
    console.log('🧹 Cleared existing departments');

    // Create sample HOD users
    const hodUsers = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'hod.science@school.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'HOD',
        qualification: 'Ph.D. in Physics',
        experience: '15 years',
        status: 'active',
        employeeId: 'HOD-SCI-001'
      },
      {
        name: 'Prof. Michael Chen',
        email: 'hod.maths@school.com',
        password: 'password123',
        phone: '+1234567891',
        role: 'HOD',
        qualification: 'M.Sc. in Mathematics',
        experience: '12 years',
        status: 'active',
        employeeId: 'HOD-MATH-001'
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'hod.english@school.com',
        password: 'password123',
        phone: '+1234567892',
        role: 'HOD',
        qualification: 'Ph.D. in English Literature',
        experience: '10 years',
        status: 'active',
        employeeId: 'HOD-ENG-001'
      }
    ];

    // Hash passwords and create HOD users
    const createdHODs = [];
    for (const hodData of hodUsers) {
      const hashedPassword = await bcrypt.hash(hodData.password, 10);
      const hod = new Staff({
        ...hodData,
        password: hashedPassword
      });
      await hod.save();
      createdHODs.push(hod);
      console.log(`✅ Created HOD: ${hod.name} (${hod.email})`);
    }

    // Create sample departments
    const departments = [
      {
        name: 'Science Department',
        description: 'Department of Physics, Chemistry, and Biology',
        subjects: ['Physics', 'Chemistry', 'Biology'],
        headOfDepartment: createdHODs[0]._id,
        teachers: [],
        email: 'science@school.com'
      },
      {
        name: 'Mathematics Department',
        description: 'Department of Mathematics and Computer Science',
        subjects: ['Mathematics', 'Computer Science'],
        headOfDepartment: createdHODs[1]._id,
        teachers: [],
        email: 'mathematics@school.com'
      },
      {
        name: 'English Department',
        description: 'Department of English Literature and Language',
        subjects: ['English'],
        headOfDepartment: createdHODs[2]._id,
        teachers: [],
        email: 'english@school.com'
      }
    ];

    // Create departments
    const createdDepartments = [];
    for (const deptData of departments) {
      const department = new Department(deptData);
      await department.save();
      createdDepartments.push(department);
      console.log(`✅ Created Department: ${department.name}`);
    }

    // Create some sample teachers for each department
    const teachers = [
      {
        name: 'John Smith',
        email: 'john.smith@school.com',
        password: 'password123',
        phone: '+1234567893',
        role: 'Teacher',
        qualification: 'M.Sc. in Physics',
        experience: '8 years',
        status: 'active',
        employeeId: 'TCH-PHY-001',
        department: createdDepartments[0]._id
      },
      {
        name: 'Lisa Wang',
        email: 'lisa.wang@school.com',
        password: 'password123',
        phone: '+1234567894',
        role: 'Teacher',
        qualification: 'M.Sc. in Chemistry',
        experience: '6 years',
        status: 'active',
        employeeId: 'TCH-CHEM-001',
        department: createdDepartments[0]._id
      },
      {
        name: 'David Brown',
        email: 'david.brown@school.com',
        password: 'password123',
        phone: '+1234567895',
        role: 'Teacher',
        qualification: 'M.Sc. in Mathematics',
        experience: '9 years',
        status: 'active',
        employeeId: 'TCH-MATH-001',
        department: createdDepartments[1]._id
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@school.com',
        password: 'password123',
        phone: '+1234567896',
        role: 'Teacher',
        qualification: 'M.A. in English',
        experience: '7 years',
        status: 'active',
        employeeId: 'TCH-ENG-001',
        department: createdDepartments[2]._id
      }
    ];

    // Create teachers
    const createdTeachers = [];
    for (const teacherData of teachers) {
      const hashedPassword = await bcrypt.hash(teacherData.password, 10);
      const teacher = new Staff({
        ...teacherData,
        password: hashedPassword
      });
      await teacher.save();
      createdTeachers.push(teacher);
      console.log(`✅ Created Teacher: ${teacher.name} (${teacher.email})`);
    }

    // Update departments with teachers
    await Department.findByIdAndUpdate(createdDepartments[0]._id, {
      teachers: [createdTeachers[0]._id, createdTeachers[1]._id]
    });
    await Department.findByIdAndUpdate(createdDepartments[1]._id, {
      teachers: [createdTeachers[2]._id]
    });
    await Department.findByIdAndUpdate(createdDepartments[2]._id, {
      teachers: [createdTeachers[3]._id]
    });

    console.log('🎉 Sample HOD data added successfully!');

    console.log('\n📊 Summary:');
    console.log(`HODs created: ${createdHODs.length}`);
    console.log(`Departments created: ${createdDepartments.length}`);
    console.log(`Teachers created: ${createdTeachers.length}`);

    console.log('\n🔑 Login Credentials:');
    createdHODs.forEach(hod => {
      console.log(`HOD: ${hod.email} / password123`);
    });

  } catch (error) {
    console.error('❌ Error adding sample HOD data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addSampleHODData(); 