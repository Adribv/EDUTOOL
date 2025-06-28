const mongoose = require('mongoose');
const ApprovalRequest = require('./models/Staff/HOD/approvalRequest.model');

// Connect to MongoDB
mongoose.connect('mongodb+srv://edurays:edurays123@ac-l2bmyna-shard-00-00.uno4ffz.mongodb.net/edurays?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixApprovalRequests() {
  try {
    console.log('🔍 Checking approval requests...');
    
    // Find all approval requests
    const approvals = await ApprovalRequest.find({});
    console.log(`Found ${approvals.length} approval requests`);
    
    for (const approval of approvals) {
      console.log(`\n📋 Approval ID: ${approval._id}`);
      console.log(`Type: ${approval.requestType}`);
      console.log(`Title: ${approval.title}`);
      console.log(`RequestData:`, approval.requestData);
      
      // If requestData is missing or empty, we need to fix it
      if (!approval.requestData || Object.keys(approval.requestData).length === 0) {
        console.log('❌ Missing requestData - this approval request needs to be recreated');
        
        // For now, let's just log the issue
        // In a real scenario, you might want to delete these and recreate them
        console.log('⚠️  This approval request cannot be processed until requestData is added');
      } else {
        console.log('✅ Has requestData');
      }
    }
    
    console.log('\n🎯 Summary:');
    const missingData = approvals.filter(a => !a.requestData || Object.keys(a.requestData).length === 0);
    console.log(`Approval requests missing data: ${missingData.length}`);
    console.log(`Approval requests with data: ${approvals.length - missingData.length}`);
    
  } catch (error) {
    console.error('Error fixing approval requests:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixApprovalRequests(); 