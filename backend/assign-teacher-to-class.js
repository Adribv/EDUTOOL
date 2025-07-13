const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna.uno4ffz.mongodb.net/EDULIVES?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const assignTeacherToClass = async () => {
  try {
    console.log('Assigning teacher to class...\n');
    
    // Get all teachers
    const teachers = await Staff.find({ role: 'Teacher' });
    console.log(`Found ${teachers.length} teachers\n`);
    
    if (teachers.length === 0) {
      console.log('No teachers found in the database.');
      return;
    }
    
    // Show available teachers
    console.log('Available teachers:');
    teachers.forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.name} (${teacher.email})`);
    });
    
    // For this example, let's assign the first teacher to Class 10-A with Mathematics
    const teacher = teachers[0];
    if (!teacher) {
      console.log('No teacher found to assign.');
      return;
    }
    
    console.log(`\nAssigning teacher: ${teacher.name} to Class 10-A with Mathematics`);
    
    // Update teacher with assignments
    await Staff.findByIdAndUpdate(teacher._id, {
      assignedSubjects: [
        {
          class: 'Class 10',
          section: 'A',
          subject: 'Mathematics'
        }
      ],
      assignedClasses: [
        {
          class: 'Class 10',
          section: 'A'
        }
      ],
      department: 'Mathematics' // Use as subject when no specific assignments
    });
    
    console.log('✅ Teacher assigned successfully!');
    console.log(`   Teacher: ${teacher.name}`);
    console.log(`   Class: Class 10-A`);
    console.log(`   Subject: Mathematics`);
    console.log(`   Department: Mathematics`);
    
    console.log('\n🎯 The teacher can now:');
    console.log('   1. Create lesson plans for Class 10-A Mathematics');
    console.log('   2. Submit them for HOD approval');
    console.log('   3. Have them published to students after Principal approval');
    
  } catch (error) {
    console.error('Error assigning teacher:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
connectDB().then(() => {
  assignTeacherToClass();
}); 