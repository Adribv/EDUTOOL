const mongoose = require('mongoose');
const LessonPlan = require('./models/Staff/Teacher/lessonplan.model');
const Department = require('./models/Staff/HOD/department.model');
const Staff = require('./models/Staff/staffModel');
const Student = require('./models/Student/studentModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Testing complete lesson plan workflow...\n');

    // 1. Check existing lesson plans
    const existingLessonPlans = await LessonPlan.find({});
    console.log(`📋 Found ${existingLessonPlans.length} existing lesson plans`);

    if (existingLessonPlans.length === 0) {
      console.log('❌ No lesson plans found. Please submit a lesson plan first.');
      return;
    }

    // 2. Check the first lesson plan
    const lessonPlan = existingLessonPlans[0];
    console.log(`📄 Testing lesson plan: ${lessonPlan.title}`);
    console.log(`   Status: ${lessonPlan.status}`);
    console.log(`   Current Approver: ${lessonPlan.currentApprover}`);
    console.log(`   Class: ${lessonPlan.class}, Section: ${lessonPlan.section}`);
    console.log(`   Subject: ${lessonPlan.subject}`);
    console.log(`   Is Published: ${lessonPlan.isPublished}`);

    // 3. Check if teacher exists
    const teacher = await Staff.findById(lessonPlan.submittedBy);
    if (teacher) {
      console.log(`👨‍🏫 Teacher: ${teacher.name} (${teacher.role})`);
    } else {
      console.log('❌ Teacher not found');
    }

    // 4. Check if students exist for this class and section
    const students = await Student.find({
      class: lessonPlan.class,
      section: lessonPlan.section
    });
    console.log(`👨‍🎓 Found ${students.length} students in Class ${lessonPlan.class}-${lessonPlan.section}`);

    // 5. Simulate the approval workflow
    console.log('\n🔄 Simulating approval workflow...');

    // Step 1: HOD Approval
    if (lessonPlan.status === 'Pending') {
      console.log('✅ Step 1: HOD Approval');
      lessonPlan.status = 'HOD_Approved';
      lessonPlan.currentApprover = 'Principal';
      lessonPlan.hodApprovedBy = teacher?._id || lessonPlan.submittedBy;
      lessonPlan.hodApprovedAt = new Date();
      lessonPlan.hodFeedback = 'Approved by HOD for testing';
      await lessonPlan.save();
      console.log('   → Lesson plan approved by HOD');
    }

    // Step 2: Principal Approval
    if (lessonPlan.status === 'HOD_Approved') {
      console.log('✅ Step 2: Principal Approval');
      lessonPlan.status = 'Published';
      lessonPlan.currentApprover = 'Completed';
      lessonPlan.isPublished = true;
      lessonPlan.principalApprovedBy = teacher?._id || lessonPlan.submittedBy;
      lessonPlan.principalApprovedAt = new Date();
      lessonPlan.principalFeedback = 'Approved by Principal for testing';
      await lessonPlan.save();
      console.log('   → Lesson plan approved by Principal and published');
    }

    // 6. Test student access
    console.log('\n🎓 Testing student access...');
    
    if (students.length > 0) {
      const student = students[0];
      console.log(`👨‍🎓 Testing with student: ${student.name} (Class ${student.class}-${student.section})`);

      // Query for lesson plans that should be visible to this student
      const studentLessonPlans = await LessonPlan.find({
        class: student.class,
        section: student.section,
        status: 'Published',
        isPublished: true
      }).populate('submittedBy', 'name email');

      console.log(`📋 Student can see ${studentLessonPlans.length} lesson plans`);
      
      if (studentLessonPlans.length > 0) {
        console.log('✅ Student access working correctly!');
        studentLessonPlans.forEach((lp, index) => {
          console.log(`   ${index + 1}. ${lp.title} - ${lp.subject} - By: ${lp.submittedBy?.name}`);
        });
      } else {
        console.log('❌ Student cannot see any lesson plans');
      }
    } else {
      console.log('❌ No students found for this class and section');
    }

    // 7. Test subject filtering
    console.log('\n🔍 Testing subject filtering...');
    const subjects = await LessonPlan.distinct('subject', {
      class: lessonPlan.class,
      section: lessonPlan.section,
      status: 'Published',
      isPublished: true
    });
    console.log(`📚 Available subjects: ${subjects.join(', ')}`);

    // 8. Final status check
    console.log('\n📊 Final Status:');
    const finalLessonPlan = await LessonPlan.findById(lessonPlan._id);
    console.log(`   Title: ${finalLessonPlan.title}`);
    console.log(`   Status: ${finalLessonPlan.status}`);
    console.log(`   Is Published: ${finalLessonPlan.isPublished}`);
    console.log(`   Current Approver: ${finalLessonPlan.currentApprover}`);
    console.log(`   HOD Approved: ${finalLessonPlan.hodApprovedAt ? 'Yes' : 'No'}`);
    console.log(`   Principal Approved: ${finalLessonPlan.principalApprovedAt ? 'Yes' : 'No'}`);

    console.log('\n✅ Complete workflow test finished!');
    console.log('\n📝 Next steps:');
    console.log('   1. Visit http://localhost:3000/student/study-materials');
    console.log('   2. Students should see the lesson plan in their study materials');
    console.log('   3. Students can filter by subject and view lesson plan details');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testCompleteWorkflow(); 