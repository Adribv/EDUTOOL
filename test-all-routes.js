const axios = require('axios');

const BASE_URL = 'https://api.edulives.com/api';

// Test configuration
const testConfig = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test data
const testData = {
  teacher: {
    name: 'Test Teacher',
    email: 'test.teacher@school.com',
    phone: '1234567890',
    department: 'Mathematics',
    designation: 'Teacher'
  },
  student: {
    name: 'Test Student',
    email: 'test.student@school.com',
    class: '10',
    section: 'A',
    rollNumber: '1001'
  },
  parent: {
    name: 'Test Parent',
    email: 'test.parent@email.com',
    phone: '9876543210'
  }
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Utility functions
const logTest = (testName, status, message = '') => {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : '❌';
  console.log(`${statusIcon} [${timestamp}] ${testName}: ${status}${message ? ` - ${message}` : ''}`);
  
  if (status === 'PASS') {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.errors.push({ testName, message });
  }
};

const testEndpoint = async (method, endpoint, data = null, expectedStatus = 200) => {
  try {
    const config = {
      ...testConfig,
      method,
      url: `${BASE_URL}${endpoint}`,
      ...(data && { data })
    };
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      logTest(`${method} ${endpoint}`, 'PASS');
      return response.data;
    } else {
      logTest(`${method} ${endpoint}`, 'FAIL', `Expected ${expectedStatus}, got ${response.status}`);
      return null;
    }
  } catch (error) {
    const status = error.response?.status || 'NETWORK_ERROR';
    logTest(`${method} ${endpoint}`, 'FAIL', `${status}: ${error.message}`);
    return null;
  }
};

// Test categories
const testAuthRoutes = async () => {
  console.log('\n🔐 Testing Authentication Routes...');
  
  await testEndpoint('POST', '/auth/login', {
    email: 'admin@school.com',
    password: 'password123'
  });
  
  await testEndpoint('POST', '/auth/register', testData.teacher);
  await testEndpoint('POST', '/auth/student/login', {
    email: 'student@school.com',
    password: 'password123'
  });
  await testEndpoint('POST', '/auth/parent/login', {
    email: 'parent@email.com',
    password: 'password123'
  });
};

const testTeacherRemarksRoutes = async () => {
  console.log('\n📝 Testing Teacher Remarks Routes...');
  
  // Test form creation
  const formData = {
    class: '10',
    section: 'A',
    subject: 'Mathematics',
    unitChapter: 'Algebra',
    startDate: '2024-01-15',
    plannedCompletionDate: '2024-02-15',
    numberOfPeriodsAllotted: 20,
    teachingMethodUsed: 'Interactive',
    academicYear: '2024-2025',
    semester: 'First Term'
  };
  
  await testEndpoint('POST', '/teacher-remarks/admin', formData);
  await testEndpoint('GET', '/teacher-remarks/admin');
  await testEndpoint('GET', '/teacher-remarks/admin/stats');
};

const testSyllabusCompletionRoutes = async () => {
  console.log('\n📚 Testing Syllabus Completion Routes...');
  
  const syllabusData = {
    class: '10',
    section: 'A',
    subject: 'Mathematics',
    unit: 'Algebra',
    startDate: '2024-01-15',
    plannedCompletionDate: '2024-02-15',
    numberOfPeriodsAllotted: 20,
    teachingMethodUsed: 'Interactive',
    academicYear: '2024-2025',
    semester: 'First Term'
  };
  
  await testEndpoint('POST', '/syllabus-completion/admin', syllabusData);
  await testEndpoint('GET', '/syllabus-completion/admin');
  await testEndpoint('GET', '/syllabus-completion/teacher/teacher123');
};

const testDisciplinaryFormRoutes = async () => {
  console.log('\n⚖️ Testing Disciplinary Form Routes...');
  
  const formData = {
    studentName: 'Test Student',
    class: '10',
    section: 'A',
    rollNumber: '1001',
    incidentDate: '2024-01-15',
    incidentDescription: 'Test incident',
    misconductType: ['Disruption'],
    actionTaken: ['Warning']
  };
  
  await testEndpoint('POST', '/disciplinary-forms/teacher', formData);
  await testEndpoint('GET', '/disciplinary-forms/admin');
  await testEndpoint('GET', '/disciplinary-forms/student/student123');
  await testEndpoint('GET', '/disciplinary-forms/parent/parent123');
};

const testConsentFormRoutes = async () => {
  console.log('\n📋 Testing Consent Form Routes...');
  
  const consentData = {
    studentName: 'Test Student',
    class: '10',
    section: 'A',
    eventName: 'School Trip',
    eventDate: '2024-02-15',
    parentName: 'Test Parent',
    parentSignature: 'data:image/png;base64,test'
  };
  
  await testEndpoint('POST', '/consent-forms', consentData);
  await testEndpoint('GET', '/consent-forms');
  await testEndpoint('GET', '/consent-forms/admin');
};

const testTransportFormRoutes = async () => {
  console.log('\n🚌 Testing Transport Form Routes...');
  
  const transportData = {
    studentName: 'Test Student',
    class: '10',
    section: 'A',
    route: 'Route A',
    pickupPoint: 'Home',
    dropPoint: 'School',
    parentName: 'Test Parent',
    parentPhone: '1234567890'
  };
  
  await testEndpoint('POST', '/transport-forms', transportData);
  await testEndpoint('GET', '/transport-forms');
  await testEndpoint('GET', '/transport-forms/admin');
};

const testStaffRoutes = async () => {
  console.log('\n👥 Testing Staff Routes...');
  
  await testEndpoint('GET', '/staffs');
  await testEndpoint('GET', '/teachers');
  await testEndpoint('GET', '/admin-staff');
  await testEndpoint('GET', '/hod');
  await testEndpoint('GET', '/principal');
  await testEndpoint('GET', '/vp');
  await testEndpoint('GET', '/accountant');
};

const testStudentRoutes = async () => {
  console.log('\n🎓 Testing Student Routes...');
  
  await testEndpoint('GET', '/students');
  await testEndpoint('GET', '/students/student123/assignments');
  await testEndpoint('GET', '/students/student123/attendance');
  await testEndpoint('GET', '/students/student123/fees');
  await testEndpoint('GET', '/students/student123/timetable');
};

const testParentRoutes = async () => {
  console.log('\n👨‍👩‍👧‍👦 Testing Parent Routes...');
  
  await testEndpoint('GET', '/parents/parent123/children');
  await testEndpoint('GET', '/parents/parent123/children/child123/progress');
  await testEndpoint('GET', '/parents/parent123/children/child123/fees');
  await testEndpoint('GET', '/parents/parent123/children/child123/assignments');
};

const testHealthCheck = async () => {
  console.log('\n🏥 Testing Health Check...');
  
  try {
    const response = await axios.get('https://api.edulives.com/health', { timeout: 5000 });
    if (response.status === 200) {
      logTest('Health Check', 'PASS');
    } else {
      logTest('Health Check', 'FAIL', `Expected 200, got ${response.status}`);
    }
  } catch (error) {
    logTest('Health Check', 'FAIL', `Server not responding: ${error.message}`);
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive Route Testing...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  try {
    // Test server health first
    await testHealthCheck();
    
    // Test all route categories
    await testAuthRoutes();
    await testTeacherRemarksRoutes();
    await testSyllabusCompletionRoutes();
    await testDisciplinaryFormRoutes();
    await testConsentFormRoutes();
    await testTransportFormRoutes();
    await testStaffRoutes();
    await testStudentRoutes();
    await testParentRoutes();
    
  } catch (error) {
    console.error('❌ Test runner error:', error.message);
  }
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.testName}: ${error.message}`);
    });
  }
  
  console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults }; 