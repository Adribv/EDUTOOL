const mongoose = require('mongoose');
const LessonPlan = require('./models/Staff/Teacher/lessonplan.model');
const Department = require('./models/Staff/HOD/department.model');
const Staff = require('./models/Staff/staffModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function debugLessonPlans() {
  try {
    console.log('🔍 Debugging lesson plans and department assignments...\n');

    // Check all lesson plans
    const allLessonPlans = await LessonPlan.find({});
    console.log(`📋 Total lesson plans: ${allLessonPlans.length}`);
    
    const pendingLessonPlans = await LessonPlan.find({ status: 'Pending' });
    console.log(`⏳ Pending lesson plans: ${pendingLessonPlans.length}\n`);

    // Show lesson plan details
    allLessonPlans.forEach((lp, index) => {
      console.log(`📄 Lesson Plan ${index + 1}:`);
      console.log(`   ID: ${lp._id}`);
      console.log(`   Title: ${lp.title}`);
      console.log(`   Status: ${lp.status}`);
      console.log(`   Current Approver: ${lp.currentApprover}`);
      console.log(`   Submitted By: ${lp.submittedBy}`);
      console.log(`   Subject: ${lp.subject}`);
      console.log(`   Class: ${lp.class}`);
      console.log(`   Created: ${lp.createdAt}`);
      console.log('');
    });

    // Check all departments
    const departments = await Department.find({});
    console.log(`🏢 Total departments: ${departments.length}`);
    
    departments.forEach((dept, index) => {
      console.log(`🏢 Department ${index + 1}:`);
      console.log(`   ID: ${dept._id}`);
      console.log(`   Name: ${dept.name}`);
      console.log(`   Head of Department: ${dept.headOfDepartment}`);
      console.log(`   Teachers: ${dept.teachers.length}`);
      console.log(`   Teachers IDs: ${dept.teachers.join(', ')}`);
      console.log('');
    });

    // Check the specific teacher who submitted the lesson plan
    if (allLessonPlans.length > 0) {
      const teacherId = allLessonPlans[0].submittedBy;
      console.log(`👨‍🏫 Checking teacher: ${teacherId}`);
      
      const teacher = await Staff.findById(teacherId);
      if (teacher) {
        console.log(`   Name: ${teacher.name}`);
        console.log(`   Role: ${teacher.role}`);
        console.log(`   Department: ${teacher.department}`);
        console.log(`   Assigned Subjects: ${JSON.stringify(teacher.assignedSubjects)}`);
        console.log(`   Assigned Classes: ${JSON.stringify(teacher.assignedClasses)}`);
      } else {
        console.log('   Teacher not found!');
      }
    }

    // Check if any department has the teacher assigned
    if (allLessonPlans.length > 0) {
      const teacherId = allLessonPlans[0].submittedBy;
      const departmentWithTeacher = departments.find(dept => 
        dept.teachers.includes(teacherId)
      );
      
      if (departmentWithTeacher) {
        console.log(`✅ Teacher ${teacherId} is assigned to department: ${departmentWithTeacher.name}`);
      } else {
        console.log(`❌ Teacher ${teacherId} is NOT assigned to any department!`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugLessonPlans(); 