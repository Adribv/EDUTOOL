const mongoose = require('mongoose');
const Staff = require('./models/Staff/staffModel');

mongoose.connect('mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkHODUsers() {
  try {
    const hods = await Staff.find({ role: 'HOD' });
    console.log('HOD users found:', hods.length);
    
    if (hods.length > 0) {
      hods.forEach(hod => {
        console.log('HOD:', hod.name, hod.email, hod.role);
      });
    } else {
      console.log('No HOD users found in database');
    }
    
    // Also check for any staff users
    const allStaff = await Staff.find().limit(5);
    console.log('\nFirst 5 staff users:');
    allStaff.forEach(staff => {
      console.log('Staff:', staff.name, staff.email, staff.role);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkHODUsers(); 