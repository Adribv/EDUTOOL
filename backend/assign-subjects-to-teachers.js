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

const assignSubjectsToTeachers = async () => {
  try {
    console.log('Starting subject assignment...');
    
    // Get all teachers
    const teachers = await Staff.find({ role: 'Teacher' });
    console.log(`Found ${teachers.length} teachers`);
    
    if (teachers.length === 0) {
      console.log('No teachers found. Please create teachers first.');
      return;
    }
    
    // Sample subjects and classes
    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
    const classes = ['Class 10', 'Class 11', 'Class 12'];
    const sections = ['A', 'B', 'C'];
    
    for (const teacher of teachers) {
      console.log(`\nProcessing teacher: ${teacher.name} (${teacher.email})`);
      
      // Assign random subjects and classes
      const assignedSubjects = [];
      const assignedClasses = [];
      
      // Assign 1-2 subjects
      const numSubjects = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numSubjects; i++) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        if (!assignedSubjects.includes(subject)) {
          assignedSubjects.push(subject);
        }
      }
      
      // Assign 1-2 classes with sections
      const numClasses = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numClasses; i++) {
        const className = classes[Math.floor(Math.random() * classes.length)];
        const section = sections[Math.floor(Math.random() * sections.length)];
        assignedClasses.push({
          class: className,
          section: section
        });
      }
      
      // Update teacher with assignments
      await Staff.findByIdAndUpdate(teacher._id, {
        assignedSubjects: assignedSubjects,
        assignedClasses: assignedClasses,
        department: assignedSubjects[0] || 'General' // Use first subject as department
      });
      
      console.log(`  Assigned subjects: ${assignedSubjects.join(', ')}`);
      console.log(`  Assigned classes: ${assignedClasses.map(c => `${c.class}-${c.section}`).join(', ')}`);
    }
    
    console.log('\n✅ Subject assignment completed successfully!');
    
  } catch (error) {
    console.error('Error assigning subjects:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
connectDB().then(() => {
  assignSubjectsToTeachers();
}); 