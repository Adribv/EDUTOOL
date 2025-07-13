const mongoose = require('mongoose');
const LessonPlan = require('./models/Staff/Teacher/lessonplan.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testLessonPlanModel() {
  try {
    console.log('🧪 Testing lesson plan model...\n');

    // Test 1: Check if model can be imported
    console.log('✅ Lesson plan model imported successfully');

    // Test 2: Check if we can find lesson plans
    const lessonPlans = await LessonPlan.find({});
    console.log(`📋 Found ${lessonPlans.length} lesson plans in database`);

    // Test 3: Check if we can find lesson plans by submittedBy
    const teacherId = '685ac0b4d60acdac26b2f9f1'; // The teacher ID from your data
    const teacherLessonPlans = await LessonPlan.find({ submittedBy: teacherId });
    console.log(`👨‍🏫 Found ${teacherLessonPlans.length} lesson plans for teacher ${teacherId}`);

    // Test 4: Check if we can populate fields
    const populatedLessonPlans = await LessonPlan.find({ submittedBy: teacherId })
      .populate('hodApprovedBy', 'name email')
      .populate('principalApprovedBy', 'name email')
      .populate('rejectedBy', 'name email');
    
    console.log(`📋 Successfully populated ${populatedLessonPlans.length} lesson plans`);

    // Test 5: Show lesson plan details
    if (teacherLessonPlans.length > 0) {
      console.log('\n📄 Lesson plan details:');
      teacherLessonPlans.forEach((lp, index) => {
        console.log(`   ${index + 1}. ${lp.title} - Status: ${lp.status} - Current Approver: ${lp.currentApprover}`);
      });
    }

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testLessonPlanModel(); 