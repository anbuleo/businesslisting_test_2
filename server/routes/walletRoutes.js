const express = require('express');
const {
  getWalletBalance,
  getWalletTransactions,
  requestWithdrawal,
  getWithdrawalInfo
} = require('../controllers/walletController');
const auth = require('../middleware/auth');

const router = express.Router();

// All wallet routes require authentication
router.use(auth);

// Wallet balance and info
router.get('/balance', getWalletBalance);
router.get('/withdrawal-info', getWithdrawalInfo);

// Transactions
router.get('/transactions', getWalletTransactions);

// Withdrawals
router.post('/withdraw', requestWithdrawal);

module.exports = router;