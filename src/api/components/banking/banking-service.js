const bankingRepository = require('./banking-repository');

const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * create bangkin account
 * @param {string} userID - User ID
 * @param {string} name - name
 * @param {string} password - password
 * @returns {object} Response object or pass an error to the next route
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
 * @returns {object} Response object or pass an error to the next route
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

module.exports = { createAccount, userBankingInformation };
