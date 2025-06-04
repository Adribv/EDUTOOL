const TeacherProfile = require('../../../models/Staff/Teacher/teacherProfile.model');
const Staff = require('../../../models/Staff/staffModel');
const upload = require('../../../middlewares/uploadMiddleware');

// Get teacher profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ staffId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update teacher profile
exports.updateProfile = async (req, res) => {
  try {
    const { contactInfo, qualifications, certifications } = req.body;
    
    let profile = await TeacherProfile.findOne({ staffId: req.user.id });
    
    if (!profile) {
      profile = new TeacherProfile({
        staffId: req.user.id,
        contactInfo,
        qualifications,
        certifications
      });
    } else {
      profile.contactInfo = contactInfo || profile.contactInfo;
      profile.qualifications = qualifications || profile.qualifications;
      profile.certifications = certifications || profile.certifications;
    }
    
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add professional development document
exports.addProfessionalDevelopment = async (req, res) => {
  try {
    const { title, description, completionDate } = req.body;
    const documentUrl = req.file ? req.file.path : '';
    
    const profile = await TeacherProfile.findOne({ staffId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    profile.professionalDevelopment.push({
      title,
      description,
      completionDate,
      documentUrl
    });
    
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};