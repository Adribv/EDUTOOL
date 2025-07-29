const mongoose = require('mongoose');
const DelegationAuthorityNotice = require('./models/Staff/DelegationAuthorityNotice');
const Staff = require('./models/Staff/staffModel');
const Department = require('./models/Staff/HOD/department.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testDelegationAuthority() {
  try {
    console.log('🧪 Testing Delegation Authority Notice functionality...');

    // Test 1: Create a sample delegation notice
    console.log('\n1. Creating sample delegation notice...');
    
    const sampleNotice = new DelegationAuthorityNotice({
      title: 'Test Delegation Authority Notice',
      delegatorName: 'John Principal',
      delegatorPosition: 'Principal',
      delegatorDepartment: 'Administration',
      delegatorId: new mongoose.Types.ObjectId(),
      delegateName: 'Jane HOD',
      delegatePosition: 'Head of Department',
      delegateDepartment: 'Mathematics',
      delegateId: new mongoose.Types.ObjectId(),
      delegationType: 'Temporary',
      authorityScope: 'Academic decision making for Mathematics department',
      responsibilities: 'Oversee curriculum planning, teacher evaluations, and student assessments',
      limitations: 'Cannot make financial decisions or hire/fire staff',
      effectiveDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      conditions: 'Must report weekly to Principal',
      reportingStructure: 'Reports directly to Principal',
      emergencyContact: 'Emergency contact details',
      status: 'Draft',
      createdBy: new mongoose.Types.ObjectId(),
      updatedBy: new mongoose.Types.ObjectId()
    });

    await sampleNotice.save();
    console.log('✅ Sample delegation notice created successfully');

    // Test 2: Test approval workflow
    console.log('\n2. Testing approval workflow...');
    
    sampleNotice.status = 'Pending';
    await sampleNotice.save();
    console.log('✅ Status changed to Pending');

    // Test 3: Test approval
    console.log('\n3. Testing approval...');
    
    await sampleNotice.approve(new mongoose.Types.ObjectId(), 'Approved for testing');
    console.log('✅ Delegation notice approved successfully');

    // Test 4: Test virtual properties
    console.log('\n4. Testing virtual properties...');
    console.log('Is Active:', sampleNotice.isActive);
    console.log('Is Expired:', sampleNotice.isExpired);

    // Test 5: Test static methods
    console.log('\n5. Testing static methods...');
    
    const activeDelegations = await DelegationAuthorityNotice.getActiveDelegations();
    console.log('Active delegations count:', activeDelegations.length);

    const pendingNotices = await DelegationAuthorityNotice.getPendingApprovals();
    console.log('Pending notices count:', pendingNotices.length);

    // Test 6: Test instance methods
    console.log('\n6. Testing instance methods...');
    console.log('Can be approved:', sampleNotice.canBeApproved());
    console.log('Can be rejected:', sampleNotice.canBeRejected());
    console.log('Can be revoked:', sampleNotice.canBeRevoked());

    // Test 7: Test summary
    console.log('\n7. Testing summary...');
    const summary = sampleNotice.getSummary();
    console.log('Summary:', summary);

    // Test 8: Test rejection
    console.log('\n8. Testing rejection...');
    
    // Create another notice for rejection test
    const rejectNotice = new DelegationAuthorityNotice({
      title: 'Test Rejection Notice',
      delegatorName: 'John Principal',
      delegatorPosition: 'Principal',
      delegatorDepartment: 'Administration',
      delegatorId: new mongoose.Types.ObjectId(),
      delegateName: 'Bob Teacher',
      delegatePosition: 'Teacher',
      delegateDepartment: 'Science',
      delegateId: new mongoose.Types.ObjectId(),
      delegationType: 'Project-based',
      authorityScope: 'Science lab management',
      responsibilities: 'Manage science lab equipment and experiments',
      limitations: 'Limited to lab management only',
      effectiveDate: new Date(),
      status: 'Pending',
      createdBy: new mongoose.Types.ObjectId(),
      updatedBy: new mongoose.Types.ObjectId()
    });

    await rejectNotice.save();
    await rejectNotice.reject(new mongoose.Types.ObjectId(), 'Rejected for testing purposes');
    console.log('✅ Delegation notice rejected successfully');

    // Test 9: Test revocation
    console.log('\n9. Testing revocation...');
    
    // Create another notice for revocation test
    const revokeNotice = new DelegationAuthorityNotice({
      title: 'Test Revocation Notice',
      delegatorName: 'John Principal',
      delegatorPosition: 'Principal',
      delegatorDepartment: 'Administration',
      delegatorId: new mongoose.Types.ObjectId(),
      delegateName: 'Alice Admin',
      delegatePosition: 'Administrator',
      delegateDepartment: 'IT',
      delegateId: new mongoose.Types.ObjectId(),
      delegationType: 'Permanent',
      authorityScope: 'IT system management',
      responsibilities: 'Manage IT systems and network',
      limitations: 'Cannot access student personal data',
      effectiveDate: new Date(),
      status: 'Active',
      createdBy: new mongoose.Types.ObjectId(),
      updatedBy: new mongoose.Types.ObjectId()
    });

    await revokeNotice.save();
    await revokeNotice.revoke(new mongoose.Types.ObjectId(), 'Revoked for testing purposes');
    console.log('✅ Delegation notice revoked successfully');

    // Test 10: Test statistics
    console.log('\n10. Testing statistics...');
    
    const [
      totalNotices,
      pendingNoticesCount,
      approvedNoticesCount,
      activeNoticesCount,
      expiredNoticesCount,
      rejectedNoticesCount
    ] = await Promise.all([
      DelegationAuthorityNotice.countDocuments(),
      DelegationAuthorityNotice.countDocuments({ status: 'Pending' }),
      DelegationAuthorityNotice.countDocuments({ status: 'Approved' }),
      DelegationAuthorityNotice.countDocuments({ status: 'Active' }),
      DelegationAuthorityNotice.countDocuments({ status: 'Expired' }),
      DelegationAuthorityNotice.countDocuments({ status: 'Rejected' })
    ]);

    console.log('Total notices:', totalNotices);
    console.log('Pending notices:', pendingNoticesCount);
    console.log('Approved notices:', approvedNoticesCount);
    console.log('Active notices:', activeNoticesCount);
    console.log('Expired notices:', expiredNoticesCount);
    console.log('Rejected notices:', rejectedNoticesCount);

    console.log('\n🎉 All delegation authority notice tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up test data
    await DelegationAuthorityNotice.deleteMany({ title: { $regex: /^Test/ } });
    console.log('\n🧹 Test data cleaned up');
    
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDelegationAuthority(); 