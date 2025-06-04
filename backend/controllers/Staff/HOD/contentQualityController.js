const Department = require('../../../models/Staff/HOD/department.model');
const Resource = require('../../../models/Staff/Teacher/resource.model');
const DepartmentResource = require('../../../models/Staff/HOD/departmentResource.model');
const Staff = require('../../../models/Staff/staffModel');

// Get all resources for review
exports.getResourcesForReview = async (req, res) => {
  try {
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    }, '_id');
    
    const teacherIds = teachers.map(teacher => teacher._id);
    
    // Get resources submitted by department teachers
    const resources = await Resource.find({
      createdBy: { $in: teacherIds },
      status: 'Pending Review'
    }).populate('createdBy', 'name email').sort({ createdAt: -1 });
    
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources for review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Review a resource
exports.reviewResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { status, feedback, isApprovedForSchoolWide } = req.body;
    
    const resource = await Resource.findById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if teacher belongs to this department
    if (!department.teachers.includes(resource.createdBy)) {
      return res.status(403).json({ message: 'Teacher does not belong to your department' });
    }
    
    // Update resource status
    resource.status = status;
    resource.feedback = feedback;
    resource.reviewedBy = req.user.id;
    resource.reviewedAt = new Date();
    resource.isApprovedForSchoolWide = isApprovedForSchoolWide || false;
    
    await resource.save();
    
    // If approved for school-wide use, add to department resources
    if (status === 'Approved' && isApprovedForSchoolWide) {
      const departmentResource = new DepartmentResource({
        departmentId: department._id,
        title: resource.title,
        description: resource.description,
        resourceType: 'Other',
        status: 'Available',
        attachments: [{
          name: resource.title,
          fileUrl: resource.fileUrl
        }],
        addedBy: req.user.id
      });
      
      await departmentResource.save();
    }
    
    res.json({ 
      message: 'Resource reviewed successfully', 
      resource,
      addedToDepartmentResources: status === 'Approved' && isApprovedForSchoolWide
    });
  } catch (error) {
    console.error('Error reviewing resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get department resource repository
exports.getDepartmentResourceRepository = async (req, res) => {
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

// Check teaching material consistency
exports.checkMaterialConsistency = async (req, res) => {
  try {
    const { subject, class: cls } = req.params;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Get all teachers in department
    const teachers = await Staff.find({ 
      _id: { $in: department.teachers },
      role: 'Teacher'
    }, '_id');
    
    const teacherIds = teachers.map(teacher => teacher._id);
    
    // Get resources for this subject and class
    const resources = await Resource.find({
      createdBy: { $in: teacherIds },
      subject,
      class: cls,
      status: 'Approved'
    }).populate('createdBy', 'name email');
    
    // Group resources by topic
    const resourcesByTopic = {};
    resources.forEach(resource => {
      if (!resourcesByTopic[resource.topic]) {
        resourcesByTopic[resource.topic] = [];
      }
      resourcesByTopic[resource.topic].push(resource);
    });
    
    // Check consistency
    const consistencyReport = {
      subject,
      class: cls,
      totalTopics: Object.keys(resourcesByTopic).length,
      topicsWithMultipleResources: 0,
      topicsWithConsistencyIssues: [],
      overallConsistency: 'Good'
    };
    
    for (const [topic, topicResources] of Object.entries(resourcesByTopic)) {
      if (topicResources.length > 1) {
        consistencyReport.topicsWithMultipleResources++;
        
        // Simple check: if resources are from different teachers, flag for review
        const teachers = new Set(topicResources.map(r => r.createdBy.toString()));
        if (teachers.size > 1) {
          consistencyReport.topicsWithConsistencyIssues.push({
            topic,
            resourceCount: topicResources.length,
            teacherCount: teachers.size,
            resources: topicResources.map(r => ({
              id: r._id,
              title: r.title,
              teacher: r.createdBy.name,
              createdAt: r.createdAt
            }))
          });
        }
      }
    }
    
    if (consistencyReport.topicsWithConsistencyIssues.length > 0) {
      consistencyReport.overallConsistency = 'Needs Review';
    }
    
    res.json(consistencyReport);
  } catch (error) {
    console.error('Error checking material consistency:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload department resource
exports.uploadDepartmentResource = async (req, res) => {
  try {
    const { title, description, resourceType, status } = req.body;
    
    // Get department
    const department = await Department.findOne({ headOfDepartment: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const departmentResource = new DepartmentResource({
      departmentId: department._id,
      title,
      description,
      resourceType: resourceType || 'Document',
      status: status || 'Available',
      attachments: [{
        name: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`
      }],
      addedBy: req.user.id
    });
    
    await departmentResource.save();
    
    res.status(201).json({ 
      message: 'Department resource uploaded successfully', 
      resource: departmentResource 
    });
  } catch (error) {
    console.error('Error uploading department resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Note: getDepartmentResources function already exists in the controller