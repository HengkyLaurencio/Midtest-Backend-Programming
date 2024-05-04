const express = require('express');

const bankingControllers = require('./banking-controller');
const bankingValidators = require('./banking-validator');
const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');

const route = express.Router();

module.exports = (app) => {
  app.use('/banking', route);

  route.get(
    '/',
    authenticationMiddleware,
    bankingControllers.userBankingInformation
  );

  route.post(
    '/',
    authenticationMiddleware,
    celebrate(bankingValidators.createAcccount),
    bankingControllers.createAccount
  );

  route.delete(
    '/:account_number',
    authenticationMiddleware,
    bankingControllers.deleteAccount
  );
};
