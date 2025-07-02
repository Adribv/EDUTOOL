const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');
const Class = require('./models/Admin/classModel');
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
    const teacherId = '685ac0b4d60acdac26b2f9f1';
    console.log('Updating teacher with ID:', teacherId);
    
    // Find or create class 10C
    let class10C = await Class.findOne({ grade: '10', section: 'C' });
    if (!class10C) {
      console.log('Creating class 10C...');
      class10C = new Class({
        name: 'Class 10C',
        grade: '10',
        section: 'C',
        capacity: 40,
        description: 'Class 10 Section C'
      });
      await class10C.save();
      console.log('✅ Created class 10C with ID:', class10C._id);
    } else {
      console.log('✅ Found existing class 10C with ID:', class10C._id);
    }
    
    // Update teacher to coordinate class 10C
    const teacher = await Staff.findById(teacherId);
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }
    
    console.log('✅ Found teacher:', teacher.name);
    console.log('Current coordinator assignments:', teacher.coordinator);
    
    // Update coordinator assignment to class 10C
    teacher.coordinator = [class10C._id];
    await teacher.save();
    
    console.log('✅ Updated teacher coordinator assignment to class 10C');
    console.log('New coordinator assignments:', teacher.coordinator);
    
    console.log('\n🎉 Teacher now coordinates class 10C and should see VP exams for grade 10!');
    
  } catch (error) {
    console.error('Error updating teacher assignment:', error);
  } finally {
    mongoose.connection.close();
  }
}); 