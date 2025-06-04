
const Student = require('../../models/Student/studentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { rollNumber, password } = req.body;
  const student = await Student.findOne({ rollNumber });
  if (!student || !(await bcrypt.compare(password, student.password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: student._id, role: 'Student' }, process.env.JWT_SECRET);
  res.json({ token, role: 'Student' });
};

exports.register = async (req, res) => {
  const { name, rollNumber, password, class: cls, section } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const student = await Student.create({ 
    name, 
    rollNumber, 
    password: hashedPassword, 
    class: cls, 
    section 
  });
  res.status(201).json(student);
};

exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select('-password')
      .populate('parents', 'name contactNumber email');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, contactNumber, address } = req.body;
    
    // Create update request instead of directly updating
    const updateRequest = {
      studentId: req.user.id,
      requestedUpdates: {
        name, email, contactNumber, address
      },
      status: 'Pending'
    };
    
    // This would typically be saved to a ProfileUpdateRequest model
    // For now, just return success message
    res.json({ 
      message: 'Profile update request submitted successfully',
      updateRequest
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};