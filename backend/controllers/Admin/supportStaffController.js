const SupportStaff = require('../../models/Admin/supportStaffModel');

exports.getAllSupportStaff = async (req, res) => {
  try {
    const staff = await SupportStaff.find();
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSupportStaff = async (req, res) => {
  try {
    const staff = new SupportStaff(req.body);
    await staff.save();
    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSupportStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await SupportStaff.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSupportStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await SupportStaff.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addStaffLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description } = req.body;
    const staff = await SupportStaff.findById(id);
    staff.logs.push({ type, description });
    await staff.save();
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllStaffLogs = async (req, res) => {
  try {
    const logs = await SupportStaff.aggregate([
      { $unwind: '$logs' },
      { $replaceRoot: { newRoot: '$logs' } },
      { $sort: { date: -1 } }
    ]);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 