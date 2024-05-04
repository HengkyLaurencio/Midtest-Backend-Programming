const jwt = require('jsonwebtoken');

const config = require('../core/config');

/**
 * Decode token to extract payload.
 * @param {string} token - The token.
 * @returns {object} - The decoded token payload.
 */
function getTokenPayload(token) {
  const decoded = jwt.verify(token, config.secret.jwt);
  return decoded;
}

module.exports = { getTokenPayload };
