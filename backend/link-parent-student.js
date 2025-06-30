const mongoose = require('mongoose');
const Parent = require('./models/Parent/parentModel');
const Student = require('./models/Student/studentModel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Find or create a parent
    let parent = await Parent.findOne();
    
    if (!parent) {
      console.log('No parent found. Creating a sample parent...');
      parent = new Parent({
        name: 'Sample Parent',
        email: 'parent@example.com',
        password: 'password123',
        contactNumber: '9876543210',
        childRollNumbers: []
      });
      await parent.save();
      console.log('Created sample parent');
    }

    console.log('Using parent:', parent.name, 'ID:', parent._id);

    // Find student with roll number 340
    let student = await Student.findOne({ rollNumber: '340' });
    
    if (!student) {
      console.log('Student with roll number 340 not found. Creating sample student...');
      student = new Student({
        name: 'Sample Student 340',
        rollNumber: '340',
        class: '10',
        section: 'A',
        email: 'student340@example.com',
        contactNumber: '9876543210',
        status: 'Active'
      });
      await student.save();
      console.log('Created sample student with roll number 340');
    }

    console.log('Found student:', student.name, 'Roll Number:', student.rollNumber);

    // Check if already linked
    if (parent.childRollNumbers.includes('340')) {
      console.log('Student 340 is already linked to this parent');
    } else {
      // Link the student to the parent
      parent.childRollNumbers.push('340');
      await parent.save();
      console.log('Successfully linked student 340 to parent');
    }

    // Verify the link
    const updatedParent = await Parent.findById(parent._id);
    console.log('Parent child roll numbers:', updatedParent.childRollNumbers);

    console.log('Parent-student linking completed successfully!');
    console.log('You can now test the parent attendance functionality with:');
    console.log('- Parent email: parent@example.com');
    console.log('- Student roll number: 340');
    
    process.exit(0);

  } catch (error) {
    console.error('Error linking parent to student:', error);
    process.exit(1);
  }
}); 