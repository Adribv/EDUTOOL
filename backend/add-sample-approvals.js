const mongoose = require('mongoose');
const ApprovalRequest = require('./models/Staff/HOD/approvalRequest.model');
const Staff = require('./models/Staff/staffModel');
const Department = require('./models/Staff/HOD/department.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edutool', {
  useNewUrlUrlParser: true,
  useUnifiedTopology: true,
});

const addSampleApprovals = async () => {
  try {
    console.log('🚀 Starting to add sample approval requests...');

    // Get staff members for testing
    const staffMembers = await Staff.find().limit(5);
    const departments = await Department.find().limit(3);

    if (staffMembers.length === 0) {
      console.log('❌ No staff members found. Please add staff members first.');
      return;
    }

    if (departments.length === 0) {
      console.log('❌ No departments found. Please add departments first.');
      return;
    }

    // Clear existing approval requests
    await ApprovalRequest.deleteMany({});
    console.log('🧹 Cleared existing approval requests');

    // Sample approval requests
    const sampleApprovals = [
      {
        requesterId: staffMembers[0]._id,
        requestType: 'Event',
        title: 'Annual Science Fair 2024',
        description: 'Request to organize the annual science fair for all students. The event will showcase student projects and include guest speakers from the scientific community.',
        status: 'Pending',
        currentApprover: 'Principal',
        department: departments[0]._id,
        approvalHistory: [
          {
            approver: staffMembers[0]._id,
            role: 'Teacher',
            status: 'Approved',
            comments: 'Event details look comprehensive and well-planned',
            timestamp: new Date(Date.now() - 86400000) // 1 day ago
          },
          {
            approver: staffMembers[1]._id,
            role: 'HOD',
            status: 'Approved',
            comments: 'Approved by HOD - good educational value',
            timestamp: new Date(Date.now() - 43200000) // 12 hours ago
          }
        ]
      },
      {
        requesterId: staffMembers[1]._id,
        requestType: 'Announcement',
        title: 'Parent-Teacher Meeting Schedule',
        description: 'Request to announce the quarterly parent-teacher meeting schedule for all classes. This will include meeting times, venue details, and agenda.',
        status: 'Pending',
        currentApprover: 'Principal',
        department: departments[1]._id,
        approvalHistory: [
          {
            approver: staffMembers[1]._id,
            role: 'HOD',
            status: 'Approved',
            comments: 'Important communication for parents',
            timestamp: new Date(Date.now() - 7200000) // 2 hours ago
          }
        ]
      },
      {
        requesterId: staffMembers[2]._id,
        requestType: 'Fee',
        title: 'Laboratory Equipment Fee Increase',
        description: 'Request to increase laboratory equipment fees by 15% to cover new equipment costs and maintenance. This affects science and computer lab classes.',
        status: 'Pending',
        currentApprover: 'Principal',
        department: departments[0]._id,
        approvalHistory: [
          {
            approver: staffMembers[2]._id,
            role: 'Teacher',
            status: 'Approved',
            comments: 'Necessary for maintaining quality lab facilities',
            timestamp: new Date(Date.now() - 3600000) // 1 hour ago
          },
          {
            approver: staffMembers[0]._id,
            role: 'HOD',
            status: 'Approved',
            comments: 'Justified increase for better facilities',
            timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
          }
        ]
      },
      {
        requesterId: staffMembers[3]._id,
        requestType: 'Event',
        title: 'Sports Day Celebration',
        description: 'Request to organize a comprehensive sports day with various athletic events, cultural performances, and food stalls. Expected participation from all classes.',
        status: 'Pending',
        currentApprover: 'Principal',
        department: departments[2]._id,
        approvalHistory: [
          {
            approver: staffMembers[3]._id,
            role: 'Teacher',
            status: 'Approved',
            comments: 'Great initiative for student engagement',
            timestamp: new Date(Date.now() - 900000) // 15 minutes ago
          }
        ]
      },
      {
        requesterId: staffMembers[4]._id,
        requestType: 'Announcement',
        title: 'Exam Schedule Changes',
        description: 'Request to announce changes in the mid-term examination schedule due to unavoidable circumstances. New dates and timings need to be communicated.',
        status: 'Pending',
        currentApprover: 'Principal',
        department: departments[1]._id,
        approvalHistory: [
          {
            approver: staffMembers[4]._id,
            role: 'HOD',
            status: 'Approved',
            comments: 'Urgent announcement needed',
            timestamp: new Date(Date.now() - 300000) // 5 minutes ago
          }
        ]
      },
      {
        requesterId: staffMembers[0]._id,
        requestType: 'Event',
        title: 'Cultural Festival',
        description: 'Request to organize a week-long cultural festival featuring music, dance, drama, and art competitions. This will promote cultural awareness and student talent.',
        status: 'Approved',
        currentApprover: 'Completed',
        department: departments[2]._id,
        approvalHistory: [
          {
            approver: staffMembers[0]._id,
            role: 'Teacher',
            status: 'Approved',
            comments: 'Excellent cultural initiative',
            timestamp: new Date(Date.now() - 172800000) // 2 days ago
          },
          {
            approver: staffMembers[1]._id,
            role: 'HOD',
            status: 'Approved',
            comments: 'Great for student development',
            timestamp: new Date(Date.now() - 86400000) // 1 day ago
          },
          {
            approver: staffMembers[2]._id,
            role: 'Principal',
            status: 'Approved',
            comments: 'Approved - excellent cultural program',
            timestamp: new Date(Date.now() - 43200000) // 12 hours ago
          }
        ]
      },
      {
        requesterId: staffMembers[1]._id,
        requestType: 'Fee',
        title: 'Library Membership Fee',
        description: 'Request to introduce a new library membership fee for enhanced library services including digital resources and extended hours.',
        status: 'Rejected',
        currentApprover: 'Completed',
        department: departments[1]._id,
        approvalHistory: [
          {
            approver: staffMembers[1]._id,
            role: 'HOD',
            status: 'Approved',
            comments: 'Good for library development',
            timestamp: new Date(Date.now() - 259200000) // 3 days ago
          },
          {
            approver: staffMembers[2]._id,
            role: 'Principal',
            status: 'Rejected',
            comments: 'Library should remain free for all students',
            timestamp: new Date(Date.now() - 129600000) // 1.5 days ago
          }
        ]
      }
    ];

    // Add approval requests
    const savedApprovals = await ApprovalRequest.insertMany(sampleApprovals);
    console.log(`✅ Added ${savedApprovals.length} approval requests`);

    console.log('🎉 Sample approval requests added successfully!');

    // Display summary
    console.log('\n📊 Approval Requests Summary:');
    const pendingCount = savedApprovals.filter(a => a.status === 'Pending').length;
    const approvedCount = savedApprovals.filter(a => a.status === 'Approved').length;
    const rejectedCount = savedApprovals.filter(a => a.status === 'Rejected').length;

    console.log(`Pending: ${pendingCount}`);
    console.log(`Approved: ${approvedCount}`);
    console.log(`Rejected: ${rejectedCount}`);

    console.log('\n📋 Request Types:');
    const typeCounts = savedApprovals.reduce((acc, approval) => {
      acc[approval.requestType] = (acc[approval.requestType] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error adding sample approval requests:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

addSampleApprovals(); 