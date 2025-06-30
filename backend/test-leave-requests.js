const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    const Staff = require('./models/Staff/staffModel');
    const Student = require('./models/Student/studentModel');
    const LeaveRequest = require('./models/Student/leaveRequestModel');
    const Class = require('./models/Admin/classModel');

    // Check teachers
    console.log('\n=== TEACHERS ===');
    const teachers = await Staff.find({ role: 'Teacher' });
    console.log(`Found ${teachers.length} teachers:`);
    teachers.forEach(teacher => {
      console.log(`- ${teacher.name} (${teacher.email}) - Coordinator: ${teacher.coordinator?.length || 0} classes`);
    });

    // Check classes
    console.log('\n=== CLASSES ===');
    const classes = await Class.find();
    console.log(`Found ${classes.length} classes:`);
    classes.forEach(cls => {
      console.log(`- ${cls.name} (${cls.grade}${cls.section}) - Coordinator: ${cls.coordinator}`);
    });

    // Check students
    console.log('\n=== STUDENTS ===');
    const students = await Student.find();
    console.log(`Found ${students.length} students:`);
    students.forEach(student => {
      console.log(`- ${student.name} (${student.studentId}) - Class: ${student.class}${student.section}`);
    });

    // Check leave requests
    console.log('\n=== LEAVE REQUESTS ===');
    const leaveRequests = await LeaveRequest.find().populate('studentId', 'name class section');
    console.log(`Found ${leaveRequests.length} leave requests:`);
    leaveRequests.forEach(request => {
      console.log(`- Student: ${request.studentId?.name || 'Unknown'} (${request.studentId?.class || 'N/A'}${request.studentId?.section || 'N/A'}) - Status: ${request.status} - Type: ${request.type}`);
    });

    // Test the getLeaveRequests logic for first teacher
    if (teachers.length > 0) {
      console.log('\n=== TESTING LEAVE REQUESTS FOR FIRST TEACHER ===');
      const teacher = teachers[0];
      console.log(`Testing for teacher: ${teacher.name}`);
      
      // Populate coordinator classes
      const teacherWithClasses = await Staff.findById(teacher._id).populate('coordinator', 'name grade section');
      console.log(`Teacher coordinator classes:`, teacherWithClasses.coordinator);
      
      if (teacherWithClasses.coordinator && teacherWithClasses.coordinator.length > 0) {
        const coordinatedClasses = teacherWithClasses.coordinator;
        const classSectionCombinations = coordinatedClasses.map(cls => ({
          class: cls.grade,
          section: cls.section
        }));
        
        console.log(`Looking for students in:`, classSectionCombinations);
        
        const coordinatedStudents = await Student.find({
          $or: classSectionCombinations.map(combo => ({
            class: combo.class,
            section: combo.section
          }))
        });
        
        console.log(`Found ${coordinatedStudents.length} coordinated students`);
        
        if (coordinatedStudents.length > 0) {
          const studentIds = coordinatedStudents.map(student => student._id);
          const teacherLeaveRequests = await LeaveRequest.find({
            studentId: { $in: studentIds }
          }).populate('studentId', 'name class section');
          
          console.log(`Found ${teacherLeaveRequests.length} leave requests for coordinated students`);
          teacherLeaveRequests.forEach(request => {
            console.log(`- ${request.studentId.name} (${request.studentId.class}${request.studentId.section}): ${request.status} - ${request.type}`);
          });
        }
      } else {
        console.log('Teacher has no coordinated classes');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}); 