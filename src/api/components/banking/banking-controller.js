const bankingService = require('./banking-service');
const { getTokenPayload } = require('../../../utils/token-parser');

/**
 * Handle get user banking information
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function userBankingInformation(request, response, next) {
  try {
    const userToken = request.headers.authorization;
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

module.exports = { userBankingInformation, createAccount };
