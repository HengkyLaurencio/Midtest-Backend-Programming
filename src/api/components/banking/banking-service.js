const bankingRepository = require('./banking-repository');

const { hashPassword, passwordMatched } = require('../../../utils/password');

async function createAccount(id, name, password) {
  const hashedPassword = await hashPassword(password);
  const createAccount = await bankingRepository.createAccount(
    id,
    name,
    hashedPassword
  );
  if (createAccount) {
    return createAccount;
  }

  return null;
}

module.exports = { createAccount };
