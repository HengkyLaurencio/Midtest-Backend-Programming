const { User } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user loginAttempts
 * @param {string} id - User ID
 * @param {number} loginAttempts - loginAttempts
 * @param {date} lastLoginAttempts - lastLoginAttempts
 * @returns {Promise}
 */
async function updateUserLoginAtttempt(id, loginAttempts, lastLoginAttempt) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        loginAttempts,
        lastLoginAttempt,
      },
    }
  );
}

module.exports = {
  getUserByEmail,
  updateUserLoginAtttempt,
};
