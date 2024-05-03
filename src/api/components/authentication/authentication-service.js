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

  const passwordChecked = await passwordMatched(password, user.password);

  // Update login attempt count based on password verification result
  // If the password is verified, reset the login attempts to 0,
  // indicating a successful login. Otherwise, increment the login attempts count by 1.
  const loginAttempts = passwordChecked ? 0 : user.loginAttempts + 1;
  // Update the user's login attempt count in the database, along with the current timestamp.
  await authenticationRepository.updateUserLoginAtttempt(
    user.id,
    loginAttempts,
    new Date()
  );

  // If password is correct, return user data and token
  if (passwordChecked) {
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

/**
 * Check login attempt
 * @param {string} email - Email
 * @returns {boolean}
 */
async function checkLoginAttempt(email) {
  const user = await authenticationRepository.getUserByEmail(email);

  // Calculate the time difference between the last login attempt and the current time
  const lastLoginAttempt = user.lastLoginAttempt;
  const now = new Date();
  const timeDifference = now - lastLoginAttempt;

  // If the time difference exceeds the login attempt interval, reset the login attempts
  if (timeDifference > 30 * 60 * 1000) {
    // 30 minutes in milliseconds
    await authenticationRepository.updateUserLoginAtttempt(
      user.id,
      0,
      lastLoginAttempt
    );
    return true;
  }

  // If the user has reached the maximum number of login attempts, deny further attempts
  if (user.loginAttempts >= 5) {
    return false;
  }

  return true;
}

module.exports = {
  checkLoginCredentials,
  emailIsRegistered,
  checkLoginAttempt,
};
