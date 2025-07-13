const mongoose = require('mongoose');
const LessonPlan = require('./models/Staff/Teacher/lessonplan.model');
const path = require('path');
const fs = require('fs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulives', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function debugLessonPlanPDF() {
  try {
    console.log('🔍 Debugging lesson plan PDF URLs...\n');

    // Find all lesson plans
    const lessonPlans = await LessonPlan.find({})
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${lessonPlans.length} lesson plans in database\n`);

    lessonPlans.forEach((plan, index) => {
      console.log(`📄 Lesson Plan ${index + 1}:`);
      console.log(`   Title: ${plan.title}`);
      console.log(`   Status: ${plan.status}`);
      console.log(`   Class: ${plan.class}-${plan.section}`);
      console.log(`   Subject: ${plan.subject}`);
      console.log(`   Teacher: ${plan.submittedBy?.name || 'Unknown'}`);
      console.log(`   Created: ${plan.createdAt}`);
      console.log(`   PDF URL: ${plan.pdfUrl || 'NOT SET'}`);
      console.log(`   File URL: ${plan.fileUrl || 'NOT SET'}`);
      console.log(`   Video URL: ${plan.videoUrl || 'NOT SET'}`);
      console.log(`   Video Link: ${plan.videoLink || 'NOT SET'}`);
      
      // Check if PDF file exists
      if (plan.pdfUrl) {
        const fullPath = path.join(__dirname, plan.pdfUrl);
        const exists = fs.existsSync(fullPath);
        console.log(`   PDF File Exists: ${exists ? '✅ YES' : '❌ NO'}`);
        console.log(`   Full Path: ${fullPath}`);
        
        if (exists) {
          const stats = fs.statSync(fullPath);
          console.log(`   File Size: ${stats.size} bytes`);
        }
      }
      
      // Check if original file exists
      if (plan.fileUrl) {
        const fullPath = path.join(__dirname, plan.fileUrl);
        const exists = fs.existsSync(fullPath);
        console.log(`   Original File Exists: ${exists ? '✅ YES' : '❌ NO'}`);
        console.log(`   Full Path: ${fullPath}`);
      }
      
      console.log(''); // Empty line for readability
    });

    // Check uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    const lessonPlanDir = path.join(__dirname, 'uploads/lessonPlan');
    
    console.log('📁 Directory Check:');
    console.log(`   Uploads directory exists: ${fs.existsSync(uploadsDir)}`);
    console.log(`   Lesson plan directory exists: ${fs.existsSync(lessonPlanDir)}`);
    
    if (fs.existsSync(lessonPlanDir)) {
      const files = fs.readdirSync(lessonPlanDir);
      console.log(`   Files in lesson plan directory: ${files.length}`);
      files.forEach(file => {
        const filePath = path.join(lessonPlanDir, file);
        const stats = fs.statSync(filePath);
        console.log(`     - ${file} (${stats.size} bytes)`);
      });
    }

    console.log('\n🔗 URL Construction:');
    console.log('   Base URL: http://localhost:5000');
    console.log('   Static files served from: /uploads');
    console.log('   Example: http://localhost:5000/uploads/lessonPlan/filename.pdf');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugLessonPlanPDF(); 