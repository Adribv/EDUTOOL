const mongoose = require('mongoose');
const LessonPlan = require('./models/Staff/Teacher/lessonplan.model');
const Department = require('./models/Staff/HOD/department.model');
const Staff = require('./models/Staff/staffModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixDepartmentAssignment() {
  try {
    console.log('🔧 Fixing department assignment...\n');

    // Get the lesson plan
    const lessonPlan = await LessonPlan.findOne({ status: 'Pending' });
    if (!lessonPlan) {
      console.log('❌ No pending lesson plan found');
      return;
    }

    console.log(`📄 Found lesson plan: ${lessonPlan.title}`);
    console.log(`👨‍🏫 Submitted by teacher: ${lessonPlan.submittedBy}`);
    console.log(`📚 Subject: ${lessonPlan.subject}\n`);

    // Get the teacher
    const teacher = await Staff.findById(lessonPlan.submittedBy);
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }

    console.log(`👨‍🏫 Teacher: ${teacher.name}`);
    console.log(`🏢 Current department: ${teacher.department?.name || 'None'}\n`);

    // Find or create department based on subject
    let department = null;
    
    // Try to find existing department by subject
    if (lessonPlan.subject) {
      department = await Department.findOne({
        subjects: { $in: [lessonPlan.subject] }
      });
    }

    // If no department found by subject, try to find by name
    if (!department && lessonPlan.subject) {
      department = await Department.findOne({
        name: { $regex: lessonPlan.subject, $options: 'i' }
      });
    }

    // If still no department, create one
    if (!department) {
      console.log(`🏢 Creating new department for ${lessonPlan.subject}...`);
      department = new Department({
        name: lessonPlan.subject,
        subjects: [lessonPlan.subject],
        description: `Department for ${lessonPlan.subject}`
      });
      await department.save();
      console.log(`✅ Created department: ${department.name}`);
    } else {
      console.log(`✅ Found department: ${department.name}`);
    }

    // Add teacher to department if not already there
    if (!department.teachers.includes(teacher._id)) {
      department.teachers.push(teacher._id);
      await department.save();
      console.log(`✅ Added teacher ${teacher.name} to department ${department.name}`);
    } else {
      console.log(`ℹ️ Teacher ${teacher.name} already in department ${department.name}`);
    }

    // Update teacher's department assignment
    if (!teacher.department || teacher.department._id?.toString() !== department._id.toString()) {
      teacher.department = {
        _id: department._id,
        name: department.name
      };
      await teacher.save();
      console.log(`✅ Updated teacher's department assignment`);
    }

    // Assign a HOD to the department if none exists
    if (!department.headOfDepartment) {
      console.log(`👨‍💼 No HOD assigned to department ${department.name}`);
      console.log(`ℹ️ Please assign an HOD to this department manually`);
    } else {
      console.log(`👨‍💼 HOD assigned: ${department.headOfDepartment}`);
    }

    console.log('\n✅ Department assignment fixed!');
    console.log(`📄 Lesson plan should now appear in HOD approval queue`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixDepartmentAssignment(); 