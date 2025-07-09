const axios = require('axios');

const BASE_URL = 'https://api.edulives.com';

// Sample data
const sampleData = {
  teachers: [
    {
      name: 'Mr. John Smith',
      email: 'john.smith@school.com',
      password: 'password123',
      role: 'Teacher',
      department: 'Mathematics',
      phone: '1234567890'
    },
    {
      name: 'Ms. Jane Doe',
      email: 'jane.doe@school.com',
      password: 'password123',
      role: 'Teacher',
      department: 'Science',
      phone: '1234567891'
    }
  ],
  students: [
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@student.com',
      password: 'password123',
      studentId: 'STU001',
      rollNumber: '001',
      class: '10',
      section: 'A'
    },
    {
      name: 'Bob Smith',
      email: 'bob.smith@student.com',
      password: 'password123',
      studentId: 'STU002',
      rollNumber: '002',
      class: '10',
      section: 'A'
    }
  ],
  leaveRequests: [
    {
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      reason: 'Medical appointment',
      type: 'Medical'
    },
    {
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      reason: 'Family function',
      type: 'Personal'
    }
  ]
};

async function setupData() {
  try {
    console.log('Setting up teacher coordination data...');

    // Step 1: Create teachers
    console.log('\n1. Creating teachers...');
    const teacherIds = [];
    for (const teacher of sampleData.teachers) {
      try {
        const response = await axios.post(`${BASE_URL}/staffs/register`, teacher);
        console.log(`Created teacher: ${teacher.name}`);
        teacherIds.push(response.data.staff._id);
      } catch (error) {
        if (error.response?.status === 409) {
          // Teacher already exists, try to login to get ID
          const loginResponse = await axios.post(`${BASE_URL}/staffs/login`, {
            email: teacher.email,
            password: teacher.password
          });
          teacherIds.push(loginResponse.data.staff._id);
          console.log(`Found existing teacher: ${teacher.name}`);
        } else {
          console.error(`Error creating teacher ${teacher.name}:`, error.response?.data || error.message);
        }
      }
    }

    // Step 2: Create students
    console.log('\n2. Creating students...');
    const studentIds = [];
    for (const student of sampleData.students) {
      try {
        const response = await axios.post(`${BASE_URL}/students/register`, student);
        console.log(`Created student: ${student.name}`);
        studentIds.push(response.data.student._id);
      } catch (error) {
        if (error.response?.status === 409) {
          // Student already exists, try to login to get ID
          const loginResponse = await axios.post(`${BASE_URL}/students/login`, {
            email: student.email,
            password: student.password
          });
          studentIds.push(loginResponse.data.student._id);
          console.log(`Found existing student: ${student.name}`);
        } else {
          console.error(`Error creating student ${student.name}:`, error.response?.data || error.message);
        }
      }
    }

    // Step 3: Create leave requests
    console.log('\n3. Creating leave requests...');
    for (let i = 0; i < sampleData.leaveRequests.length && i < studentIds.length; i++) {
      try {
        const leaveRequest = {
          ...sampleData.leaveRequests[i],
          studentId: studentIds[i]
        };
        
        const response = await axios.post(`${BASE_URL}/students/leave-requests`, leaveRequest, {
          headers: {
            'Authorization': `Bearer ${getStudentToken(studentIds[i])}`
          }
        });
        console.log(`Created leave request for student ${i + 1}`);
      } catch (error) {
        console.error(`Error creating leave request ${i + 1}:`, error.response?.data || error.message);
      }
    }

    console.log('\nSetup completed!');
    console.log('\nTeacher login credentials:');
    sampleData.teachers.forEach((teacher, index) => {
      console.log(`${index + 1}. Email: ${teacher.email}`);
      console.log(`   Password: ${teacher.password}`);
    });

    console.log('\nStudent login credentials:');
    sampleData.students.forEach((student, index) => {
      console.log(`${index + 1}. Email: ${student.email}`);
      console.log(`   Password: ${student.password}`);
    });

  } catch (error) {
    console.error('Setup failed:', error.message);
  }
}

// Helper function to get student token (you'll need to implement this based on your auth system)
function getStudentToken(studentId) {
  // This is a placeholder - you'll need to implement proper authentication
  return 'dummy-token';
}

// Run the setup
setupData(); 