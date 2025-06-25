const Staff = require('../../../models/Staff/staffModel');
const bcrypt = require('bcryptjs');

// Get Vice Principal profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await Staff.findById(req.user.id)
      .select('-password')
      .populate('department', 'name');
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Vice Principal profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    const profile = await Staff.findById(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Check if email is already taken by another user
    if (email && email !== profile.email) {
      const existingUser = await Staff.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }
    
    // Update profile fields
    if (name) profile.name = name;
    if (email) profile.email = email;
    if (phone) profile.phone = phone;
    if (address) profile.address = address;
    
    await profile.save();
    
    const updatedProfile = await Staff.findById(profile._id)
      .select('-password')
      .populate('department', 'name');
    
    res.json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const profile = await Staff.findById(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, profile.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    profile.password = hashedPassword;
    await profile.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 