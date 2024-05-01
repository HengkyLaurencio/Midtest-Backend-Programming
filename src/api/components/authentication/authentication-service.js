const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const { date } = require('joi');

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  if (!passwordChecked) {
    await authenticationRepository.updateUserLoginAtttempt(
      user.id,
      user.loginAttempts + 1,
      new Date()
    );
  }

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    await authenticationRepository.updateUserLoginAtttempts(
      user.id,
      0,
      new Date()
    );

    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }

  return null;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await authenticationRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

async function checkLoginAttempt(email) {
  const user = await authenticationRepository.getUserByEmail(email);

  const lastLoginAttempt = user.lastLoginAttempt;
  const now = new Date();
  const timeDifference = now - lastLoginAttempt;

  if (timeDifference > 30 * 60 * 1000) {
    await authenticationRepository.updateUserLoginAtttempt(
      user.id,
      0,
      lastLoginAttempt
    );
  }

  const loginAttempts = user.loginAttempts;
  if (loginAttempts == 5) {
    return false;
  }

  return true;
}

module.exports = {
  checkLoginCredentials,
  emailIsRegistered,
  checkLoginAttempt,
};
