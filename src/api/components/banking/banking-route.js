const express = require('express');

const bankingControllers = require('./banking-controller');
const bankingValidators = require('./banking-validator');
const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const authenticationBankingMiddleware = require('../../middlewares/authentication-banking-middleware');
const authenticationAdminMiddleware = require('../../middlewares/authentication-admin-middleware');
const celebrate = require('../../../core/celebrate-wrappers');

const route = express.Router();

module.exports = (app) => {
  app.use('/banking', route);

  // get user bangking informasion
  route.get(
    '/',
    authenticationMiddleware,
    bankingControllers.userBankingInformation
  );

  // create account
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(bankingValidators.createAcccount),
    bankingControllers.createAccount
  );

  // delete account
  route.delete(
    '/:account_number',
    authenticationMiddleware,
    bankingControllers.deleteAccount
  );

  // login account
  route.post(
    '/login',
    authenticationMiddleware,
    celebrate(bankingValidators.login),
    bankingControllers.login
  );

  // -------- transaction --------

  // deposit
  route.post(
    '/transactions/deposit',
    authenticationBankingMiddleware,
    celebrate(bankingValidators.deposit),
    bankingControllers.deposit
  );

  // transfer to other account
  route.post(
    '/transactions/transfer',
    authenticationBankingMiddleware,
    celebrate(bankingValidators.tranfer),
    bankingControllers.transfer
  );

  // withdraw
  route.post(
    '/transactions/withdraw',
    authenticationBankingMiddleware,
    celebrate(bankingValidators.withdraw),
    bankingControllers.withdraw
  );

  // get transaction history
  route.get(
    '/transactions/history',
    authenticationBankingMiddleware,
    bankingControllers.history
  );

  // ----------- admin -----------

  // get all accounts
  route.get(
    '/admin/accounts',
    authenticationAdminMiddleware,
    bankingControllers.getAllAccounts
  );

  // get all transactions
  route.get(
    '/admin/transactions',
    authenticationAdminMiddleware,
    bankingControllers.getAllTransactions
  );
};
