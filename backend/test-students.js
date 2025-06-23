const mongoose = require('mongoose');
const Student = require('./models/Student/studentModel');
const Parent = require('./models/Parent/parentModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testStudents() {
  try {
    console.log('🔍 Testing student data...');
    
    // Get all students
    const students = await Student.find({});
    console.log(`📊 Found ${students.length} students in database`);
    
    if (students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }
    
    // Log first few students
    students.slice(0, 3).forEach((student, index) => {
      console.log(`\n👤 Student ${index + 1}:`);
      console.log('  ID:', student._id);
      console.log('  Name:', student.name);
      console.log('  Roll Number:', student.rollNumber);
      console.log('  Class:', student.class);
      console.log('  Section:', student.section);
      console.log('  Status:', student.status);
      console.log('  All fields:', Object.keys(student.toObject()));
    });
    
    // Get all parents
    const parents = await Parent.find({});
    console.log(`\n👨‍👩‍👧‍👦 Found ${parents.length} parents in database`);
    
    if (parents.length > 0) {
      const parent = parents[0];
      console.log(`\n👨‍👩‍👧‍👦 First parent:`);
      console.log('  ID:', parent._id);
      console.log('  Name:', parent.name);
      console.log('  Email:', parent.email);
      console.log('  Child Roll Numbers:', parent.childRollNumbers);
      
      // Check if parent has linked children
      if (parent.childRollNumbers.length > 0) {
        console.log(`\n🔗 Parent has ${parent.childRollNumbers.length} linked children`);
        for (const rollNumber of parent.childRollNumbers) {
          const child = await Student.findOne({ rollNumber });
          if (child) {
            console.log(`  ✅ Child found: ${child.name} (${rollNumber})`);
          } else {
            console.log(`  ❌ Child not found for roll number: ${rollNumber}`);
          }
        }
      } else {
        console.log('❌ Parent has no linked children');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing students:', error);
  } finally {
    mongoose.connection.close();
  }
}

testStudents(); 