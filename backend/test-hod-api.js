const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testHODAPI() {
  try {
    console.log('Testing HOD API endpoints...');
    
    // Test department statistics endpoint
    console.log('\n1. Testing department statistics...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/hod/department/statistics`);
      console.log('✅ Department statistics:', statsResponse.data);
    } catch (error) {
      console.log('❌ Department statistics failed:', error.response?.data || error.message);
    }
    
    // Test teacher management endpoint
    console.log('\n2. Testing teacher management...');
    try {
      const teachersResponse = await axios.get(`${BASE_URL}/hod/teacher-management/teachers`);
      console.log('✅ Teacher management:', teachersResponse.data);
    } catch (error) {
      console.log('❌ Teacher management failed:', error.response?.data || error.message);
    }
    
    // Test teacher attendance endpoint
    console.log('\n3. Testing teacher attendance...');
    try {
      const attendanceResponse = await axios.get(`${BASE_URL}/hod/teacher-attendance`);
      console.log('✅ Teacher attendance:', attendanceResponse.data);
    } catch (error) {
      console.log('❌ Teacher attendance failed:', error.response?.data || error.message);
    }
    
    console.log('\nAPI test completed!');
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testHODAPI(); 