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
};
