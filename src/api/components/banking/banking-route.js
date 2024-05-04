const express = require('express');

const bankingControllers = require('./banking-controller');
const bankingValidators = require('./banking-validator');
const authenticationMiddleware = require('../../middlewares/authentication-middleware');
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
};
