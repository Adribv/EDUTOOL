const DepartmentResource = require('../../../models/Staff/HOD/departmentResource.model');
const Department = require('../../../models/Staff/HOD/department.model');

// Add a new department resource
exports.addResource = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      resourceType, 
      quantity, 
      status, 
      location, 
      acquisitionDate, 
      expiryDate, 
      cost 
    } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          name: file.originalname,
          fileUrl: `/uploads/department-resources/${file.filename}`
        });
      });
    }
    
    const resource = new DepartmentResource({
      departmentId: department._id,
      title,
      description,
      resourceType,
      quantity: quantity || 1,
      status: status || 'Available',
      location,
      acquisitionDate,
      expiryDate,
      cost,
      attachments,
      addedBy: req.user.id
    });
    
    await resource.save();
    res.status(201).json({ message: 'Resource added successfully', resource });
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all department resources
exports.getDepartmentResources = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const resources = await DepartmentResource.find({ departmentId: department._id })
      .sort({ createdAt: -1 });
    
    res.json(resources);
  } catch (error) {
    console.error('Error fetching department resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a resource
exports.updateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { 
      title, 
      description, 
      resourceType, 
      quantity, 
      status, 
      location, 
      expiryDate, 
      cost 
    } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const resource = await DepartmentResource.findOne({
      _id: resourceId,
      departmentId: department._id
    });
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Update fields
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (resourceType) resource.resourceType = resourceType;
    if (quantity) resource.quantity = quantity;
    if (status) resource.status = status;
    if (location) resource.location = location;
    if (expiryDate) resource.expiryDate = expiryDate;
    if (cost) resource.cost = cost;
    
    // Add new attachments if any
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        resource.attachments.push({
          name: file.originalname,
          fileUrl: `/uploads/department-resources/${file.filename}`,
          uploadDate: new Date()
        });
      });
    }
    
    await resource.save();
    res.json({ message: 'Resource updated successfully', resource });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a resource
exports.deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const resource = await DepartmentResource.findOne({
      _id: resourceId,
      departmentId: department._id
    });
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    await resource.remove();
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get resource by ID
exports.getResourceById = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const resource = await DepartmentResource.findOne({
      _id: resourceId,
      departmentId: department._id
    });
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};