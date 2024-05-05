const joi = require('joi');

module.exports = {
  createAcccount: {
    body: {
      name: joi.string().required().label('Name'),
      password: joi
        .string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .label('Password'),
      password_confirm: joi
        .string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .label('Password'),
    },
  },
  login: {
    body: {
      account_number: joi.string().required().label('account number'),
      password: joi.string().required().label('password'),
    },
  },
  deposit: {
    body: {
      amount: joi.number().integer().positive().required().label('amount'),
    },
  },
  tranfer: {
    body: {
      recipient_account: joi.string().required().label('recipient account'),
      amount: joi.number().integer().positive().required().label('amount'),
      description: joi.string().optional().label('description'),
    },
  },
  withdraw: {
    body: {
      amount: joi.number().integer().positive().required().label('amount'),
    },
  },
};
