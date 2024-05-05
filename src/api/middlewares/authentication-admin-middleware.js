const passport = require('passport');
const passportJWT = require('passport-jwt');

const config = require('../../core/config');
const { User } = require('../../models');

// Authenticate user based on the JWT token
passport.use(
  'admin',
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderWithScheme('jwt'),
      secretOrKey: config.secret.jwt,
    },
    async (payload, done) => {
      const user = await User.findOne({ _id: payload.userId });
      if (!user) return done(null, false);
      return user.email == 'admin@example.com'
        ? done(null, user)
        : done(null, false);
    }
  )
);

module.exports = passport.authenticate('admin', { session: false });
