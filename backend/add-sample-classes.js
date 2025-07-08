const mongoose = require('mongoose');
const ClassModel = require('./models/Admin/classModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/EDULIVES')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const sampleClasses = [
  { name: 'Class 1A', grade: '1', section: 'A', capacity: 35, description: 'First Grade Section A' },
  { name: 'Class 1B', grade: '1', section: 'B', capacity: 35, description: 'First Grade Section B' },
  { name: 'Class 2A', grade: '2', section: 'A', capacity: 35, description: 'Second Grade Section A' },
  { name: 'Class 2B', grade: '2', section: 'B', capacity: 35, description: 'Second Grade Section B' },
  { name: 'Class 3A', grade: '3', section: 'A', capacity: 35, description: 'Third Grade Section A' },
  { name: 'Class 3B', grade: '3', section: 'B', capacity: 35, description: 'Third Grade Section B' },
  { name: 'Class 4A', grade: '4', section: 'A', capacity: 35, description: 'Fourth Grade Section A' },
  { name: 'Class 4B', grade: '4', section: 'B', capacity: 35, description: 'Fourth Grade Section B' },
  { name: 'Class 5A', grade: '5', section: 'A', capacity: 35, description: 'Fifth Grade Section A' },
  { name: 'Class 5B', grade: '5', section: 'B', capacity: 35, description: 'Fifth Grade Section B' },
  { name: 'Class 6A', grade: '6', section: 'A', capacity: 40, description: 'Sixth Grade Section A' },
  { name: 'Class 6B', grade: '6', section: 'B', capacity: 40, description: 'Sixth Grade Section B' },
  { name: 'Class 7A', grade: '7', section: 'A', capacity: 40, description: 'Seventh Grade Section A' },
  { name: 'Class 7B', grade: '7', section: 'B', capacity: 40, description: 'Seventh Grade Section B' },
  { name: 'Class 8A', grade: '8', section: 'A', capacity: 40, description: 'Eighth Grade Section A' },
  { name: 'Class 8B', grade: '8', section: 'B', capacity: 40, description: 'Eighth Grade Section B' },
  { name: 'Class 9A', grade: '9', section: 'A', capacity: 45, description: 'Ninth Grade Section A' },
  { name: 'Class 9B', grade: '9', section: 'B', capacity: 45, description: 'Ninth Grade Section B' },
  { name: 'Class 10A', grade: '10', section: 'A', capacity: 45, description: 'Tenth Grade Section A' },
  { name: 'Class 10B', grade: '10', section: 'B', capacity: 45, description: 'Tenth Grade Section B' },
  { name: 'Class 11A', grade: '11', section: 'A', capacity: 50, description: 'Eleventh Grade Section A' },
  { name: 'Class 11B', grade: '11', section: 'B', capacity: 50, description: 'Eleventh Grade Section B' },
  { name: 'Class 12A', grade: '12', section: 'A', capacity: 50, description: 'Twelfth Grade Section A' },
  { name: 'Class 12B', grade: '12', section: 'B', capacity: 50, description: 'Twelfth Grade Section B' }
];

async function addSampleClasses() {
  try {
    // Clear existing classes
    await ClassModel.deleteMany({});
    console.log('Cleared existing classes');

    // Add sample classes
    const insertedClasses = await ClassModel.insertMany(sampleClasses);
    console.log(`Successfully added ${insertedClasses.length} classes`);

    // Show the classes
    insertedClasses.forEach(cls => {
      console.log(`- ${cls.name} (Grade ${cls.grade}, Section ${cls.section})`);
    });

  } catch (error) {
    console.error('Error adding classes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addSampleClasses(); 