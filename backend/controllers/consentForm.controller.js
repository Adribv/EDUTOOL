const ConsentForm = require('../models/consentForm.model');

// Admin create or update template
async function upsertTemplate(req, res) {
  try {
    const { eventId } = req.params;
    const data = req.body;
    
    // Validate required fields
    if (!data.title || !data.schoolName) {
      return res.status(400).json({ 
        message: 'Title and School Name are required fields for consent forms' 
      });
    }
    
    const form = await ConsentForm.findOneAndUpdate(
      { eventId },
      { ...data, status: 'awaitingParent' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// Parent fill form
async function parentFill(req, res) {
  try {
    const { eventId } = req.params;
    const data = req.body;
    const form = await ConsentForm.findOneAndUpdate(
      { eventId },
      { ...data, status: 'completed', signedAt: new Date() },
      { new: true }
    );
    if (!form) return res.status(404).json({ message: 'Consent form not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// Get form (public)
async function getForm(req, res) {
  try {
    const { eventId } = req.params;
    const form = await ConsentForm.findOne({ eventId });
    if (!form) return res.status(404).json({ message: 'Consent form not found' });
    
    // Check if form has required data
    if (!form.title || !form.schoolName) {
      return res.status(400).json({ 
        message: 'Consent form data is incomplete. Please contact the school administration.',
        missingFields: {
          title: !form.title,
          schoolName: !form.schoolName
        }
      });
    }
    
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

// Fix incomplete consent form (admin only)
async function fixIncompleteForm(req, res) {
  try {
    const { eventId } = req.params;
    const { title, schoolName, ...otherData } = req.body;
    
    if (!title || !schoolName) {
      return res.status(400).json({ 
        message: 'Title and School Name are required to fix incomplete consent form' 
      });
    }
    
    const form = await ConsentForm.findOneAndUpdate(
      { eventId },
      { title, schoolName, ...otherData, status: 'awaitingParent' },
      { new: true, upsert: true }
    );
    
    res.json({
      message: 'Consent form fixed successfully',
      form
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

module.exports = { upsertTemplate, parentFill, getForm, fixIncompleteForm }; 