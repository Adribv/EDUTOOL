const CounsellingRequest = require('../models/CounsellingRequest');

exports.createRequest = async (req, res) => {
  try {
    const request = new CounsellingRequest(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await CounsellingRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 