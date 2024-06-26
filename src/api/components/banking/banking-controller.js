const bankingService = require('./banking-service');
const { getTokenPayload } = require('../../../utils/token-parser');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get user banking information
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function userBankingInformation(request, response, next) {
  try {
    // Extract user token from request headers
    const userToken = request.headers.authorization;
    // Decode token to get user data
    const userTokenData = getTokenPayload(userToken.substring(4));

    const userBankingInformation = await bankingService.userBankingInformation(
      userTokenData.userId
    );

    return response.status(200).json(userBankingInformation);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createAccount(request, response, next) {
  try {
    // Extract user token from request headers
    const userToken = request.headers.authorization;
    // Decode token to get user data
    const userData = getTokenPayload(userToken.substring(4));

    const userid = userData.userId;
    const name = request.body.name;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    const createAccount = await bankingService.createAccount(
      userid,
      name,
      password
    );
    // Check if account creation was successful
    if (!createAccount) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create account'
      );
    }

    return response.status(200).json({
      messasge: 'success to create account',
      accountNumber: createAccount.accountNumber,
      name: createAccount.name,
      balance: createAccount.balance,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteAccount(request, response, next) {
  try {
    // Extract user token from request headers
    const userToken = request.headers.authorization;
    // Decode token to get user data
    const userTokenData = getTokenPayload(userToken.substring(4));

    const accountNumber = request.params.account_number;

    const success = await bankingService.deleteAccount(
      userTokenData.userId,
      accountNumber
    );

    // Check if account deletion was successful
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }
    return response.status(200).json({ accountNumber });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle account login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  try {
    // Extract user token from request headers
    const userToken = request.headers.authorization;
    // Decode token to get user data
    const userTokenData = getTokenPayload(userToken.substring(4));

    const accountNumber = request.body.account_number;
    const password = request.body.password;

    // Check if account exists
    const account = await bankingService.getAccountByNumberAndUserID(
      userTokenData.userId,
      accountNumber
    );
    if (!account) {
      throw errorResponder(errorTypes.NOT_FOUND, "This account doesn't exist");
    }

    // Check login credentials
    const success = await bankingService.checkLoginCredentials(
      userTokenData.userId,
      accountNumber,
      password
    );
    if (!success) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    return response.status(200).json(success);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle deposit request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deposit(request, response, next) {
  try {
    // Extract account token from request headers
    const accountToken = request.headers.authorization;
    // Decode token to get account data
    const accountData = getTokenPayload(accountToken.substring(5));

    const amount = request.body.amount;

    // Deposit the specified amount into the account
    const success = await bankingService.deposit(
      accountData.accountNumber,
      amount
    );

    // If deposit fails, throw an error
    if (!success) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Deposit fail');
    }

    return response.status(200).json(success);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle transfer request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function transfer(request, response, next) {
  try {
    // Extract account token from request headers
    const accountToken = request.headers.authorization;
    // Decode token to get account data
    const accountData = getTokenPayload(accountToken.substring(5));

    const recipient_account = request.body.recipient_account;
    const amount = request.body.amount;
    const description = request.body.description || '';

    // Check if recipient account exists
    const recipient =
      await bankingService.getAccountByNumber(recipient_account);
    if (!recipient) {
      throw errorResponder(
        errorTypes.NOT_FOUND,
        "recipient account doesn't exist"
      );
    }

    // check is balance sufficent for transfer
    const sufficentFund = await bankingService.checkSufficientFunds(
      accountData.accountNumber,
      amount
    );
    if (!sufficentFund) {
      throw errorResponder(
        errorTypes.INSUFFICIENT_FUNDS,
        'Insufficient funds for the transfer'
      );
    }

    // Perform the transfer
    const success = await bankingService.transfer(
      recipient_account,
      accountData.accountNumber,
      amount,
      description
    );

    // If deposit fails, throw an error
    if (!success) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Transfer fail');
    }

    response.status(200).json(success);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle withdraw request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function withdraw(request, response, next) {
  try {
    // Extract account token from request headers
    const accountToken = request.headers.authorization;
    // Decode token to get account data
    const accountData = getTokenPayload(accountToken.substring(5));

    const amount = request.body.amount;

    // check is balance sufficent for withdraw
    const sufficentFund = await bankingService.checkSufficientFunds(
      accountData.accountNumber,
      amount
    );
    if (!sufficentFund) {
      throw errorResponder(
        errorTypes.INSUFFICIENT_FUNDS,
        'Insufficient funds for the withdraw'
      );
    }

    // withdraw the specified amount into the account
    const success = await bankingService.withdraw(
      accountData.accountNumber,
      amount
    );

    // If withdraw fails, throw an error
    if (!success) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Withdraw fail');
    }

    return response.status(200).json(success);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle history request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function history(request, response, next) {
  try {
    // Extract account token from request headers
    const accountToken = request.headers.authorization;
    // Decode token to get account data
    const accountData = getTokenPayload(accountToken.substring(5));

    // get transaction history data
    const history = await bankingService.history(accountData.accountNumber);

    return response.status(200).json(history);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get all accounts request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAllAccounts(request, response, next) {
  try {
    const accounts = await bankingService.getAllAccounts();

    return response.status(200).json(accounts);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get all transactions request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAllTransactions(request, response, next) {
  try {
    const transactions = await bankingService.getAllTransactions();

    return response.status(200).json(transactions);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  userBankingInformation,
  createAccount,
  deleteAccount,
  login,
  deposit,
  transfer,
  withdraw,
  history,
  getAllAccounts,
  getAllTransactions,
};
