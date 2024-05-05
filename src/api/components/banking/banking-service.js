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

/**
 * Retrieves an account by account number.
 * @param {string} accountNumber - account number
 * @returns {object} The account object if found, null otherwise.
 */
async function getAccountByNumber(accountNumber) {
  const account = await bankingRepository.getAccountByNumber(accountNumber);
  // If account doesn't exist, return null
  if (!account) {
    return null;
  }
  // Otherwise, return the account object
  return account;
}

/**
 * Deposits an amount into the specified account.
 * @param {string} accountNumber - Account number.
 * @param {number} amount - The amount to deposit.
 * @returns {object} The transaction details if successful, null otherwise.
 */
async function deposit(accountNumber, amount) {
  // Retrieve account details by account number
  const account = await bankingRepository.getAccountByNumber(accountNumber);
  // Calculate new balance after deposit
  const newBalance = parseInt(account.balance) + parseInt(amount);

  // Update balance in the database
  const deposit = await bankingRepository.updateBalance(
    accountNumber,
    newBalance
  );

  // If deposit failed, return null
  if (!deposit) {
    return null;
  }

  // Add deposit transaction to the database
  const transaction = await bankingRepository.addTransaction(
    accountNumber,
    'deposit',
    amount,
    '',
    new Date()
  );

  // Retrieve updated account details after deposit
  const updateAccount =
    await bankingRepository.getAccountByNumber(accountNumber);

  const response = {
    account_number: accountNumber,
    name: account.name,
    type: transaction.type,
    amount: amount,
    timestamp: transaction.timestamp,
    balance: updateAccount.balance,
  };
  return response;
}

/**
 * Transfers an amount from one account to another.
 * @param {string} recipientNumber - The recipient's account number.
 * @param {string} accountNumber - The sender's account number.
 * @param {number} amount - The amount to transfer.
 * @param {string} description - The description of the transfer.
 * @returns {object} The transaction details if successful, null otherwise.
 */
async function transfer(recipientNumber, accountNumber, amount, description) {
  // Retrieve recipient and sender account details
  const recipient = await bankingRepository.getAccountByNumber(recipientNumber);
  const account = await bankingRepository.getAccountByNumber(accountNumber);

  // Calculate new balances
  const recipientNewBalance = parseInt(recipient.balance) + parseInt(amount);
  const accountNewBalance = parseInt(account.balance) - parseInt(amount);

  try {
    // Update balances in the database
    await bankingRepository.updateBalance(recipientNumber, recipientNewBalance);
    await bankingRepository.updateBalance(accountNumber, accountNewBalance);
  } catch (error) {
    return null;
  }

  // Construct transfer description message
  const descriptionMessage = `${recipientNumber} (${recipient.name}) ${description}`;

  // Add transfer transaction to the database
  const transaction = await bankingRepository.addTransaction(
    accountNumber,
    'transfer',
    amount,
    descriptionMessage,
    new Date()
  );

  const response = {
    account_number: accountNumber,
    name: account.name,
    type: transaction.type,
    amount: amount,
    recipient_number: recipientNumber,
    recipient_name: recipient.name,
    description: description,
    timestamp: transaction.timestamp,
  };
  return response;
}

/**
 * withdraw an amount into the specified account.
 * @param {string} accountNumber - Account number.
 * @param {number} amount - The amount to deposit.
 * @returns {object} The transaction details if successful, null otherwise.
 */
async function withdraw(accountNumber, amount) {
  // Retrieve account details by account number
  const account = await bankingRepository.getAccountByNumber(accountNumber);
  // Calculate new balance after deposit
  const newBalance = parseInt(account.balance) - parseInt(amount);

  // Update balance in the database
  const withdraw = await bankingRepository.updateBalance(
    accountNumber,
    newBalance
  );

  // If deposit failed, return null
  if (!withdraw) {
    return null;
  }

  // Add deposit transaction to the database
  const transaction = await bankingRepository.addTransaction(
    accountNumber,
    'withdraw',
    amount,
    '',
    new Date()
  );

  // Retrieve updated account details after deposit
  const updateAccount =
    await bankingRepository.getAccountByNumber(accountNumber);

  const response = {
    account_number: accountNumber,
    name: account.name,
    type: transaction.type,
    amount: amount,
    timestamp: transaction.timestamp,
    balance: updateAccount.balance,
  };
  return response;
}

/**
 * Retrieves transaction history for the specified account.
 * @param {string} accountNumber - The account number.
 * @returns {object} The transaction history if available, or a message indicating no transactions.
 */
async function history(accountNumber) {
  const account = await bankingRepository.getAccountByNumber(accountNumber);
  const transactions =
    await bankingRepository.getTransactionByAccountNumber(accountNumber);

  // Transaction data
  const transactionsData = transactions.map((transaction) => ({
    timestamp: transaction.timestamp,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
  }));

  // Sort transactions by timestamp in descending order
  const sortedTransaction = transactionsData.sort((a, b) => {
    return b.timestamp - a.timestamp;
  });

  // Prepare response object with account details and transaction history
  const response = {
    account_number: accountNumber,
    name: account.name,
    transaction_history:
      sortedTransaction.length === 0
        ? { message: 'This account has not made any transactions' }
        : sortedTransactions,
  };

  return response;
}

module.exports = {
  createAccount,
  userBankingInformation,
  deleteAccount,
  getAccountByNumberAndUserID,
  checkLoginCredentials,
  getAccountByNumber,
  deposit,
  transfer,
  withdraw,
  history,
};
