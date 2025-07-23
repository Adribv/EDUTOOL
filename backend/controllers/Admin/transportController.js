const Transport = require('../../models/Admin/transportModel');

exports.getAllTransports = async (req, res) => {
  try {
    const transports = await Transport.find();
    res.json({ success: true, data: transports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTransport = async (req, res) => {
  try {
    const transport = new Transport(req.body);
    await transport.save();
    res.status(201).json({ success: true, data: transport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTransport = async (req, res) => {
  try {
    const { id } = req.params;
    const transport = await Transport.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: transport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTransport = async (req, res) => {
  try {
    const { id } = req.params;
    await Transport.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = req.body;
    const transport = await Transport.findById(id);
    transport.schedules.push(schedule);
    await transport.save();
    res.json({ success: true, data: transport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addFuelLog = async (req, res) => {
  try {
    const { id } = req.params;
    const log = req.body;
    const transport = await Transport.findById(id);
    transport.fuelLogs.push(log);
    await transport.save();
    res.json({ success: true, data: transport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addDriverIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = req.body;
    const transport = await Transport.findById(id);
    transport.driverIncidents.push(incident);
    await transport.save();
    res.json({ success: true, data: transport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllLogs = async (req, res) => {
  try {
    const transports = await Transport.find();
    const logs = [];
    transports.forEach(t => {
      t.schedules.forEach(s => logs.push({ ...s.toObject(), vehicleNumber: t.vehicleNumber, type: 'Schedule' }));
      t.fuelLogs.forEach(f => logs.push({ ...f.toObject(), vehicleNumber: t.vehicleNumber, type: 'Fuel' }));
      t.driverIncidents.forEach(d => logs.push({ ...d.toObject(), vehicleNumber: t.vehicleNumber, type: 'Incident' }));
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 