const mongoose = require('mongoose');
const Parent = require('./models/Parent/parentModel');
const Student = require('./models/Student/studentModel');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/EDULIVES', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testBackend() {
  try {
    console.log('🧪 Testing Backend Setup...\n');

    // 1. Test Database Connection
    console.log('1. Testing database connection...');
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      console.log('✅ Database connected successfully');
    } else {
      console.log('❌ Database connection failed');
      return;
    }

    // 2. Create test parent
    console.log('\n2. Creating test parent...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testParent = new Parent({
      name: 'John Doe',
      email: 'parent@test.com',
      password: hashedPassword,
      childRollNumbers: ['TEST001', 'TEST002'],
      contactNumber: '9876543210',
      address: '123 Test Street, Test City'
    });

    await testParent.save();
    console.log('✅ Test parent created successfully');
    console.log(`   Email: parent@test.com`);
    console.log(`   Password: password123`);

    // 3. Create test students
    console.log('\n3. Creating test students...');
    
    const testStudent1 = new Student({
      name: 'Alice Doe',
      rollNumber: 'TEST001',
      class: '10',
      section: 'A',
      parentId: testParent._id,
      admissionNumber: 'ADM001',
      gender: 'Female',
      dateOfBirth: new Date('2008-05-15'),
      parentInfo: {
        fatherName: 'John Doe',
        motherName: 'Jane Doe',
        contactNumber: '9876543210',
        email: 'parent@test.com',
        address: '123 Test Street, Test City'
      }
    });

    const testStudent2 = new Student({
      name: 'Bob Doe',
      rollNumber: 'TEST002',
      class: '8',
      section: 'B',
      parentId: testParent._id,
      admissionNumber: 'ADM002',
      gender: 'Male',
      dateOfBirth: new Date('2010-03-20'),
      parentInfo: {
        fatherName: 'John Doe',
        motherName: 'Jane Doe',
        contactNumber: '9876543210',
        email: 'parent@test.com',
        address: '123 Test Street, Test City'
      }
    });

    await Promise.all([testStudent1.save(), testStudent2.save()]);
    console.log('✅ Test students created successfully');

    // 4. Test API endpoints
    console.log('\n4. Testing API endpoints...');
    
    const axios = require('axios');
    const baseURL = 'http://localhost:5000';

    // Test parent login
    try {
      const loginResponse = await axios.post(`${baseURL}/api/parents/login`, {
        email: 'parent@test.com',
        password: 'password123'
      });
      
      console.log('✅ Parent login successful');
      console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
      
      const token = loginResponse.data.token;
      
      // Test getting children
      const childrenResponse = await axios.get(`${baseURL}/api/parents/children`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Get children endpoint working');
      console.log(`   Found ${childrenResponse.data.length} children`);
      
      // Test getting dashboard
      const dashboardResponse = await axios.get(`${baseURL}/api/parents/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Dashboard endpoint working');
      console.log(`   Dashboard data: ${JSON.stringify(dashboardResponse.data, null, 2)}`);
      
    } catch (error) {
      console.log('❌ API test failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Backend test completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Email: parent@test.com');
    console.log('   Password: password123');
    console.log('\n🔗 You can now test the parent portal at: http://localhost:5000/parent');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testBackend(); 