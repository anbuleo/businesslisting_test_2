const express = require('express');
const {
  getUserWalletBalance,
  topUpUserWallet,
  getUserWalletTransactions
} = require('../controllers/userWalletController');
const auth = require('../middleware/auth');

const router = express.Router();

// All user wallet routes require authentication
router.use(auth);

// Wallet balance and info
router.get('/balance', getUserWalletBalance);

// Transactions
router.get('/transactions', getUserWalletTransactions);

// Top-up
router.post('/topup', topUpUserWallet);

module.exports = router;