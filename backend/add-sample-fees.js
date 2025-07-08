const mongoose = require('mongoose');
const FeeStructure = require('./models/Finance/feeStructureModel');
const ClassModel = require('./models/Admin/classModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/EDULIVES')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const sampleFees = [
  {
    class: '6',
    term: 'Term 1',
    components: [
      { name: 'Tuition Fee', amount: 5000, description: 'Monthly tuition fee', isOptional: false },
      { name: 'Library Fee', amount: 500, description: 'Library membership fee', isOptional: true },
      { name: 'Sports Fee', amount: 800, description: 'Sports facility fee', isOptional: true }
    ],
    totalAmount: 6300,
    dueDate: new Date('2024-12-31'),
    latePaymentFee: 100,
    academicYear: '2024'
  },
  {
    class: '7',
    term: 'Term 1',
    components: [
      { name: 'Tuition Fee', amount: 5500, description: 'Monthly tuition fee', isOptional: false },
      { name: 'Library Fee', amount: 500, description: 'Library membership fee', isOptional: true },
      { name: 'Sports Fee', amount: 800, description: 'Sports facility fee', isOptional: true }
    ],
    totalAmount: 6800,
    dueDate: new Date('2024-12-31'),
    latePaymentFee: 100,
    academicYear: '2024'
  },
  {
    class: '8',
    term: 'Term 1',
    components: [
      { name: 'Tuition Fee', amount: 6000, description: 'Monthly tuition fee', isOptional: false },
      { name: 'Library Fee', amount: 500, description: 'Library membership fee', isOptional: true },
      { name: 'Sports Fee', amount: 800, description: 'Sports facility fee', isOptional: true }
    ],
    totalAmount: 7300,
    dueDate: new Date('2024-12-31'),
    latePaymentFee: 100,
    academicYear: '2024'
  },
  {
    class: '9',
    term: 'Term 1',
    components: [
      { name: 'Tuition Fee', amount: 6500, description: 'Monthly tuition fee', isOptional: false },
      { name: 'Library Fee', amount: 500, description: 'Library membership fee', isOptional: true },
      { name: 'Sports Fee', amount: 800, description: 'Sports facility fee', isOptional: true }
    ],
    totalAmount: 7800,
    dueDate: new Date('2024-12-31'),
    latePaymentFee: 100,
    academicYear: '2024'
  },
  {
    class: '10',
    term: 'Term 1',
    components: [
      { name: 'Tuition Fee', amount: 7000, description: 'Monthly tuition fee', isOptional: false },
      { name: 'Library Fee', amount: 500, description: 'Library membership fee', isOptional: true },
      { name: 'Sports Fee', amount: 800, description: 'Sports facility fee', isOptional: true }
    ],
    totalAmount: 8300,
    dueDate: new Date('2024-12-31'),
    latePaymentFee: 100,
    academicYear: '2024'
  },
  {
    class: '11',
    term: 'Term 1',
    components: [
      { name: 'Tuition Fee', amount: 7500, description: 'Monthly tuition fee', isOptional: false },
      { name: 'Library Fee', amount: 500, description: 'Library membership fee', isOptional: true },
      { name: 'Sports Fee', amount: 800, description: 'Sports facility fee', isOptional: true }
    ],
    totalAmount: 8800,
    dueDate: new Date('2024-12-31'),
    latePaymentFee: 100,
    academicYear: '2024'
  },
  {
    class: '12',
    term: 'Term 1',
    components: [
      { name: 'Tuition Fee', amount: 8000, description: 'Monthly tuition fee', isOptional: false },
      { name: 'Library Fee', amount: 500, description: 'Library membership fee', isOptional: true },
      { name: 'Sports Fee', amount: 800, description: 'Sports facility fee', isOptional: true }
    ],
    totalAmount: 9300,
    dueDate: new Date('2024-12-31'),
    latePaymentFee: 100,
    academicYear: '2024'
  }
];

async function addSampleFees() {
  try {
    // Clear existing fee structures
    await FeeStructure.deleteMany({});
    console.log('Cleared existing fee structures');

    // Insert sample fee structures
    const insertedFees = await FeeStructure.insertMany(sampleFees);
    console.log(`Successfully added ${insertedFees.length} fee structures`);

    // Show summary
    console.log('\nFee structures added:');
    insertedFees.forEach(fee => {
      console.log(`- ${fee.class} (${fee.term}): $${fee.totalAmount}`);
    });

  } catch (error) {
    console.error('Error adding sample fees:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addSampleFees(); 