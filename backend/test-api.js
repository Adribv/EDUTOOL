const axios = require('axios');

const BASE_URL = 'https://api.edulives.com';
const TEACHER_ID = '685ac0b4d60acdac26b2f9f1'; // From the console log

async function testLeaveRequests() {
  try {
    console.log('Testing leave requests API...');
    
    // Test the leave requests endpoint
    const response = await axios.get(`${BASE_URL}/staffs/${TEACHER_ID}/leave-requests`);
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('Number of leave requests:', response.data.length);
    
    if (response.data.length > 0) {
      response.data.forEach((request, index) => {
        console.log(`\nLeave Request ${index + 1}:`);
        console.log(`- Student: ${request.studentId?.name || 'Unknown'}`);
        console.log(`- Class: ${request.studentId?.class || 'N/A'}${request.studentId?.section || 'N/A'}`);
        console.log(`- Status: ${request.status}`);
        console.log(`- Type: ${request.type}`);
        console.log(`- Reason: ${request.reason}`);
      });
    } else {
      console.log('No leave requests found');
    }
    
  } catch (error) {
    console.error('Error testing API:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('Teacher not found or no coordinated classes');
    } else if (error.response?.status === 500) {
      console.log('Server error - check backend logs');
    }
  }
}

// Run the test
testLeaveRequests(); 