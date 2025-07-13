const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://EDULIVES:EDULIVES123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-01.uno4ffz.mongodb.net:27017,ac-l2bmyna-shard-00-02.uno4ffz.mongodb.net:27017/EDULIVES?ssl=true&replicaSet=atlas-14b8sh-shard-0&authSource=admin&retryWrites=true&w=majority';

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
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Import models
const Student = require('./models/Student/studentModel');
const Timetable = require('./models/Academic/timetableModel');

async function testTimetableMatching() {
  try {
    console.log('🧪 Testing Timetable Matching...\n');
    
    // Test with the specific student data
    const studentClass = '12C';
    const studentSection = 'C';
    
    console.log(`👤 Testing for student with class: "${studentClass}", section: "${studentSection}"`);
    
    // Get all timetables
    const timetables = await Timetable.find({ isActive: true });
    console.log(`📅 Found ${timetables.length} active timetables:`);
    
    timetables.forEach((t, index) => {
      console.log(`  ${index + 1}. Class: "${t.class}", Section: "${t.section}"`);
    });
    
    // Test the matching logic
    console.log('\n🔍 Testing matching logic:');
    
    for (const t of timetables) {
      const timetableClassStr = String(t.class);
      const timetableSectionStr = String(t.section);
      const studentClassStr = String(studentClass);
      const studentSectionStr = String(studentSection);
      
      console.log(`\n   Checking timetable: "${timetableClassStr}" + "${timetableSectionStr}"`);
      
      // Test exact match
      if (studentClassStr === timetableClassStr && studentSectionStr === timetableSectionStr) {
        console.log(`   ✅ EXACT MATCH`);
        continue;
      }
      
      // Test case-insensitive match
      if (studentClassStr.toLowerCase() === timetableClassStr.toLowerCase() && 
          studentSectionStr.toLowerCase() === timetableSectionStr.toLowerCase()) {
        console.log(`   ✅ CASE-INSENSITIVE MATCH`);
        continue;
      }
      
      // Test flexible match 1: Student "12C" vs Timetable "12" + "C"
      if (studentClassStr.includes(studentSectionStr) && 
          timetableClassStr === studentClassStr.replace(studentSectionStr, '') &&
          timetableSectionStr === studentSectionStr) {
        console.log(`   ✅ FLEXIBLE MATCH 1: Student "${studentClassStr}" matches timetable "${timetableClassStr}" + "${timetableSectionStr}"`);
        continue;
      }
      
      // Test flexible match 2: Timetable "12C" vs Student "12" + "C"
      if (timetableClassStr.includes(timetableSectionStr) &&
          studentClassStr === timetableClassStr.replace(timetableSectionStr, '') &&
          studentSectionStr === timetableSectionStr) {
        console.log(`   ✅ FLEXIBLE MATCH 2: Timetable "${timetableClassStr}" matches student "${studentClassStr}" + "${studentSectionStr}"`);
        continue;
      }
      
      console.log(`   ❌ NO MATCH`);
    }
    
    // Test the actual API logic
    console.log('\n🔧 Testing API Logic:');
    
    // Simulate the exact logic from the controller
    let timetable = await Timetable.findOne({
      class: studentClass,
      section: studentSection,
      isActive: true
    });
    
    if (timetable) {
      console.log(`   ✅ API EXACT MATCH: Found timetable`);
    } else {
      console.log(`   ❌ API EXACT MATCH: No timetable found`);
      
      // Try case-insensitive match
      timetable = await Timetable.findOne({
        class: { $regex: new RegExp(`^${studentClass}$`, 'i') },
        section: { $regex: new RegExp(`^${studentSection}$`, 'i') },
        isActive: true
      });
      
      if (timetable) {
        console.log(`   ✅ API CASE-INSENSITIVE MATCH: Found timetable`);
      } else {
        console.log(`   ❌ API CASE-INSENSITIVE MATCH: No timetable found`);
        
        // Try normalized match
        const normalizedStudentClass = studentClass.toString().replace(/\s+/g, '').toUpperCase();
        const normalizedStudentSection = studentSection.toString().replace(/\s+/g, '').toUpperCase();
        
        console.log(`   🔧 Normalized: "${normalizedStudentClass}", "${normalizedStudentSection}"`);
        
        const allTimetables = await Timetable.find({ isActive: true });
        
        for (const t of allTimetables) {
          const normalizedTimetableClass = t.class.toString().replace(/\s+/g, '').toUpperCase();
          const normalizedTimetableSection = t.section.toString().replace(/\s+/g, '').toUpperCase();
          
          if (normalizedTimetableClass === normalizedStudentClass && 
              normalizedTimetableSection === normalizedStudentSection) {
            timetable = t;
            console.log(`   ✅ API NORMALIZED MATCH: Found timetable`);
            break;
          }
        }
        
        if (!timetable) {
          console.log(`   ❌ API NORMALIZED MATCH: No timetable found`);
          
          // Try flexible matching
          for (const t of allTimetables) {
            const timetableClassStr = String(t.class);
            const timetableSectionStr = String(t.section);
            const studentClassStr = String(studentClass);
            const studentSectionStr = String(studentSection);
            
            // Check if student class includes section (e.g., student has "12C" but timetable has "12" + "C")
            if (studentClassStr.includes(studentSectionStr) && 
                timetableClassStr === studentClassStr.replace(studentSectionStr, '') &&
                timetableSectionStr === studentSectionStr) {
              timetable = t;
              console.log(`   ✅ API FLEXIBLE MATCH 1: Student "${studentClassStr}" matches timetable "${timetableClassStr}" + "${timetableSectionStr}"`);
              break;
            }
            
            // Check if timetable class includes section (e.g., timetable has "12C" but student has "12" + "C")
            if (timetableClassStr.includes(timetableSectionStr) &&
                studentClassStr === timetableClassStr.replace(timetableSectionStr, '') &&
                studentSectionStr === timetableSectionStr) {
              timetable = t;
              console.log(`   ✅ API FLEXIBLE MATCH 2: Timetable "${timetableClassStr}" matches student "${studentClassStr}" + "${studentSectionStr}"`);
              break;
            }
          }
          
          if (!timetable) {
            console.log(`   ❌ API FLEXIBLE MATCH: No timetable found`);
          }
        }
      }
    }
    
    if (timetable) {
      console.log(`\n🎉 SUCCESS: Found matching timetable!`);
      console.log(`   Class: "${timetable.class}", Section: "${timetable.section}"`);
      console.log(`   Academic Year: ${timetable.academicYear}, Term: ${timetable.term}`);
      
      // Show timetable data
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      let totalPeriods = 0;
      
      days.forEach(day => {
        if (timetable[day] && timetable[day].periods) {
          console.log(`   ${day.charAt(0).toUpperCase() + day.slice(1)}: ${timetable[day].periods.length} periods`);
          totalPeriods += timetable[day].periods.length;
        }
      });
      
      console.log(`   Total periods: ${totalPeriods}`);
    } else {
      console.log(`\n❌ FAILED: No matching timetable found`);
    }
    
  } catch (error) {
    console.error('Error testing timetable matching:', error);
  } finally {
    mongoose.connection.close();
  }
}

testTimetableMatching(); 