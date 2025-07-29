const express = require('express');
const router = express.Router();
const librarianController = require('../../controllers/Staff/Librarian/librarianController');
const { permit } = require('../../middleware/authMiddleware');

// Book management
router.get('/books', permit('Librarian'), librarianController.getAllBooks);
router.get('/books/:id', permit('Librarian'), librarianController.getBookById);
router.post('/books', permit('Librarian'), librarianController.createBook);
router.put('/books/:id', permit('Librarian'), librarianController.updateBook);
router.delete('/books/:id', permit('Librarian'), librarianController.deleteBook);

// Borrowing management
router.get('/borrowings', permit('Librarian'), librarianController.getAllBorrowings);
router.get('/borrowings/:id', permit('Librarian'), librarianController.getBorrowingById);
router.post('/borrowings', permit('Librarian'), librarianController.createBorrowing);
router.put('/borrowings/:id/return', permit('Librarian'), librarianController.returnBook);
router.delete('/borrowings/:id', permit('Librarian'), librarianController.deleteBorrowing);

// Student management
router.get('/students', permit('Librarian'), librarianController.getAllStudents);
router.get('/students/:id/borrowings', permit('Librarian'), librarianController.getStudentBorrowings);

// Analytics and reports
router.get('/analytics', permit('Librarian'), librarianController.getAnalytics);
router.get('/reports/overdue', permit('Librarian'), librarianController.getOverdueBooks);
router.get('/reports/popular-books', permit('Librarian'), librarianController.getPopularBooks);

module.exports = router; 