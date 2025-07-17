const TransportForm = require('../models/transportForm.model');
const Staff = require('../models/Staff/staffModel');
const PDFGenerator = require('../services/pdfGenerator');
const path = require('path');
const fs = require('fs').promises;

// Helper function to generate and store PDF
const generateAndStoreTransportPDF = async (formData, userId) => {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads/transport-pdfs');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Generate filename
    const timestamp = Date.now();
    const filename = `transport_form_${formData._id}_${timestamp}.pdf`;
    const filepath = path.join(uploadsDir, filename);
    
    // Generate PDF
    const result = await PDFGenerator.generateTransportFormPDF(formData, filepath);
    
    if (result.success) {
      return {
        filename: filename,
        originalName: `Transport_Form_${formData.studentFullName}_${new Date().toISOString().split('T')[0]}.pdf`,
        path: filepath,
        size: result.size,
        generatedAt: new Date(),
        generatedBy: userId
      };
    }
    
    return null;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return null;
  }
};

// Admin: Create new transport form
exports.createForm = async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate required fields
    const requiredFields = [
      'schoolName',
      'studentFullName', 
      'gradeClassSection',
      'rollNumber',
      'parentGuardianName',
      'contactNumber',
      'pickupDropAddress',
      'pickupLocation',
      'dropLocation',
      'dateRequiredFrom',
      'dateRequiredTo',
      'pickupTime',
      'dropTime',
      'tripType',
      'purposeOfTransportation'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Get admin/staff info
    const staff = await Staff.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    // Create new transport form
    const transportForm = new TransportForm({
      ...formData,
      createdBy: req.user.id,
      createdByName: staff.name,
      createdByRole: staff.role,
      status: 'pending'
    });
    
    await transportForm.save();
    
    // Generate PDF for the form
    const pdfData = await generateAndStoreTransportPDF(transportForm, req.user.id);
    if (pdfData) {
      transportForm.pdfFile = pdfData;
      await transportForm.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Transport form created successfully',
      data: transportForm
    });
  } catch (error) {
    console.error('Error creating transport form:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// Admin: Get all transport forms
exports.getAllForms = async (req, res) => {
  try {
    const { status, dateFrom, dateTo, studentName, rollNumber } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (studentName) query.studentFullName = { $regex: studentName, $options: 'i' };
    if (rollNumber) query.rollNumber = { $regex: rollNumber, $options: 'i' };
    
    if (dateFrom || dateTo) {
      query.dateRequiredFrom = {};
      if (dateFrom) query.dateRequiredFrom.$gte = new Date(dateFrom);
      if (dateTo) query.dateRequiredFrom.$lte = new Date(dateTo);
    }
    
    const forms = await TransportForm.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name role');
    
    res.json({
      success: true,
      data: forms
    });
  } catch (error) {
    console.error('Error fetching transport forms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get single transport form by ID
exports.getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await TransportForm.findById(id)
      .populate('createdBy', 'name role email');
    
    if (!form) {
      return res.status(404).json({ message: 'Transport form not found' });
    }
    
    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Error fetching transport form:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update transport form
exports.updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const form = await TransportForm.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Transport form not found' });
    }
    
    // Update form
    Object.assign(form, updateData);
    await form.save();
    
    res.json({
      message: 'Transport form updated successfully',
      form
    });
  } catch (error) {
    console.error('Error updating transport form:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete transport form
exports.deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const form = await TransportForm.findByIdAndDelete(id);
    if (!form) {
      return res.status(404).json({ message: 'Transport form not found' });
    }
    
    // Delete associated PDF file if exists
    if (form.pdfFile && form.pdfFile.path) {
      try {
        await fs.unlink(form.pdfFile.path);
      } catch (error) {
        console.error('Error deleting PDF file:', error);
      }
    }
    
    res.json({ message: 'Transport form deleted successfully' });
  } catch (error) {
    console.error('Error deleting transport form:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Approve/Reject transport form
exports.updateFormStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, coordinatorComments, assignedVehicle, assignedDriver, driverContact, estimatedCost } = req.body;
    
    const form = await TransportForm.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Transport form not found' });
    }
    
    form.status = status;
    form.coordinatorComments = coordinatorComments;
    form.assignedVehicle = assignedVehicle;
    form.assignedDriver = assignedDriver;
    form.driverContact = driverContact;
    form.estimatedCost = estimatedCost;
    
    if (status === 'approved') {
      form.approvedAt = new Date();
      form.coordinatorSignatureDate = new Date();
    }
    
    await form.save();
    
    res.json({
      message: `Transport form ${status} successfully`,
      form
    });
  } catch (error) {
    console.error('Error updating transport form status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get transport form statistics
exports.getFormStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const stats = await TransportForm.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get request type statistics
    const requestTypeStats = await TransportForm.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          requestTypes: { $objectToArray: '$requestType' }
        }
      },
      {
        $unwind: '$requestTypes'
      },
      {
        $match: {
          'requestTypes.k': { $ne: 'otherDescription' },
          'requestTypes.v': true
        }
      },
      {
        $group: {
          _id: '$requestTypes.k',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get total cost statistics
    const costStats = await TransportForm.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          actualCost: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$actualCost' },
          avgCost: { $avg: '$actualCost' },
          minCost: { $min: '$actualCost' },
          maxCost: { $max: '$actualCost' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        statusStats: stats,
        requestTypeStats,
        costStats: costStats[0] || { totalCost: 0, avgCost: 0, minCost: 0, maxCost: 0 },
        period,
        startDate,
        endDate: now
      }
    });
  } catch (error) {
    console.error('Error fetching transport form stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download PDF for a form
exports.downloadFormPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await TransportForm.findById(id);
    
    if (!form) {
      return res.status(404).json({ message: 'Transport form not found' });
    }
    
    // Check if PDF exists
    if (!form.pdfFile || !form.pdfFile.path) {
      return res.status(404).json({ message: 'PDF not found for this form' });
    }
    
    // Check if file exists on disk
    try {
      await fs.access(form.pdfFile.path);
    } catch (error) {
      return res.status(404).json({ message: 'PDF file not found on server' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${form.pdfFile.originalName}"`);
    
    // Stream the file
    const fileStream = require('fs').createReadStream(form.pdfFile.path);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate PDF on demand
exports.generateFormPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await TransportForm.findById(id);
    
    if (!form) {
      return res.status(404).json({ message: 'Transport form not found' });
    }
    
    // Generate PDF
    const pdfData = await generateAndStoreTransportPDF(form, req.user.id);
    
    if (!pdfData) {
      return res.status(500).json({ message: 'Failed to generate PDF' });
    }
    
    // Update form with PDF data
    form.pdfFile = pdfData;
    await form.save();
    
    res.json({
      message: 'PDF generated successfully',
      pdfInfo: {
        filename: pdfData.originalName,
        size: pdfData.size,
        generatedAt: pdfData.generatedAt
      }
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 