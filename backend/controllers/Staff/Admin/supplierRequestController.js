const SupplierRequest = require('../../../models/Admin/supplierRequestModel');
const Staff = require('../../../models/Staff/staffModel');
const Department = require('../../../models/Staff/HOD/department.model');

// Get all supplier requests with filtering and pagination
exports.getAllSupplierRequests = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      department,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (department) query.department = department;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requestNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const requests = await SupplierRequest.find(query)
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupplierRequest.countDocuments(query);

    res.json({
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching supplier requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get supplier request by ID
exports.getSupplierRequestById = async (req, res) => {
  try {
    const request = await SupplierRequest.findById(req.params.id)
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('department', 'name')
      .populate('notes.addedBy', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Supplier request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching supplier request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new supplier request
exports.createSupplierRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      items,
      priority,
      department,
      expectedDeliveryDate,
      supplier,
      budget,
      tags,
      isRecurring,
      recurringSchedule
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !items || items.length === 0) {
      return res.status(400).json({ 
        message: 'Title, description, category, and items are required' 
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.name || !item.quantity || !item.unit) {
        return res.status(400).json({ 
          message: 'Each item must have name, quantity, and unit' 
        });
      }
    }

    const request = new SupplierRequest({
      title,
      description,
      category,
      items,
      priority: priority || 'Medium',
      department,
      expectedDeliveryDate,
      supplier,
      budget,
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringSchedule,
      requestedBy: req.user.id,
      status: 'Draft'
    });

    await request.save();

    res.status(201).json({
      message: 'Supplier request created successfully',
      request
    });
  } catch (error) {
    console.error('Error creating supplier request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update supplier request
exports.updateSupplierRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const updateData = req.body;

    // Only allow certain status transitions
    const request = await SupplierRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Supplier request not found' });
    }

    // If status is being updated to 'Approved', set approvedBy and approvedAt
    if (updateData.status === 'Approved' && request.status !== 'Approved') {
      updateData.approvedBy = req.user.id;
      updateData.approvedAt = new Date();
    }

    // If status is being updated to 'Completed', set actualDeliveryDate
    if (updateData.status === 'Completed' && request.status !== 'Completed') {
      updateData.actualDeliveryDate = new Date();
    }

    const updatedRequest = await SupplierRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true, runValidators: true }
    ).populate('requestedBy', 'name email')
     .populate('approvedBy', 'name email')
     .populate('department', 'name');

    res.json({
      message: 'Supplier request updated successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error updating supplier request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete supplier request
exports.deleteSupplierRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    
    const request = await SupplierRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Supplier request not found' });
    }

    // Only allow deletion of draft requests
    if (request.status !== 'Draft') {
      return res.status(400).json({ 
        message: 'Only draft requests can be deleted' 
      });
    }

    await SupplierRequest.findByIdAndDelete(requestId);

    res.json({ message: 'Supplier request deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add note to supplier request
exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;
    const requestId = req.params.id;

    if (!note) {
      return res.status(400).json({ message: 'Note is required' });
    }

    const request = await SupplierRequest.findByIdAndUpdate(
      requestId,
      {
        $push: {
          notes: {
            note,
            addedBy: req.user.id
          }
        }
      },
      { new: true }
    ).populate('requestedBy', 'name email')
     .populate('approvedBy', 'name email')
     .populate('department', 'name')
     .populate('notes.addedBy', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Supplier request not found' });
    }

    res.json({
      message: 'Note added successfully',
      request
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get supplier request statistics
exports.getSupplierRequestStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      totalRequests,
      draftRequests,
      submittedRequests,
      approvedRequests,
      completedRequests,
      urgentRequests,
      highPriorityRequests
    ] = await Promise.all([
      SupplierRequest.countDocuments(query),
      SupplierRequest.countDocuments({ ...query, status: 'Draft' }),
      SupplierRequest.countDocuments({ ...query, status: 'Submitted' }),
      SupplierRequest.countDocuments({ ...query, status: 'Approved' }),
      SupplierRequest.countDocuments({ ...query, status: 'Completed' }),
      SupplierRequest.countDocuments({ ...query, priority: 'Urgent' }),
      SupplierRequest.countDocuments({ ...query, priority: 'High' })
    ]);

    // Get total estimated cost
    const totalEstimatedCost = await SupplierRequest.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalEstimatedCost' }
        }
      }
    ]);

    // Get requests by category
    const requestsByCategory = await SupplierRequest.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCost: { $sum: '$totalEstimatedCost' }
        }
      }
    ]);

    res.json({
      totalRequests,
      draftRequests,
      submittedRequests,
      approvedRequests,
      completedRequests,
      urgentRequests,
      highPriorityRequests,
      totalEstimatedCost: totalEstimatedCost[0]?.total || 0,
      requestsByCategory
    });
  } catch (error) {
    console.error('Error fetching supplier request statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit supplier request for approval
exports.submitForApproval = async (req, res) => {
  try {
    const requestId = req.params.id;

    const request = await SupplierRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Supplier request not found' });
    }

    if (request.status !== 'Draft') {
      return res.status(400).json({ 
        message: 'Only draft requests can be submitted for approval' 
      });
    }

    request.status = 'Submitted';
    await request.save();

    res.json({
      message: 'Supplier request submitted for approval successfully',
      request
    });
  } catch (error) {
    console.error('Error submitting supplier request:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 