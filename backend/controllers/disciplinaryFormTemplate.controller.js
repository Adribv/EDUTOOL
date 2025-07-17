const DisciplinaryFormTemplate = require('../models/disciplinaryFormTemplate.model');
const DisciplinaryForm = require('../models/disciplinaryForm.model');
const mongoose = require('mongoose');

// Get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await DisciplinaryFormTemplate.find()
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
};

// Get active templates only
exports.getActiveTemplates = async (req, res) => {
  try {
    const templates = await DisciplinaryFormTemplate.find({ isActive: true })
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching active templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active templates',
      error: error.message
    });
  }
};

// Get default template
exports.getDefaultTemplate = async (req, res) => {
  try {
    let template = await DisciplinaryFormTemplate.findOne({ isDefault: true, isActive: true });
    
    // If no default template exists, create one
    if (!template) {
      const defaultData = DisciplinaryFormTemplate.getDefaultTemplate();
      template = new DisciplinaryFormTemplate({
        ...defaultData,
        createdBy: req.user.id || 'test-user-id',
        createdByName: req.user.name || 'Test User'
      });
      await template.save();
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching default template:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching default template',
      error: error.message
    });
  }
};

// Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await DisciplinaryFormTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message
    });
  }
};

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user.id || 'test-user-id',
      createdByName: req.user.name || 'Test User'
    };
    
    const template = new DisciplinaryFormTemplate(templateData);
    await template.save();
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: error.message
    });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const template = await DisciplinaryFormTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    // Update template with new data
    Object.assign(template, req.body);
    template.lastModifiedBy = req.user.id || 'test-user-id';
    template.lastModifiedByName = req.user.name || 'Test User';
    
    await template.save();
    
    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await DisciplinaryFormTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    // Check if template is being used
    const formsUsingTemplate = await DisciplinaryForm.countDocuments({ template: req.params.id });
    
    if (formsUsingTemplate > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete template. It is being used by ${formsUsingTemplate} form(s). Consider deactivating instead.`
      });
    }
    
    // Don't allow deletion of default template
    if (template.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the default template'
      });
    }
    
    await DisciplinaryFormTemplate.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
};

// Toggle template active status
exports.toggleTemplateStatus = async (req, res) => {
  try {
    const template = await DisciplinaryFormTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    template.isActive = !template.isActive;
    template.lastModifiedBy = req.user.id || 'test-user-id';
    template.lastModifiedByName = req.user.name || 'Test User';
    
    await template.save();
    
    res.status(200).json({
      success: true,
      message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`,
      data: template
    });
  } catch (error) {
    console.error('Error toggling template status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling template status',
      error: error.message
    });
  }
};

// Set template as default
exports.setAsDefaultTemplate = async (req, res) => {
  try {
    const template = await DisciplinaryFormTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    if (!template.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot set inactive template as default'
      });
    }
    
    // Remove default from all other templates
    await DisciplinaryFormTemplate.updateMany(
      { _id: { $ne: req.params.id } },
      { $set: { isDefault: false } }
    );
    
    // Set this template as default
    template.isDefault = true;
    template.lastModifiedBy = req.user.id || 'test-user-id';
    template.lastModifiedByName = req.user.name || 'Test User';
    
    await template.save();
    
    res.status(200).json({
      success: true,
      message: 'Template set as default successfully',
      data: template
    });
  } catch (error) {
    console.error('Error setting default template:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default template',
      error: error.message
    });
  }
};

// Clone template
exports.cloneTemplate = async (req, res) => {
  try {
    const originalTemplate = await DisciplinaryFormTemplate.findById(req.params.id);
    
    if (!originalTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    const clonedData = originalTemplate.toObject();
    delete clonedData._id;
    delete clonedData.createdAt;
    delete clonedData.updatedAt;
    delete clonedData.__v;
    
    // Update clone metadata
    clonedData.templateName = `${originalTemplate.templateName} (Copy)`;
    clonedData.isDefault = false;
    clonedData.isActive = true;
    clonedData.createdBy = req.user.id;
    clonedData.createdByName = req.user.name;
    clonedData.usageStats = { formsCreated: 0 };
    
    const clonedTemplate = new DisciplinaryFormTemplate(clonedData);
    await clonedTemplate.save();
    
    res.status(201).json({
      success: true,
      message: 'Template cloned successfully',
      data: clonedTemplate
    });
  } catch (error) {
    console.error('Error cloning template:', error);
    res.status(500).json({
      success: false,
      message: 'Error cloning template',
      error: error.message
    });
  }
};

// Get template usage statistics
exports.getTemplateStats = async (req, res) => {
  try {
    const templateId = req.params.id;
    
    // Get template
    const template = await DisciplinaryFormTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    // Get usage statistics
    const totalForms = await DisciplinaryForm.countDocuments({ template: templateId });
    const formsThisMonth = await DisciplinaryForm.countDocuments({
      template: templateId,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });
    
    const statusStats = await DisciplinaryForm.aggregate([
      { $match: { template: mongoose.Types.ObjectId(templateId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        template,
        usage: {
          totalForms,
          formsThisMonth,
          statusStats
        }
      }
    });
  } catch (error) {
    console.error('Error fetching template stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template statistics',
      error: error.message
    });
  }
}; 