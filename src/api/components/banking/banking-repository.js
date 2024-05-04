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

async function getAccounts(id) {
  return bankingAccount.find({ userId: id });
}

module.exports = { createAccount, getUser, getAccounts };
