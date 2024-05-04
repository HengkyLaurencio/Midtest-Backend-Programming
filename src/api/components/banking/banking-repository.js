const { bankingAccount } = require('../../../models');

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

module.exports = { createAccount };
