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

const checkTeacherAssignments = async () => {
  try {
    console.log('Checking teacher assignments...\n');
    
    // Get all teachers
    const teachers = await Staff.find({ role: 'Teacher' });
    console.log(`Found ${teachers.length} teachers\n`);
    
    if (teachers.length === 0) {
      console.log('No teachers found in the database.');
      return;
    }
    
    for (const teacher of teachers) {
      console.log(`Teacher: ${teacher.name} (${teacher.email})`);
      console.log(`  Department: ${teacher.department || 'Not set'}`);
      console.log(`  Assigned Subjects: ${teacher.assignedSubjects ? teacher.assignedSubjects.join(', ') : 'None'}`);
      console.log(`  Assigned Classes: ${teacher.assignedClasses ? teacher.assignedClasses.map(c => `${c.class}-${c.section}`).join(', ') : 'None'}`);
      console.log(`  Can create lesson plans: ${(teacher.assignedSubjects && teacher.assignedSubjects.length > 0) || teacher.department ? 'Yes' : 'No'}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Error checking teacher assignments:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
connectDB().then(() => {
  checkTeacherAssignments();
}); 