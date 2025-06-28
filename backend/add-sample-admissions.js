const mongoose = require('mongoose');
const Admission = require('./models/Admin/admissionModel');
const Staff = require('./models/Staff/staffModel');
require('dotenv').config();

const sampleAdmissions = [
  {
    studentName: 'Aisha Rahman',
    dateOfBirth: new Date('2018-03-15'),
    gender: 'Female',
    parentName: 'Mohammed Rahman',
    parentPhone: '+91-9876543210',
    parentEmail: 'mohammed.rahman@email.com',
    address: {
      street: '123 Green Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    applyingForClass: '1',
    academicYear: '2024-2025',
    previousSchool: 'Little Angels Preschool',
    documents: {
      birthCertificate: true,
      transferCertificate: true,
      reportCard: true,
      addressProof: true,
      parentIdProof: true
    },
    status: 'Pending',
    admissionFee: 25000,
    priority: 'High',
    specialRequirements: 'Vegetarian meals only',
    emergencyContact: {
      name: 'Fatima Rahman',
      relationship: 'Aunt',
      phone: '+91-9876543211'
    },
    transportRequired: true,
    transportRoute: 'Andheri West'
  },
  {
    studentName: 'Arjun Singh',
    dateOfBirth: new Date('2017-08-22'),
    gender: 'Male',
    parentName: 'Rajesh Singh',
    parentPhone: '+91-9876543212',
    parentEmail: 'rajesh.singh@email.com',
    address: {
      street: '456 Sunshine Colony',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    applyingForClass: '2',
    academicYear: '2024-2025',
    previousSchool: 'Delhi Public School',
    documents: {
      birthCertificate: true,
      transferCertificate: true,
      reportCard: true,
      addressProof: true,
      parentIdProof: true
    },
    status: 'Under Review',
    admissionFee: 30000,
    priority: 'Medium',
    emergencyContact: {
      name: 'Priya Singh',
      relationship: 'Mother',
      phone: '+91-9876543213'
    },
    interviewScheduled: true,
    interviewDate: new Date('2024-12-15T10:00:00Z'),
    testScore: 85
  },
  {
    studentName: 'Zara Khan',
    dateOfBirth: new Date('2019-01-10'),
    gender: 'Female',
    parentName: 'Ahmed Khan',
    parentPhone: '+91-9876543214',
    parentEmail: 'ahmed.khan@email.com',
    address: {
      street: '789 Lake View',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    applyingForClass: 'LKG',
    academicYear: '2024-2025',
    documents: {
      birthCertificate: true,
      transferCertificate: false,
      reportCard: false,
      addressProof: true,
      parentIdProof: true
    },
    status: 'Approved',
    admissionFee: 20000,
    feePaid: true,
    feePaymentDate: new Date('2024-11-20'),
    enrollmentDate: new Date('2024-11-25'),
    priority: 'High',
    emergencyContact: {
      name: 'Sana Khan',
      relationship: 'Mother',
      phone: '+91-9876543215'
    },
    hostelRequired: true
  },
  {
    studentName: 'Vihaan Patel',
    dateOfBirth: new Date('2016-11-05'),
    gender: 'Male',
    parentName: 'Ramesh Patel',
    parentPhone: '+91-9876543216',
    parentEmail: 'ramesh.patel@email.com',
    address: {
      street: '321 Garden Road',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380001',
      country: 'India'
    },
    applyingForClass: '3',
    academicYear: '2024-2025',
    previousSchool: 'St. Xavier\'s School',
    documents: {
      birthCertificate: true,
      transferCertificate: true,
      reportCard: true,
      addressProof: true,
      parentIdProof: true
    },
    status: 'Rejected',
    admissionFee: 35000,
    priority: 'Low',
    rejectionReason: 'Class capacity full for current academic year',
    emergencyContact: {
      name: 'Meera Patel',
      relationship: 'Mother',
      phone: '+91-9876543217'
    },
    reapplicationEligible: true
  },
  {
    studentName: 'Ananya Sharma',
    dateOfBirth: new Date('2018-06-18'),
    gender: 'Female',
    parentName: 'Vikram Sharma',
    parentPhone: '+91-9876543218',
    parentEmail: 'vikram.sharma@email.com',
    address: {
      street: '654 Rose Garden',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411001',
      country: 'India'
    },
    applyingForClass: '1',
    academicYear: '2024-2025',
    previousSchool: 'Pune International School',
    documents: {
      birthCertificate: true,
      transferCertificate: true,
      reportCard: true,
      addressProof: true,
      parentIdProof: true
    },
    status: 'Waitlisted',
    admissionFee: 25000,
    priority: 'Medium',
    waitlistPosition: 3,
    waitlistDate: new Date('2024-11-10'),
    emergencyContact: {
      name: 'Rekha Sharma',
      relationship: 'Mother',
      phone: '+91-9876543219'
    },
    transportRequired: true,
    transportRoute: 'Koregaon Park'
  },
  {
    studentName: 'Aditya Verma',
    dateOfBirth: new Date('2017-04-12'),
    gender: 'Male',
    parentName: 'Suresh Verma',
    parentPhone: '+91-9876543220',
    parentEmail: 'suresh.verma@email.com',
    address: {
      street: '987 Hill Station',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500001',
      country: 'India'
    },
    applyingForClass: '2',
    academicYear: '2024-2025',
    previousSchool: 'Hyderabad Public School',
    documents: {
      birthCertificate: true,
      transferCertificate: true,
      reportCard: true,
      addressProof: true,
      parentIdProof: true
    },
    status: 'Pending',
    admissionFee: 30000,
    priority: 'High',
    medicalConditions: 'Mild asthma - requires inhaler',
    emergencyContact: {
      name: 'Sunita Verma',
      relationship: 'Mother',
      phone: '+91-9876543221'
    },
    interviewScheduled: true,
    interviewDate: new Date('2024-12-20T14:00:00Z')
  },
  {
    studentName: 'Ishita Reddy',
    dateOfBirth: new Date('2019-09-30'),
    gender: 'Female',
    parentName: 'Krishna Reddy',
    parentPhone: '+91-9876543222',
    parentEmail: 'krishna.reddy@email.com',
    address: {
      street: '147 Tech Park',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      country: 'India'
    },
    applyingForClass: 'UKG',
    academicYear: '2024-2025',
    documents: {
      birthCertificate: true,
      transferCertificate: false,
      reportCard: false,
      addressProof: true,
      parentIdProof: true
    },
    status: 'Under Review',
    admissionFee: 22000,
    priority: 'Medium',
    emergencyContact: {
      name: 'Lakshmi Reddy',
      relationship: 'Mother',
      phone: '+91-9876543223'
    },
    testScore: 92,
    testDate: new Date('2024-11-25')
  },
  {
    studentName: 'Reyansh Gupta',
    dateOfBirth: new Date('2016-12-03'),
    gender: 'Male',
    parentName: 'Amit Gupta',
    parentPhone: '+91-9876543224',
    parentEmail: 'amit.gupta@email.com',
    address: {
      street: '258 Business District',
      city: 'Kolkata',
      state: 'West Bengal',
      zipCode: '700001',
      country: 'India'
    },
    applyingForClass: '3',
    academicYear: '2024-2025',
    previousSchool: 'Kolkata International School',
    documents: {
      birthCertificate: true,
      transferCertificate: true,
      reportCard: true,
      addressProof: true,
      parentIdProof: true
    },
    status: 'Approved',
    admissionFee: 35000,
    feePaid: true,
    feePaymentDate: new Date('2024-11-28'),
    enrollmentDate: new Date('2024-12-01'),
    priority: 'High',
    emergencyContact: {
      name: 'Pooja Gupta',
      relationship: 'Mother',
      phone: '+91-9876543225'
    },
    hostelRequired: true
  }
];

async function addSampleAdmissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutool');
    console.log('Connected to MongoDB');

    // Clear existing admissions
    await Admission.deleteMany({});
    console.log('Cleared existing admissions');

    // Get a staff member to assign as reviewer
    const staffMember = await Staff.findOne({ role: 'Principal' });
    const reviewerId = staffMember ? staffMember._id : null;

    // Add sample admissions
    const admissionsWithReviewer = sampleAdmissions.map(admission => ({
      ...admission,
      reviewedBy: reviewerId,
      createdBy: reviewerId
    }));

    const result = await Admission.insertMany(admissionsWithReviewer);
    console.log(`✅ Added ${result.length} sample admissions`);

    // Display summary
    const stats = await Admission.getAdmissionStats();
    console.log('\n📊 Admission Statistics:');
    console.log(`Total Applications: ${stats.total}`);
    console.log(`Pending: ${stats.pending}`);
    console.log(`Approved: ${stats.approved}`);
    console.log(`Rejected: ${stats.rejected}`);

    const byClass = await Admission.getAdmissionsByClass();
    console.log('\n📚 Applications by Class:');
    byClass.forEach(item => {
      console.log(`${item._id}: ${item.total} total (${item.pending} pending, ${item.approved} approved, ${item.rejected} rejected)`);
    });

    console.log('\n✅ Sample admissions added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample admissions:', error);
    process.exit(1);
  }
}

addSampleAdmissions(); 