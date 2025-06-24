const SchoolDocument = require('../../models/Admin/schoolDocumentModel');

// Get documents available for students
exports.getDocuments = async (req, res) => {
  try {
    const { type } = req.query; // optional filter by documentType

    const filter = {
      isPublic: true,
      $or: [
        { targetAudience: 'Students' },
        { targetAudience: 'All' },
        { targetAudience: { $exists: false } },
      ],
    };
    if (type) {
      filter.documentType = type;
    }

    const docs = await SchoolDocument.find(filter).sort({ publishedDate: -1 });
    res.json(docs);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 