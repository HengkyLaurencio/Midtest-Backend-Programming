const { bankingAccount, User, transaction } = require('../../../models');
const { accountsSchema } = require('../../../models/banking-schema');

const {
  generateBankAccountNumber,
} = require('../../../utils/accountNumber-geberator');

/**
 * create account
 * @param {string} userId - User ID
 * @param {string} name - name
 * @param {string} password - password
 * @returns {Promise}
 */
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
  return await User.findById(id);
}

/**
 * Get all accounts by user id
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getAccountsByUserId(id) {
  return await bankingAccount.find({ userId: id });
}

/**
 * delete account
 * @param {string} userId - User ID
 * @param {string} accountNumber - Account Number
 * @returns {Promise}
 */
async function deleteAccount(userId, accountNumber) {
  return await bankingAccount.deleteOne({ userId, accountNumber });
}

/**
 * find account
 * @param {string} userId - User ID
 * @param {string} accountNumber - Account Number
 * @returns {Promise}
 */
async function getAccountByNumberAndUserID(userId, accountNumber) {
  return await bankingAccount.findOne({ userId, accountNumber });
}

/**
 * find account
 * @param {string} userId - User ID
 * @returns {Promise}
 */
async function getAccountByNumber(accountNumber) {
  return await bankingAccount.findOne({ accountNumber });
}

/**
 * update account balance
 * @param {string} accountNumber - account number
 * @param {number} balance - balance
 * @returns {Promise}
 */
async function updateBalance(accountNumber, balance) {
  return await bankingAccount.updateOne(
    {
      accountNumber,
    },
    {
      $set: {
        balance,
      },
    }
  );
}

/**
 * add transaction
 * @param {string} accountNumber - account number
 * @param {string} type - transaction type
 * @param {number} amount - transaction amount
 * @param {string} description - description
 * @param {date} timestamp - timestamp
 * @returns {Promise}
 */
async function addTransaction(
  accountNumber,
  type,
  amount,
  description,
  timestamp
) {
  return await transaction.create({
    accountNumber,
    type,
    amount,
    description,
    timestamp,
  });
}

/**
 * get transsaction by account number
 * @param {string} accountNumber - account number
 * @returns {Promise}
 */
async function getTransactionByAccountNumber(accountNumber) {
  return await transaction.find({ accountNumber });
}

/**
 * get all accounts
 * @returns {Promise}
 */
async function getAllAccounts() {
  return await bankingAccount.find({});
}

/**
 * get all transactions
 * @returns {Promise}
 */
async function getAllTransactions() {
  return await transaction.find({});
}

module.exports = {
  createAccount,
  getUser,
  getAccountsByUserId,
  deleteAccount,
  getAccountByNumberAndUserID,
  getAccountByNumber,
  updateBalance,
  addTransaction,
  getTransactionByAccountNumber,
  getAllAccounts,
  getAllTransactions,
};
