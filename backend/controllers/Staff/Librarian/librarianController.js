const Book = require('../../../models/Book');
const Borrowing = require('../../../models/Borrowing');
const Student = require('../../../models/Student');

// Book management
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Borrowing management
exports.getAllBorrowings = async (req, res) => {
  try {
    const borrowings = await Borrowing.find()
      .populate('studentId', 'name studentId')
      .populate('bookId', 'title author')
      .sort({ borrowedDate: -1 });
    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBorrowingById = async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id)
      .populate('studentId', 'name studentId')
      .populate('bookId', 'title author');
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }
    res.json(borrowing);
  } catch (error) {
    console.error('Error fetching borrowing:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBorrowing = async (req, res) => {
  try {
    const borrowing = new Borrowing(req.body);
    await borrowing.save();
    
    // Update book availability
    await Book.findByIdAndUpdate(req.body.bookId, { 
      $inc: { availableCopies: -1 } 
    });
    
    res.status(201).json(borrowing);
  } catch (error) {
    console.error('Error creating borrowing:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const borrowing = await Borrowing.findByIdAndUpdate(
      req.params.id,
      { 
        returnDate: new Date(),
        status: 'Returned'
      },
      { new: true }
    );
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }
    
    // Update book availability
    await Book.findByIdAndUpdate(borrowing.bookId, { 
      $inc: { availableCopies: 1 } 
    });
    
    res.json(borrowing);
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBorrowing = async (req, res) => {
  try {
    const borrowing = await Borrowing.findByIdAndDelete(req.params.id);
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }
    res.json({ message: 'Borrowing record deleted successfully' });
  } catch (error) {
    console.error('Error deleting borrowing:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student management
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('name studentId email').sort({ name: 1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentBorrowings = async (req, res) => {
  try {
    const borrowings = await Borrowing.find({ studentId: req.params.id })
      .populate('bookId', 'title author')
      .sort({ borrowedDate: -1 });
    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching student borrowings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Analytics and reports
exports.getAnalytics = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalBorrowings = await Borrowing.countDocuments();
    const activeBorrowings = await Borrowing.countDocuments({ status: 'Active' });
    const overdueBooks = await Borrowing.countDocuments({
      dueDate: { $lt: new Date() },
      status: 'Active'
    });
    
    res.json({
      totalBooks,
      totalBorrowings,
      activeBorrowings,
      overdueBooks
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOverdueBooks = async (req, res) => {
  try {
    const overdueBooks = await Borrowing.find({
      dueDate: { $lt: new Date() },
      status: 'Active'
    })
    .populate('studentId', 'name studentId')
    .populate('bookId', 'title author');
    
    res.json(overdueBooks);
  } catch (error) {
    console.error('Error fetching overdue books:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPopularBooks = async (req, res) => {
  try {
    const popularBooks = await Borrowing.aggregate([
      {
        $group: {
          _id: '$bookId',
          borrowCount: { $sum: 1 }
        }
      },
      {
        $sort: { borrowCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    const bookIds = popularBooks.map(book => book._id);
    const books = await Book.find({ _id: { $in: bookIds } });
    
    const result = popularBooks.map(book => {
      const bookDetails = books.find(b => b._id.toString() === book._id.toString());
      return {
        ...book,
        bookDetails
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching popular books:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 