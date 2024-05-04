const bankingRepository = require('./banking-repository');

const { hashPassword, passwordMatched } = require('../../../utils/password');
const { P } = require('pino');

/**
 * create bangkin account
 * @param {string} userID - User ID
 * @param {string} name - name
 * @param {string} password - password
 * @returns {object}
 */
async function createAccount(userId, name, password) {
  const hashedPassword = await hashPassword(password);
  const createAccount = await bankingRepository.createAccount(
    userId,
    name,
    hashedPassword
  );
  if (createAccount) {
    return createAccount;
  }

  return null;
}

/**
 * get user banking information
 * @param {string} userID - User ID
 * @returns {object}
 */
async function userBankingInformation(userId) {
  const userData = await bankingRepository.getUser(userId);
  const accounts = await bankingRepository.getAccounts(userId);

  const accountsResult = [];
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    accountsResult.push({
      accountNumber: account.accountNumber,
      name: account.name,
      balance: account.balance,
    });
  }

  // formation response
  const Response = {
    userId: userData.id,
    name: userData.name,
    email: userData.email,
    accounts: accountsResult,
  };

  return Response;
}

/**
 * delete account
 * @param {string} userID - User ID
 * @param {string} accountNumber - Account Number
 * @returns {boolean}
 */
async function deleteAccount(userId, accountNumber) {
  const deleteAccount = await bankingRepository.deleteAccount(
    userId,
    accountNumber
  );
  // if account not found
  if (deleteAccount.deletedCount == 0) {
    return false;
  }
  return true;
}

module.exports = { createAccount, userBankingInformation, deleteAccount };
