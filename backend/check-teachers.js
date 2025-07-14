const mongoose = require('mongoose');

// MongoDB connection
const connectDB = async () => {
  try {
    // Try different connection strings
    const connectionStrings = [
      'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna.uno4ffz.mongodb.net/EDULIVES?retryWrites=true&w=majority',
      'mongodb://localhost:27017/EDULIVES',
      process.env.MONGO_URI
    ];
    
    for (const mongoURI of connectionStrings) {
      if (!mongoURI) continue;
      
      try {
        console.log(`Trying connection: ${mongoURI.substring(0, 50)}...`);
        await mongoose.connect(mongoURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected successfully!');
        return;
      } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        continue;
      }
    }
    
    throw new Error('All connection attempts failed');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkTeachers = async () => {
  try {
    console.log('Checking teachers in database...\n');
    
    // Try to get the Staff model
    let Staff;
    try {
      Staff = require('./models/Staff/staffModel');
    } catch (err) {
      console.log('❌ Could not load Staff model:', err.message);
      return;
    }
    
    // Get all teachers
    const teachers = await Staff.find({ role: 'Teacher' });
    console.log(`Found ${teachers.length} teachers\n`);
    
    if (teachers.length === 0) {
      console.log('No teachers found in the database.');
      console.log('\n💡 To create a teacher:');
      console.log('   1. Go to https://edulives.com/admin/staff');
      console.log('   2. Click "Add Staff"');
      console.log('   3. Fill in the details and set role to "Teacher"');
      console.log('   4. Set Department to a subject name (e.g., "Mathematics")');
      return;
    }
    
    // Show teacher details
    console.log('📋 Current Teachers:');
    teachers.forEach((teacher, index) => {
      console.log(`\n${index + 1}. ${teacher.name} (${teacher.email})`);
      console.log(`   Role: ${teacher.role}`);
      console.log(`   Department: ${teacher.department || 'Not set'}`);
      console.log(`   Assigned Subjects: ${teacher.assignedSubjects ? teacher.assignedSubjects.length : 0}`);
      console.log(`   Assigned Classes: ${teacher.assignedClasses ? teacher.assignedClasses.length : 0}`);
      
      if (teacher.assignedSubjects && teacher.assignedSubjects.length > 0) {
        console.log(`   Subject Details:`);
        teacher.assignedSubjects.forEach(sub => {
          console.log(`     - ${sub.subject} (${sub.class}-${sub.section})`);
        });
      }
      
      if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
        console.log(`   Class Details:`);
        teacher.assignedClasses.forEach(cls => {
          console.log(`     - ${cls.class}-${cls.section}`);
        });
      }
    });
    
    console.log('\n💡 To assign subjects to teachers:');
    console.log('   1. Go to https://edulives.com/admin/staff');
    console.log('   2. Edit a teacher');
    console.log('   3. Set Department to a subject name (e.g., "Mathematics")');
    console.log('   4. Save changes');
    
  } catch (error) {
    console.error('Error checking teachers:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
connectDB().then(() => {
  checkTeachers();
}); 