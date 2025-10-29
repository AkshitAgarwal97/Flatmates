import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as InstagramStrategy } from 'passport-instagram';
import passport from 'passport';
import User from '../models/User';

const configurePassport = (passport: passport.PassportStatic) => {
  // JWT Strategy for token authentication
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret'
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload: any, done: any) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (err) {
        console.error('Error in JWT strategy:', err);
        return done(err, false);
      }
    })
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/api/auth/google/callback'
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ socialId: profile.id, socialProvider: 'google' });

          if (user) {
            return done(null, user);
          }

          // If not, create new user
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            socialId: profile.id,
            socialProvider: 'google',
            // Default user type, will be updated during registration completion
            userType: 'room_seeker'
          });

          await user.save();
          return done(null, user);
        } catch (err) {
          console.error('Error in Google strategy:', err);
          return done(err, false);
        }
      }
    )
  );

  // Facebook OAuth Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID || '',
        clientSecret: process.env.FACEBOOK_APP_SECRET || '',
        callbackURL: '/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'photos', 'email']
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ socialId: profile.id, socialProvider: 'facebook' });

          if (user) {
            return done(null, user);
          }

          // If not, create new user
          user = new User({
            name: profile.displayName,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            socialId: profile.id,
            socialProvider: 'facebook',
            // Default user type, will be updated during registration completion
            userType: 'room_seeker'
          });

          await user.save();
          return done(null, user);
        } catch (err) {
          console.error('Error in Facebook strategy:', err);
          return done(err, false);
        }
      }
    )
  );

  // Instagram OAuth Strategy
  passport.use(
    new InstagramStrategy(
      {
        clientID: process.env.INSTAGRAM_CLIENT_ID || '',
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
        callbackURL: '/api/auth/instagram/callback'
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ socialId: profile.id, socialProvider: 'instagram' });

          if (user) {
            return done(null, user);
          }

          // If not, create new user
          user = new User({
            name: profile.displayName || profile.username,
            // Instagram API doesn't provide email, so we create a placeholder
            email: `${profile.id}@instagram.com`,
            avatar: profile._json.data.profile_picture,
            socialId: profile.id,
            socialProvider: 'instagram',
            // Default user type, will be updated during registration completion
            userType: 'room_seeker'
          });

          await user.save();
          return done(null, user);
        } catch (err) {
          console.error('Error in Instagram strategy:', err);
          return done(err, false);
        }
      }
    )
  );
};

export default configurePassport;
