const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Employee = require('../models/Employee');

// @desc    Get wallet balance and info
// @route   GET /api/wallet/balance
// @access  Private (Employee)
const getWalletBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ employeeId: req.employee.id });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json({
      success: true,
      data: {
        balance: wallet.balance,
        availableForWithdrawal: wallet.availableForWithdrawal,
        currency: wallet.currency,
        totalEarnings: wallet.totalEarnings,
        totalWithdrawals: wallet.totalWithdrawals,
        lastWithdrawalDate: wallet.lastWithdrawalDate,
        canWithdrawToday: wallet.canWithdrawToday()
      }
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ 
      message: 'Error fetching wallet balance', 
      error: error.message 
    });
  }
};

// @desc    Get wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private (Employee)
const getWalletTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    
    const wallet = await Wallet.findOne({ employeeId: req.employee.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Build query
    const query = { walletId: wallet._id };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('bookingId', 'serviceType description scheduledTime')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

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
    console.error('Get wallet transactions error:', error);
    res.status(500).json({ 
      message: 'Error fetching transactions', 
      error: error.message 
    });
  }
};

// @desc    Request withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private (Employee)
const requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankAccount } = req.body;
    
    if (!amount || !bankAccount) {
      return res.status(400).json({ 
        message: 'Amount and bank account details are required' 
      });
    }

    const wallet = await Wallet.findOne({ employeeId: req.employee.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Validate withdrawal
    const validation = wallet.validateWithdrawal(amount);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Withdrawal validation failed',
        errors: validation.errors
      });
    }

    // Start transaction
    const session = await Transaction.startSession();
    session.startTransaction();

    try {
      // Update wallet balance
      wallet.balance -= amount;
      wallet.totalWithdrawals += amount;
      wallet.lastWithdrawalDate = new Date();
      await wallet.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        walletId: wallet._id,
        employeeId: req.employee.id,
        type: 'withdrawal',
        amount: amount,
        status: 'pending', // In real app, this would be processed by payment gateway
        description: `Withdrawal to bank account ending in ${bankAccount.slice(-4)}`,
        balanceAfter: wallet.balance,
        metadata: {
          bankAccount: bankAccount,
          transactionId: `WD${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        }
      });

      await transaction.save({ session });

      // Simulate processing (in real app, integrate with payment gateway)
      setTimeout(async () => {
        try {
          transaction.status = 'completed';
          await transaction.save();
          console.log(`✅ Withdrawal processed: ₹${amount} to ${req.employee.name}`);
        } catch (error) {
          console.error('Error updating transaction status:', error);
        }
      }, 2000);

      await session.commitTransaction();

      res.json({
        success: true,
        message: 'Withdrawal request submitted successfully',
        data: {
          transactionId: transaction.metadata.transactionId,
          amount: amount,
          status: transaction.status,
          estimatedProcessingTime: '2-3 business days',
          newBalance: wallet.balance
        }
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ 
      message: 'Error processing withdrawal request', 
      error: error.message 
    });
  }
};

// @desc    Get withdrawal limits and info
// @route   GET /api/wallet/withdrawal-info
// @access  Private (Employee)
const getWithdrawalInfo = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ employeeId: req.employee.id });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json({
      success: true,
      data: {
        minimumBalance: 500,
        availableForWithdrawal: wallet.availableForWithdrawal,
        canWithdrawToday: wallet.canWithdrawToday(),
        lastWithdrawalDate: wallet.lastWithdrawalDate,
        withdrawalLimit: 'Once per day',
        processingTime: '2-3 business days'
      }
    });
  } catch (error) {
    console.error('Get withdrawal info error:', error);
    res.status(500).json({ 
      message: 'Error fetching withdrawal info', 
      error: error.message 
    });
  }
};

module.exports = {
  getWalletBalance,
  getWalletTransactions,
  requestWithdrawal,
  getWithdrawalInfo
};