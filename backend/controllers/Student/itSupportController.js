const ITSupportRequest = require('../../models/ITSupportRequest/itSupportRequestModel');
const Student = require('../../models/Student/studentModel');
const Staff = require('../../models/Staff/staffModel');

// Create a new IT support request
exports.createITSupportRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    // Accept any authenticated user
    let requester = await Student.findById(requesterId);
    let requesterType = 'Student';
    if (!requester) {
      requester = await Staff.findById(requesterId);
      requesterType = 'Staff';
    }
    if (!requester) {
      // Fallback: allow submission with minimal info
      requester = { name: req.body.requesterInfo?.name || 'Unknown', email: req.body.requesterInfo?.emailAddress || '' };
    }
    const {
      requesterInfo,
      deviceEquipmentInfo,
      issueDescription,
      priorityLevel,
      requestedAction,
      preferredContactTime,
      requesterSignature,
      dateOfRequest
    } = req.body;
    // Validate required fields
    if (!issueDescription || !priorityLevel || !requestedAction) {
      return res.status(400).json({ 
        message: 'Missing required fields: issueDescription, priorityLevel, requestedAction' 
      });
    }
    // Create the IT support request
    const itSupportRequest = new ITSupportRequest({
      dateOfRequest: dateOfRequest || new Date(),
      requesterInfo: requesterInfo || {
        name: requester.name,
        designationRole: requester.role || 'Staff',
        departmentClass: requester.department || '',
        contactNumber: requester.contactNumber || requester.phone || '',
        emailAddress: requester.email
      },
      deviceEquipmentInfo: deviceEquipmentInfo || {
        typeOfDevice: 'Other',
        deviceAssetId: '',
        operatingSystem: '',
        otherDeviceType: ''
      },
      issueDescription,
      priorityLevel,
      requestedAction,
      preferredContactTime: preferredContactTime || '',
      acknowledgment: {
        confirmed: true,
        date: new Date()
      },
      requesterSignature: requesterSignature || requester.name,
      requesterId,
      requesterType,
      status: 'Submitted'
    });
    console.log('About to save IT support request for:', requesterType, requesterId);
    await itSupportRequest.save();
    console.log('IT support request saved successfully with number:', itSupportRequest.requestNumber);
    res.status(201).json({
      success: true,
      message: 'IT Support Request submitted successfully',
      data: {
        requestNumber: itSupportRequest.requestNumber,
        request: itSupportRequest
      }
    });
  } catch (error) {
    console.error('Error creating IT support request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit IT support request',
      error: error.message 
    });
  }
};

// Get all IT support requests for the logged-in user
exports.getMyITSupportRequests = async (req, res) => {
  try {
    const requesterId = req.user.id;
    // Allow both students and staff to view their own requests
    const requests = await ITSupportRequest.find({ requesterId }).sort({ dateOfRequest: -1 });
    res.json({
      success: true,
      message: 'IT Support Requests retrieved successfully',
      data: requests
    });
  } catch (error) {
    console.error('Error retrieving IT support requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve IT support requests',
      error: error.message 
    });
  }
};

// Get a specific IT support request by ID
exports.getITSupportRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const request = await ITSupportRequest.findOne({
      _id: requestId,
      requesterId: userId
    });
    if (!request) {
      return res.status(404).json({ message: 'IT Support Request not found' });
    }
    res.json({
      message: 'IT Support Request retrieved successfully',
      request
    });
  } catch (error) {
    console.error('Error retrieving IT support request:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve IT support request',
      error: error.message 
    });
  }
};

// Update an IT support request (allow IT/admin/teacher to update any request by ID)
exports.updateITSupportRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    // Find by ID only (no requester restriction)
    const request = await ITSupportRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'IT Support Request not found' });
    }
    // Allow updating status and reply
    const { status, reply } = req.body;
    if (status) request.status = status;
    if (reply !== undefined) request.reply = reply;
    // Optionally allow updating actionTaken for legacy support
    if (req.body.itDepartmentUse && req.body.itDepartmentUse.actionTaken) {
      request.itDepartmentUse = request.itDepartmentUse || {};
      request.itDepartmentUse.actionTaken = req.body.itDepartmentUse.actionTaken;
    }
    request.updatedAt = new Date();
    await request.save();
    res.json({
      message: 'IT Support Request updated successfully',
      request
    });
  } catch (error) {
    console.error('Error updating IT support request:', error);
    res.status(500).json({ 
      message: 'Failed to update IT support request',
      error: error.message 
    });
  }
};

// Delete an IT support request (only if status is 'Submitted')
exports.deleteITSupportRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const studentId = req.user.id;

    const request = await ITSupportRequest.findOne({
      _id: requestId,
      requesterId: studentId,
      requesterType: 'Student'
    });

    if (!request) {
      return res.status(404).json({ message: 'IT Support Request not found' });
    }

    // Only allow deletion if status is 'Submitted'
    if (request.status !== 'Submitted') {
      return res.status(400).json({ 
        message: 'Cannot delete request that has been processed by IT department' 
      });
    }

    await ITSupportRequest.findByIdAndDelete(requestId);

    res.json({
      message: 'IT Support Request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting IT support request:', error);
    res.status(500).json({ 
      message: 'Failed to delete IT support request',
      error: error.message 
    });
  }
};

// Get request statistics for the student or staff
exports.getITSupportStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await ITSupportRequest.aggregate([
      {
        $match: {
          requesterId: userId
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    const totalRequests = await ITSupportRequest.countDocuments({ requesterId: userId });
    const statsObject = {
      total: totalRequests,
      submitted: 0,
      received: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    };
    stats.forEach(stat => {
      const status = stat._id.toLowerCase().replace(' ', '');
      if (statsObject.hasOwnProperty(status)) {
        statsObject[status] = stat.count;
      }
    });
    res.json({
      message: 'IT Support Request statistics retrieved successfully',
      stats: statsObject
    });
  } catch (error) {
    console.error('Error retrieving IT support stats:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve IT support statistics',
      error: error.message 
    });
  }
}; 

exports.getAllITSupportRequests = async (req, res) => {
  try {
    const requests = await ITSupportRequest.find().sort({ dateOfRequest: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 