const User = require('../models/User');
const UserTransaction = require('../models/UserTransaction');

// @desc    Get user wallet balance and info
// @route   GET /api/user/wallet/balance
// @access  Private (User)
const getUserWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet totalDeposits totalPayments');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        balance: user.wallet.balance,
        currency: user.wallet.currency,
        totalDeposits: user.totalDeposits,
        totalPayments: user.totalPayments
      }
    });
  } catch (error) {
    console.error('Get user wallet balance error:', error);
    res.status(500).json({ 
      message: 'Error fetching user wallet balance', 
      error: error.message 
    });
  }
};

// @desc    Top up user wallet
// @route   POST /api/user/wallet/topup
// @access  Private (User)
const topUpUserWallet = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Start transaction
    const session = await UserTransaction.startSession();
    session.startTransaction();

    try {
      // Simulate payment gateway success
      // In a real application, this would involve calling a payment gateway API
      const transactionId = `TOPUP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Update user wallet balance
      user.wallet.balance += amount;
      user.totalDeposits += amount;
      await user.save({ session });

      // Create transaction record
      const transaction = new UserTransaction({
        userId: user._id,
        type: 'deposit',
        amount: amount,
        status: 'completed',
        description: `Wallet top-up via ${paymentMethod}`,
        metadata: {
          paymentMethod: paymentMethod,
          transactionId: transactionId
        },
        balanceAfter: user.wallet.balance
      });
      await transaction.save({ session });

      await session.commitTransaction();

      res.json({
        success: true,
        message: 'Wallet topped up successfully',
        data: {
          newBalance: user.wallet.balance,
          transactionId: transaction.metadata.transactionId
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Top up wallet error:', error);
    res.status(500).json({ 
      message: 'Error topping up wallet', 
      error: error.message 
    });
  }
};

// @desc    Get user wallet transactions
// @route   GET /api/user/wallet/transactions
// @access  Private (User)
const getUserWalletTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    
    // Build query
    const query = { userId: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await UserTransaction.find(query)
      .populate('bookingId', 'bookingId serviceDetails status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserTransaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user wallet transactions error:', error);
    res.status(500).json({ 
      message: 'Error fetching user wallet transactions', 
      error: error.message 
    });
  }
};

module.exports = {
  getUserWalletBalance,
  topUpUserWallet,
  getUserWalletTransactions
};