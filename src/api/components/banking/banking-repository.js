const { bankingAccount, User } = require('../../../models');

const {
  generateBankAccountNumber,
} = require('../../../utils/accountNumber-geberator');

async function createAccount(userId, name, password) {
  return await bankingAccount.create({
    userId,
    name,
    password,
    accountNumber: await generateBankAccountNumber(),
  });
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Get all accounts by user id
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getAccounts(id) {
  return bankingAccount.find({ userId: id });
}

/**
 * delete account
 * @param {string} userId - User ID
 * @param {string} accountNumber - Account Number
 * @returns {Promise}
 */
async function deleteAccount(userId, accountNumber) {
  return bankingAccount.deleteOne({ userId, accountNumber });
}

module.exports = {
  createAccount,
  getUser,
  getAccounts,
  deleteAccount,
};
