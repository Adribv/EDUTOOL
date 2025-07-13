const mongoose = require('mongoose');
const Student = require('./models/Student/studentModel');
const LessonPlan = require('./models/Staff/Teacher/lessonplan.model');

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

const debugStudentLessonPlans = async () => {
  try {
    console.log('🔍 Debugging student lesson plan visibility...\n');
    
    // Get all students
    const students = await Student.find({});
    console.log(`📚 Found ${students.length} students\n`);
    
    if (students.length === 0) {
      console.log('No students found in the database.');
      return;
    }
    
    // Show student details
    console.log('👥 Students:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email})`);
      console.log(`   Class: ${student.class}, Section: ${student.section}`);
      console.log(`   Roll Number: ${student.rollNumber}`);
      console.log('');
    });
    
    // Get all published lesson plans
    const publishedLessonPlans = await LessonPlan.find({
      status: 'Published',
      isPublished: true
    });
    
    console.log(`📋 Found ${publishedLessonPlans.length} published lesson plans\n`);
    
    if (publishedLessonPlans.length === 0) {
      console.log('No published lesson plans found.');
      return;
    }
    
    // Show lesson plan details
    console.log('📄 Published Lesson Plans:');
    publishedLessonPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.title}`);
      console.log(`   Class: ${plan.class}, Section: ${plan.section}, Subject: ${plan.subject}`);
      console.log(`   Status: ${plan.status}, isPublished: ${plan.isPublished}`);
      console.log(`   Submitted: ${plan.createdAt}`);
      console.log('');
    });
    
    // Check for matches
    console.log('🔍 Checking for matches between students and lesson plans:');
    students.forEach(student => {
      const matchingPlans = publishedLessonPlans.filter(plan => 
        plan.class === student.class && plan.section === student.section
      );
      
      console.log(`\n👤 ${student.name} (${student.class}-${student.section}):`);
      if (matchingPlans.length > 0) {
        console.log(`   ✅ Found ${matchingPlans.length} matching lesson plans:`);
        matchingPlans.forEach(plan => {
          console.log(`      - ${plan.title} (${plan.subject})`);
        });
      } else {
        console.log(`   ❌ No matching lesson plans found`);
        console.log(`   📋 Available lesson plans:`);
        publishedLessonPlans.forEach(plan => {
          console.log(`      - ${plan.title} (${plan.class}-${plan.section}, ${plan.subject})`);
        });
      }
    });
    
  } catch (error) {
    console.error('Error debugging student lesson plans:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
connectDB().then(() => {
  debugStudentLessonPlans();
}); 