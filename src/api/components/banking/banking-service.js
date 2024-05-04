const bankingRepository = require('./banking-repository');

const { hashPassword, passwordMatched } = require('../../../utils/password');
const { generateBankingToken } = require('../../../utils/session-token');

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
  const accounts = await bankingRepository.getAccountsByUserId(userId);

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

/**
 * Retrieves an account by user ID and account number.
 * @param {string} userId - user id
 * @param {string} accountNumber - account number
 * @returns {object} The account object if found, null otherwise.
 */
async function getAccountByNumberAndUserID(userId, accountNumber) {
  const account = await bankingRepository.getAccountByNumberAndUserID(
    userId,
    accountNumber
  );
  // If account doesn't exist, return null
  if (!account) {
    return null;
  }
  // Otherwise, return the account object
  return account;
}

/**
 * Check account number and password for login.
 * @param {string} userId - user id
 * @param {string} accountNumber - account number
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the account number and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(userId, accountNumber, password) {
  // Retrieve account details by account number and user ID
  const account = await bankingRepository.getAccountByNumberAndUserID(
    userId,
    accountNumber
  );

  // Check if the provided password matches the account's passwor
  const passwordChecked = await passwordMatched(password, account.password);

  // If password matches, generate banking token and return account details
  if (passwordChecked) {
    return {
      account_number: accountNumber,
      name: account.name,
      token: generateBankingToken(userId, accountNumber),
    };
  }

  return null;
}

module.exports = {
  createAccount,
  userBankingInformation,
  deleteAccount,
  getAccountByNumberAndUserID,
  checkLoginCredentials,
};
