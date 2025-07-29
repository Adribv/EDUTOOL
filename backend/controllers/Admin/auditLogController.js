const AuditLog = require('../../models/Admin/auditLogModel');

exports.getAllAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ dateOfAudit: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Audit log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createAuditLog = async (req, res) => {
  try {
    const log = new AuditLog(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ message: 'Error creating audit log', error: error.message });
  }
};

exports.updateAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!log) return res.status(404).json({ message: 'Audit log not found' });
    res.json(log);
  } catch (error) {
    res.status(400).json({ message: 'Error updating audit log', error: error.message });
  }
};

exports.deleteAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Audit log not found' });
    res.json({ message: 'Audit log deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 