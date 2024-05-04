const passport = require('passport');
const passportJWT = require('passport-jwt');

const config = require('../../core/config');
const { bankingAccount } = require('../../models');

// Authenticate user based on the JWT token
passport.use(
  'banking',
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderWithScheme('bank'),
      secretOrKey: config.secret.jwt,
    },
    async (payload, done) => {
      const account = await bankingAccount.findOne({
        accountNumber: payload.accountNumber,
      });
      return account ? done(null, account) : done(null, false);
    }
  )
);

module.exports = passport.authenticate('banking', { session: false });
