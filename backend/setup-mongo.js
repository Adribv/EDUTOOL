const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Parent = require('./models/Parent/parentModel');
const Student = require('./models/Student/studentModel');

console.log('🚀 EDULIVES Parent Portal Setup');
console.log('================================\n');

// Check if MongoDB is available
async function checkMongoDB() {
  try {
    // Try to connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/EDULIVES';
    console.log('🔍 Checking MongoDB connection...');
    console.log(`📡 Connection string: ${mongoURI}`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connection successful!\n');
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed!');
    console.log('📋 Please follow these steps to set up MongoDB:\n');
    
    console.log('🔧 Option 1: Install MongoDB Locally');
    console.log('   1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community');
    console.log('   2. Install with default settings');
    console.log('   3. Start MongoDB service: net start MongoDB');
    console.log('   4. Run this script again\n');
    
    console.log('☁️  Option 2: Use MongoDB Atlas (Cloud)');
    console.log('   1. Go to: https://www.mongodb.com/atlas');
    console.log('   2. Create free account and cluster');
    console.log('   3. Get connection string');
    console.log('   4. Create .env file with: MONGO_URI=your_connection_string');
    console.log('   5. Run this script again\n');
    
    console.log('📝 Option 3: Quick Test (No Database)');
    console.log('   - The application will show empty states');
    console.log('   - You can still test the UI and navigation');
    console.log('   - Install MongoDB later to see full functionality\n');
    
    return false;
  }
}

// Create test data
async function createTestData() {
  try {
    console.log('📊 Creating test data...\n');
    
    // Clear existing data
    await Parent.deleteMany({});
    await Student.deleteMany({});
    
    // Create test parent
    const hashedPassword = await bcrypt.hash('password123', 10);
    const parent = new Parent({
      name: 'Test Parent',
      email: 'parent@test.com',
      password: hashedPassword,
      contactNumber: '9876543210',
      address: '123 Test Street, Test City',
      childRollNumbers: []
    });
    
    await parent.save();
    console.log('✅ Created test parent: parent@test.com / password123');
    
    // Create test students
    const students = [
      {
        name: 'John Doe',
        rollNumber: 'TEST001',
        class: '10',
        section: 'A',
        admissionNumber: 'ADM2023001',
        gender: 'Male',
        dateOfBirth: new Date('2008-05-15'),
        parentInfo: {
          fatherName: 'Test Parent',
          motherName: 'Test Mother',
          contactNumber: '9876543210',
          email: 'parent@test.com',
          address: '123 Test Street, Test City'
        }
      },
      {
        name: 'Jane Smith',
        rollNumber: 'TEST002',
        class: '8',
        section: 'B',
        admissionNumber: 'ADM2023002',
        gender: 'Female',
        dateOfBirth: new Date('2010-03-20'),
        parentInfo: {
          fatherName: 'Test Parent',
          motherName: 'Test Mother',
          contactNumber: '9876543210',
          email: 'parent@test.com',
          address: '123 Test Street, Test City'
        }
      }
    ];
    
    for (const studentData of students) {
      const student = new Student(studentData);
      await student.save();
      console.log(`✅ Created test student: ${studentData.name} (${studentData.rollNumber})`);
    }
    
    console.log('\n🎉 Test data created successfully!');
    console.log('\n📱 You can now:');
    console.log('   1. Start the backend: npm start');
    console.log('   2. Start the frontend: npm run dev');
    console.log('   3. Login at: http://localhost:5000/parent/login');
    console.log('   4. Use credentials: parent@test.com / password123');
    console.log('   5. Link students using roll numbers: TEST001, TEST002');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
  }
}

// Main setup function
async function setup() {
  const mongoAvailable = await checkMongoDB();
  
  if (mongoAvailable) {
    await createTestData();
  }
  
  // Always close connection
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
  
  console.log('\n✨ Setup complete!');
}

// Run setup
setup().catch(console.error); 