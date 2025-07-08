const axios = require('axios');

async function testMCQAPI() {
  const baseURL = 'http://localhost:5000';
  
  try {
    console.log('Testing MCQ API endpoints...\n');
    
    // Test student MCQ assignments endpoint
    console.log('1. Testing /api/students/mcq-assignments...');
    try {
      const studentResponse = await axios.get(`${baseURL}/api/students/mcq-assignments`);
      console.log('✅ Student endpoint working');
      console.log('Response data:', studentResponse.data);
    } catch (error) {
      console.log('❌ Student endpoint failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    console.log('\n2. Testing /api/teachers/mcq-assignments...');
    try {
      const teacherResponse = await axios.get(`${baseURL}/api/teachers/mcq-assignments`);
      console.log('✅ Teacher endpoint working');
      console.log('Response data:', teacherResponse.data);
    } catch (error) {
      console.log('❌ Teacher endpoint failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testMCQAPI(); 