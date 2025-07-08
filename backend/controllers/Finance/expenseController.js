const Expense = require('../../models/Finance/expenseModel');

// PUT /api/principal/expenses/:expenseId/approve
exports.approveExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.status !== 'Pending') {
      return res.status(400).json({ message: `Expense already ${expense.status}` });
    }

    expense.status = 'Approved';
    expense.approvedBy = req.user.id;
    expense.approvedAt = new Date();
    await expense.save();

    res.json({ message: 'Expense approved', expense });
  } catch (err) {
    console.error('Error approving expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 