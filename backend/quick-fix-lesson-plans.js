const mongoose = require('mongoose');
const LessonPlan = require('./models/Staff/Teacher/lessonplan.model');
const Department = require('./models/Staff/HOD/department.model');
const Staff = require('./models/Staff/staffModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function quickFix() {
  try {
    console.log('🔧 Quick fix for lesson plan approval system...\n');

    // 1. Find the lesson plan
    const lessonPlan = await LessonPlan.findOne({ status: 'Pending' });
    if (!lessonPlan) {
      console.log('❌ No pending lesson plan found');
      return;
    }

    console.log(`📄 Found lesson plan: ${lessonPlan.title}`);
    console.log(`👨‍🏫 Submitted by: ${lessonPlan.submittedBy}`);
    console.log(`📚 Subject: ${lessonPlan.subject}\n`);

    // 2. Find or create the teacher
    let teacher = await Staff.findById(lessonPlan.submittedBy);
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }

    console.log(`👨‍🏫 Teacher: ${teacher.name}`);
    console.log(`🏢 Current department: ${teacher.department?.name || 'None'}\n`);

    // 3. Find or create department based on subject
    let department = await Department.findOne({
      $or: [
        { name: { $regex: lessonPlan.subject, $options: 'i' } },
        { subjects: { $in: [lessonPlan.subject] } }
      ]
    });

    if (!department) {
      console.log(`🏢 Creating department for ${lessonPlan.subject}...`);
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

    // 4. Add teacher to department
    if (!department.teachers.includes(teacher._id)) {
      department.teachers.push(teacher._id);
      await department.save();
      console.log(`✅ Added teacher to department`);
    }

    // 5. Update teacher's department assignment
    teacher.department = {
      _id: department._id,
      name: department.name
    };
    await teacher.save();
    console.log(`✅ Updated teacher's department assignment`);

    // 6. Find or create an HOD for this department
    let hod = await Staff.findOne({ role: 'HOD' });
    if (!hod) {
      console.log('👨‍💼 Creating HOD user...');
      hod = new Staff({
        name: 'HOD Test User',
        email: 'hod@test.com',
        password: 'password123',
        role: 'HOD',
        department: {
          _id: department._id,
          name: department.name
        }
      });
      await hod.save();
      console.log(`✅ Created HOD: ${hod.name}`);
    } else {
      console.log(`✅ Found HOD: ${hod.name}`);
    }

    // 7. Assign HOD to department
    department.headOfDepartment = hod._id;
    await department.save();
    console.log(`✅ Assigned HOD to department`);

    // 8. Create a Principal if none exists
    let principal = await Staff.findOne({ role: 'Principal' });
    if (!principal) {
      console.log('👨‍💼 Creating Principal user...');
      principal = new Staff({
        name: 'Principal Test User',
        email: 'principal@test.com',
        password: 'password123',
        role: 'Principal'
      });
      await principal.save();
      console.log(`✅ Created Principal: ${principal.name}`);
    } else {
      console.log(`✅ Found Principal: ${principal.name}`);
    }

    console.log('\n✅ Quick fix completed!');
    console.log(`📄 Lesson plan should now appear in HOD approval queue`);
    console.log(`👨‍💼 HOD login: hod@test.com / password123`);
    console.log(`👨‍💼 Principal login: principal@test.com / password123`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

quickFix(); 