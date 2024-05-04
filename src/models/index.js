const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const bankingSchema = require('./banking-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));

const bankingAccount = mongoose.model(
  'bankingAccount',
  mongoose.Schema(bankingSchema.accountsSchema)
);

const transaction = mongoose.model(
  'transaction',
  mongoose.Schema(bankingSchema.transactionsSchema)
);

module.exports = {
  mongoose,
  User,
  bankingAccount,
  transaction,
};
