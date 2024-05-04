const bankingService = require('./banking-service');
const { getTokenPayload } = require('../../../utils/token-parser');

async function test(request, response, next) {
  const testsub = {
    massage: 'success',
  };

  return response.status(200).json(testsub);
}

async function createAccount(request, response, next) {
  const userToken = request.headers.authorization;
  const userData = getTokenPayload(userToken.substring(4));

  const userid = userData.userId;
  const name = request.body.name;
  const password = request.body.password;

  const createAccount = await bankingService.createAccount(
    userid,
    name,
    password
  );
  if (createAccount) return response.status(200).json(createAccount);

  return response.status(200).json({ messege: 'fail' });
}

module.exports = { test, createAccount };
