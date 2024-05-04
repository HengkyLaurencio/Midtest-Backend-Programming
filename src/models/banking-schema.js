const accountsSchema = {
  userId: String,
  name: String,
  password: String,
  accountNumber: String,
  balance: { type: Number, default: 0 },
};

module.exports = { accountsSchema };
