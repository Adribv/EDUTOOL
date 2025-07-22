const ITSupportRequest = require('../../models/ITSupportRequest/itSupportRequestModel');
const Student = require('../../models/Student/studentModel');
const Staff = require('../../models/Staff/staffModel');

// Create a new IT support request
exports.createITSupportRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { requesterType = 'Student' } = req.body;
    
    let requester;
    
    if (requesterType === 'Student') {
      requester = await Student.findById(requesterId);
      if (!requester) {
        return res.status(404).json({ message: 'Student not found' });
      }
    } else if (requesterType === 'Teacher') {
      requester = await Staff.findById(requesterId);
      if (!requester) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
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
        designationRole: requesterType === 'Student' ? 'Student' : requester.role || 'Teacher',
        departmentClass: requesterType === 'Student' 
          ? `${requester.class} - ${requester.section}` 
          : requester.department || '',
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
    const { requesterType = 'Student' } = req.query;
    
    const requests = await ITSupportRequest.find({
      requesterId,
      requesterType
    }).sort({ dateOfRequest: -1 });

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
    const studentId = req.user.id;

    const request = await ITSupportRequest.findOne({
      _id: requestId,
      requesterId: studentId,
      requesterType: 'Student'
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

// Update an IT support request (only if status is 'Submitted')
exports.updateITSupportRequest = async (req, res) => {
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

    // Only allow updates if status is 'Submitted'
    if (request.status !== 'Submitted') {
      return res.status(400).json({ 
        message: 'Cannot update request that has been processed by IT department' 
      });
    }

    const {
      deviceEquipmentInfo,
      issueDescription,
      priorityLevel,
      requestedAction,
      preferredContactTime
    } = req.body;

    // Update the fields
    if (deviceEquipmentInfo) {
      request.deviceEquipmentInfo = { ...request.deviceEquipmentInfo, ...deviceEquipmentInfo };
    }
    if (issueDescription) request.issueDescription = issueDescription;
    if (priorityLevel) request.priorityLevel = priorityLevel;
    if (requestedAction) request.requestedAction = requestedAction;
    if (preferredContactTime !== undefined) request.preferredContactTime = preferredContactTime;

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

// Get request statistics for the student
exports.getITSupportStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const stats = await ITSupportRequest.aggregate([
      {
        $match: {
          requesterId: studentId,
          requesterType: 'Student'
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRequests = await ITSupportRequest.countDocuments({
      requesterId: studentId,
      requesterType: 'Student'
    });

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