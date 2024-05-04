const accountsSchema = {
  userId: String,
  name: String,
  password: String,
  accountNumber: String,
  balance: { type: Number, default: 0 },
};

const transactionsSchema = {
  accountNumber: String,
  type: String,
  amount: Number,
  description: String,
  timestamp: Date,
};

module.exports = { accountsSchema, transactionsSchema };
