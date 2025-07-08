const Student = require('../../models/Student/studentModel');
const Parent = require('../../models/Parent/parentModel');
const PasswordReset = require('../../models/Student/passwordResetModel');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Request password lookup
exports.requestPasswordLookup = async (req, res) => {
  try {
    const { rollNumber, email, requestedBy = 'Student' } = req.body;

    // Validate input
    if (!rollNumber || !email) {
      return res.status(400).json({ 
        message: 'Roll number and email are required' 
      });
    }

    // Find student by roll number
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ 
        message: 'Student not found with this roll number' 
      });
    }

    // Verify email matches (if student has email)
    if (student.email && student.email !== email) {
      return res.status(400).json({ 
        message: 'Email does not match student records' 
      });
    }

    // Check if there's a parent with this email
    const parent = await Parent.findOne({ 
      email: email,
      children: student._id 
    });

    if (!parent) {
      return res.status(403).json({ 
        message: 'Email not authorized for this student' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create or update password reset request
    const passwordReset = await PasswordReset.findOneAndUpdate(
      { studentId: student._id, status: 'Pending' },
      {
        rollNumber: student.rollNumber,
        email: email,
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
        status: 'Pending',
        requestedBy: requestedBy,
        remarks: `Password lookup requested by ${requestedBy}`
      },
      { upsert: true, new: true }
    );

    // In a real application, you would send an email here
    // For now, we'll return the token (in production, this should be sent via email)
    res.status(200).json({
      message: 'Password lookup request created successfully',
      resetToken: resetToken,
      expiresAt: resetTokenExpiry,
      note: 'In production, this token would be sent via email'
    });

  } catch (error) {
    console.error('Error requesting password lookup:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify reset token and get student info
exports.verifyResetToken = async (req, res) => {
  try {
    const { resetToken } = req.params;

    const passwordReset = await PasswordReset.findOne({
      resetToken: resetToken,
      status: 'Pending',
      resetTokenExpiry: { $gt: new Date() }
    }).populate('studentId', 'name rollNumber class section');

    if (!passwordReset) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    res.json({
      message: 'Token verified successfully',
      student: passwordReset.studentId,
      resetRequest: {
        requestedAt: passwordReset.requestedAt,
        requestedBy: passwordReset.requestedBy,
        expiresAt: passwordReset.resetTokenExpiry
      }
    });

  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password using token
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ 
        message: 'Reset token and new password are required' 
      });
    }

    const passwordReset = await PasswordReset.findOne({
      resetToken: resetToken,
      status: 'Pending',
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!passwordReset) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update student password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Student.findByIdAndUpdate(passwordReset.studentId, {
      password: hashedPassword
    });

    // Mark reset request as completed
    await PasswordReset.findByIdAndUpdate(passwordReset._id, {
      status: 'Completed',
      completedAt: new Date()
    });

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get password reset history for admin
exports.getPasswordResetHistory = async (req, res) => {
  try {
    const { studentId, status, startDate, endDate } = req.query;
    
    const query = {};
    
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.requestedAt = {};
      if (startDate) query.requestedAt.$gte = new Date(startDate);
      if (endDate) query.requestedAt.$lte = new Date(endDate);
    }

    const resetHistory = await PasswordReset.find(query)
      .populate('studentId', 'name rollNumber class section')
      .sort({ requestedAt: -1 });

    res.json(resetHistory);

  } catch (error) {
    console.error('Error fetching password reset history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel pending password reset request
exports.cancelPasswordReset = async (req, res) => {
  try {
    const { resetToken } = req.params;

    const passwordReset = await PasswordReset.findOne({
      resetToken: resetToken,
      status: 'Pending'
    });

    if (!passwordReset) {
      return res.status(404).json({ 
        message: 'Password reset request not found' 
      });
    }

    await PasswordReset.findByIdAndUpdate(passwordReset._id, {
      status: 'Expired',
      remarks: 'Cancelled by user'
    });

    res.json({ message: 'Password reset request cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling password reset:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 