const Parent = require('../../models/Parent/parentModel'); // Assuming you have a Parent model defined in models/Parent/parentModel.js
const bcrypt2 = require('bcryptjs');
const jwt2 = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const parent = await Parent.findOne({ email });
  if (!parent || !(await bcrypt2.compare(password, parent.password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt2.sign({ id: parent._id, role: 'Parent' }, process.env.JWT_SECRET);
  res.json({ token , childRollNumbers: parent.childRollNumbers });
};

exports.register = async (req, res) => {
  const { name, email, password, childRollNumbers } = req.body;
  const hashedPassword = await bcrypt2.hash(password, 10);
  const parent = await Parent.create({ name, email, password: hashedPassword, childRollNumbers });
  res.status(201).json(parent);
};

exports.addStudent = async (req, res) => {
  const { rollNumber } = req.body;
  const parent = await Parent.findById(req.params.parentId);
  if (!parent) return res.status(404).json({ message: 'Parent not found' });

  if (!parent.childRollNumbers.includes(rollNumber)) {
    parent.childRollNumbers.push(rollNumber);
    await parent.save();
  }
  res.json({ message: 'Student added to parent', parent });
};

exports.removeStudent = async (req, res) => {
  const { rollNumber } = req.body;
  const parent = await Parent.findById(req.params.parentId);
  if (!parent) return res.status(404).json({ message: 'Parent not found' });

  parent.childRollNumbers = parent.childRollNumbers.filter(r => r !== rollNumber);
  await parent.save();

  res.json({ message: 'Student removed from parent', parent });
};
