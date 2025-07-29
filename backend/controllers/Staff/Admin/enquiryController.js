const Enquiry = require('../../../models/Admin/enquiryModel');
const Staff = require('../../../models/Staff/staffModel');

// Get all enquiries with filtering and pagination
exports.getAllEnquiries = async (req, res) => {
  try {
    const {
      status,
      priority,
      enquiryType,
      assignedTo,
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
    if (enquiryType) query.enquiryType = enquiryType;
    if (assignedTo) query.assignedTo = assignedTo;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { enquiryNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const enquiries = await Enquiry.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Enquiry.countDocuments(query);

    res.json({
      enquiries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      enquiryType,
      priority,
      source,
      tags
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ 
        message: 'Name, email, phone, subject, and message are required' 
      });
    }

    const enquiry = new Enquiry({
      name,
      email,
      phone,
      subject,
      message,
      enquiryType: enquiryType || 'General',
      priority: priority || 'Medium',
      source: source || 'Website',
      tags: tags || [],
      createdBy: req.user?.id
    });

    await enquiry.save();

    res.status(201).json({
      message: 'Enquiry created successfully',
      enquiry
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update enquiry
exports.updateEnquiry = async (req, res) => {
  try {
    console.log('Update enquiry request params:', req.params);
    console.log('Update enquiry request body:', req.body);
    
    const enquiryId = req.params.id;
    
    if (!enquiryId) {
      return res.status(400).json({ message: 'Enquiry ID is required' });
    }
    
    console.log('Enquiry ID:', enquiryId);
    
    const updateData = req.body;

    // Add updatedBy field
    if (req.user?.id) {
      updateData.updatedBy = req.user.id;
    }

    // If status is being updated to 'Resolved', set resolvedDate
    if (updateData.status === 'Resolved' && !updateData.resolvedDate) {
      updateData.resolvedDate = new Date();
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('createdBy', 'name')
     .populate('updatedBy', 'name');

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json({
      message: 'Enquiry updated successfully',
      enquiry
    });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get enquiry statistics
exports.getEnquiryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [
      totalEnquiries,
      newEnquiries,
      inProgressEnquiries,
      resolvedEnquiries,
      closedEnquiries,
      urgentEnquiries,
      highPriorityEnquiries
    ] = await Promise.all([
      Enquiry.countDocuments(query),
      Enquiry.countDocuments({ ...query, status: 'New' }),
      Enquiry.countDocuments({ ...query, status: 'In Progress' }),
      Enquiry.countDocuments({ ...query, status: 'Resolved' }),
      Enquiry.countDocuments({ ...query, status: 'Closed' }),
      Enquiry.countDocuments({ ...query, priority: 'Urgent' }),
      Enquiry.countDocuments({ ...query, priority: 'High' })
    ]);

    res.json({
      totalEnquiries,
      newEnquiries,
      inProgressEnquiries,
      resolvedEnquiries,
      closedEnquiries,
      urgentEnquiries,
      highPriorityEnquiries
    });
  } catch (error) {
    console.error('Error fetching enquiry statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 

// Bulk import enquiries
exports.bulkImportEnquiries = async (req, res) => {
  try {
    const { enquiries } = req.body;
    if (!Array.isArray(enquiries) || enquiries.length === 0) {
      return res.status(400).json({ message: 'Enquiries array is required and cannot be empty' });
    }
    const results = {
      successful: [],
      failed: [],
      total: enquiries.length
    };
    for (const enquiryData of enquiries) {
      try {
        const {
          name,
          email,
          phone,
          subject,
          message,
          enquiryType = 'General',
          priority = 'Medium',
          source = 'Website',
          tags = [],
          assignedTo
        } = enquiryData;
        if (!name || !email || !phone || !subject || !message) {
          results.failed.push({ ...enquiryData, error: 'Missing required fields' });
          continue;
        }
        const newEnquiry = new Enquiry({
          name,
          email,
          phone,
          subject,
          message,
          enquiryType,
          priority,
          source,
          tags,
          assignedTo
        });
        await newEnquiry.save();
        results.successful.push({ ...enquiryData, _id: newEnquiry._id });
      } catch (error) {
        results.failed.push({ ...enquiryData, error: error.message || 'Unknown error' });
      }
    }
    res.status(200).json({
      message: `Bulk import completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during bulk import' });
  }
}; 