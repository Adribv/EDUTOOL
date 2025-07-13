const mongoose = require('mongoose');
const LessonPlan = require('./models/Staff/Teacher/lessonplan.model');

// Connect to MongoDB Atlas
const mongoURI = 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna.uno4ffz.mongodb.net/EDULIVES?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
  heartbeatFrequencyMS: 10000,
  bufferCommands: true,
});

async function debugLessonPlanUploads() {
  try {
    console.log('🔍 Debugging lesson plan uploads...');
    
    // Get all lesson plans
    const allLessonPlans = await LessonPlan.find({}).populate('submittedBy', 'name email');
    
    console.log(`📋 Total lesson plans found: ${allLessonPlans.length}`);
    
    if (allLessonPlans.length === 0) {
      console.log('❌ No lesson plans found in database');
      return;
    }
    
    // Display each lesson plan with file information
    allLessonPlans.forEach((plan, index) => {
      console.log(`\n📄 Lesson Plan ${index + 1}:`);
      console.log(`   Title: ${plan.title}`);
      console.log(`   Description: ${plan.description}`);
      console.log(`   Class: ${plan.class}`);
      console.log(`   Section: ${plan.section}`);
      console.log(`   Subject: ${plan.subject}`);
      console.log(`   Status: ${plan.status}`);
      console.log(`   Submitted By: ${plan.submittedBy?.name || 'Unknown'}`);
      console.log(`   Created At: ${plan.createdAt}`);
      console.log(`   File URL: ${plan.fileUrl || 'NOT SET'}`);
      console.log(`   PDF URL: ${plan.pdfUrl || 'NOT SET'}`);
      console.log(`   Video URL: ${plan.videoUrl || 'NOT SET'}`);
      console.log(`   Video Link: ${plan.videoLink || 'NOT SET'}`);
      console.log(`   Is Published: ${plan.isPublished}`);
      console.log(`   Current Approver: ${plan.currentApprover}`);
      
      if (plan.hodApprovedAt) {
        console.log(`   HOD Approved At: ${plan.hodApprovedAt}`);
      }
      if (plan.principalApprovedAt) {
        console.log(`   Principal Approved At: ${plan.principalApprovedAt}`);
      }
    });
    
    // Check for lesson plans with missing file URLs
    const plansWithoutFiles = allLessonPlans.filter(plan => !plan.fileUrl && !plan.pdfUrl);
    console.log(`\n⚠️  Lesson plans without files: ${plansWithoutFiles.length}`);
    
    if (plansWithoutFiles.length > 0) {
      console.log('Lesson plans missing file URLs:');
      plansWithoutFiles.forEach(plan => {
        console.log(`   - ${plan.title} (ID: ${plan._id})`);
      });
    }
    
    // Check for lesson plans with files
    const plansWithFiles = allLessonPlans.filter(plan => plan.fileUrl || plan.pdfUrl);
    console.log(`\n✅ Lesson plans with files: ${plansWithFiles.length}`);
    
    if (plansWithFiles.length > 0) {
      console.log('Lesson plans with file URLs:');
      plansWithFiles.forEach(plan => {
        console.log(`   - ${plan.title}: fileUrl=${plan.fileUrl}, pdfUrl=${plan.pdfUrl}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging lesson plans:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the debug
debugLessonPlanUploads(); 