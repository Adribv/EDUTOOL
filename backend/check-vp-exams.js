const mongoose = require('mongoose');
const VPExam = require('./models/Staff/HOD/examPaper.model');
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
    // Check all VP exams
    const allVpExams = await VPExam.find({});
    console.log(`\n📊 Total VP exams in database: ${allVpExams.length}`);
    
    if (allVpExams.length === 0) {
      console.log('❌ No VP exams found in database');
      return;
    }
    
    console.log('\n📋 All VP exams:');
    allVpExams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.subject} - ${exam.examType}`);
      console.log(`   Class: ${exam.class}, Section: ${exam.section || 'N/A'}`);
      console.log(`   Status: ${exam.status}`);
      console.log(`   Date: ${exam.examDate}`);
      console.log(`   Created by: ${exam.createdBy}`);
      console.log('---');
    });
    
    // Check exams by status
    const approvedExams = await VPExam.find({ status: 'Approved' });
    const publishedExams = await VPExam.find({ status: 'Published' });
    const pendingExams = await VPExam.find({ status: 'Pending' });
    
    console.log('\n📈 Exams by status:');
    console.log(`✅ Approved: ${approvedExams.length}`);
    console.log(`📢 Published: ${publishedExams.length}`);
    console.log(`⏳ Pending: ${pendingExams.length}`);
    
    // Check exams by grade
    const grade10Exams = await VPExam.find({ class: '10' });
    const grade12Exams = await VPExam.find({ class: '12' });
    
    console.log('\n📚 Exams by grade:');
    console.log(`Grade 10: ${grade10Exams.length}`);
    console.log(`Grade 12: ${grade12Exams.length}`);
    
  } catch (error) {
    console.error('Error checking VP exams:', error);
  } finally {
    mongoose.connection.close();
  }
}); 