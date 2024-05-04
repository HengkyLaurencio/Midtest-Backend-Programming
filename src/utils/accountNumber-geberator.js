const { bankingAccount } = require('../models');

/**
 * gerate random bank account number
 * @returns {string} - account number
 */
async function generateBankAccountNumber() {
  // Generate a 10-digit random number.
  const randomAccountNumber = Math.floor(Math.random() * 10000000000)
    .toString()
    .padStart(10, '0');

  // Format the account number.
  const bankAccountNumber = `ACC-${randomAccountNumber}`;

  // Prevent duplicate accounts.
  const existingAccount = await bankingAccount.findOne({
    accountNumber: bankAccountNumber,
  });
  if (existingAccount) {
    return generateBankAccountNumber();
  }

  return bankAccountNumber;
}

module.exports = { generateBankAccountNumber };
