
const Staff = require('../../models/Staff/staffModel');
const bcrypt3 = require('bcryptjs');
const jwt3 = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const staff = await Staff.findOne({ email });
  if (!staff || !(await bcrypt3.compare(password, staff.password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt3.sign({ id: staff._id, role: staff.role }, process.env.JWT_SECRET);
  res.json({ token, role: staff.role });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt3.hash(password, 10);
  const staff = await Staff.create({ name, email, password: hashedPassword, role });
  res.status(201).json(staff);
};