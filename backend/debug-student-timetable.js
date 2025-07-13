const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulives')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const Student = require('./models/Student/studentModel');
const Timetable = require('./models/Academic/timetableModel');

async function debugStudentTimetable() {
  try {
    console.log('🔍 Debugging Student Timetable Access...\n');
    
    // Get all students
    const students = await Student.find({ status: 'Active' }).select('name email class section rollNumber');
    
    console.log(`📚 Found ${students.length} active students:`);
    students.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.name} (${student.email})`);
      console.log(`     Class: "${student.class}", Section: "${student.section}"`);
      console.log(`     Roll Number: ${student.rollNumber}\n`);
    });
    
    // Get all timetables
    const timetables = await Timetable.find({ isActive: true }).select('class section academicYear term');
    
    console.log(`📅 Found ${timetables.length} active timetables:`);
    timetables.forEach((timetable, index) => {
      console.log(`  ${index + 1}. Class: "${timetable.class}", Section: "${timetable.section}"`);
      console.log(`     Academic Year: ${timetable.academicYear}, Term: ${timetable.term}\n`);
    });
    
    // Test matching for each student
    console.log('🔍 Testing timetable matching for each student:');
    
    students.forEach((student, studentIndex) => {
      console.log(`\n👤 Student ${studentIndex + 1}: ${student.name}`);
      console.log(`   Class: "${student.class}", Section: "${student.section}"`);
      
      // Test exact match
      const exactMatch = timetables.find(t => 
        t.class === student.class && t.section === student.section
      );
      
      if (exactMatch) {
        console.log(`   ✅ EXACT MATCH: Timetable found for class "${exactMatch.class}", section "${exactMatch.section}"`);
      } else {
        console.log(`   ❌ NO EXACT MATCH`);
        
        // Test case-insensitive match
        const caseInsensitiveMatch = timetables.find(t => 
          t.class.toLowerCase() === student.class.toLowerCase() && 
          t.section.toLowerCase() === student.section.toLowerCase()
        );
        
        if (caseInsensitiveMatch) {
          console.log(`   ✅ CASE-INSENSITIVE MATCH: Timetable found for class "${caseInsensitiveMatch.class}", section "${caseInsensitiveMatch.section}"`);
        } else {
          console.log(`   ❌ NO CASE-INSENSITIVE MATCH`);
          
          // Test flexible matching (like "12C" vs "12" + "C")
          const flexibleMatch = timetables.find(t => {
            // Check if student class includes section (e.g., "12C")
            const studentClassStr = String(student.class);
            const studentSectionStr = String(student.section);
            
            // Check if timetable class includes section (e.g., "12C")
            const timetableClassStr = String(t.class);
            const timetableSectionStr = String(t.section);
            
            // Match 1: Student "12C" vs Timetable "12" + "C"
            if (studentClassStr.includes(studentSectionStr) && 
                timetableClassStr === studentClassStr.replace(studentSectionStr, '') &&
                timetableSectionStr === studentSectionStr) {
              return true;
            }
            
            // Match 2: Student "12" + "C" vs Timetable "12C"
            if (timetableClassStr.includes(timetableSectionStr) &&
                studentClassStr === timetableClassStr.replace(timetableSectionStr, '') &&
                studentSectionStr === timetableSectionStr) {
              return true;
            }
            
            return false;
          });
          
          if (flexibleMatch) {
            console.log(`   ✅ FLEXIBLE MATCH: Timetable found for class "${flexibleMatch.class}", section "${flexibleMatch.section}"`);
          } else {
            console.log(`   ❌ NO FLEXIBLE MATCH`);
          }
        }
      }
    });
    
    // Test the actual API logic
    console.log('\n🔧 Testing API Logic:');
    
    // Simulate the getTimetable function logic
    students.forEach(async (student) => {
      console.log(`\n👤 Testing API for student: ${student.name}`);
      
      // Try exact match first
      let timetable = await Timetable.findOne({
        class: student.class,
        section: student.section,
        isActive: true
      });
      
      if (timetable) {
        console.log(`   ✅ API EXACT MATCH: Found timetable`);
      } else {
        console.log(`   ❌ API EXACT MATCH: No timetable found`);
        
        // Try case-insensitive match
        timetable = await Timetable.findOne({
          class: { $regex: new RegExp(`^${student.class}$`, 'i') },
          section: { $regex: new RegExp(`^${student.section}$`, 'i') },
          isActive: true
        });
        
        if (timetable) {
          console.log(`   ✅ API CASE-INSENSITIVE MATCH: Found timetable`);
        } else {
          console.log(`   ❌ API CASE-INSENSITIVE MATCH: No timetable found`);
        }
      }
    });
    
  } catch (error) {
    console.error('Error debugging student timetable:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugStudentTimetable(); 