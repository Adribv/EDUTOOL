const CounsellingRequest = require('../models/CounsellingRequest');

exports.createRequest = async (req, res) => {
  try {
    const request = new CounsellingRequest(req.body);
    await request.save();
    res.status(201).json({
      success: true,
      message: 'Counselling request created successfully',
      data: request
    });
  } catch (err) {
    console.error('Error creating counselling request:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { requesterId, requesterType } = req.query;
    let filter = {};
    
    if (requesterId) {
      filter.requesterId = requesterId;
    }
    
    if (requesterType) {
      filter.requesterType = requesterType;
    }
    
    const requests = await CounsellingRequest.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching counselling requests:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

exports.getRequestStats = async (req, res) => {
  try {
    const { requesterId, requesterType } = req.query;
    let filter = {};
    
    if (requesterId) {
      filter.requesterId = requesterId;
    }
    
    if (requesterType) {
      filter.requesterType = requesterType;
    }
    
    const stats = await CounsellingRequest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          pendingRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          approvedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, 1, 0]
            }
          },
          rejectedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Error fetching counselling request stats:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}; 