import passport from 'passport';
import passportGoogle from 'passport-google-oauth20'
import { getUserByEmail, insertUser } from "../services/user.service/userCRUD";
import User from "../models/user.model";

const GoogleStrategy = passportGoogle.Strategy;

export function useGoogleStrategy() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || '',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
                callbackURL: process.env.CALLBACK_URL || '',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    if (!profile._json.email) throw "User does not have email";

                    let user = await getUserByEmail(profile._json.email);

                    if (user) {
                        done(null, user);
                    } else {
                        const newUser = {
                            name: profile._json.name as string,
                            email: profile._json.email,
                        }
                        user = await insertUser(newUser)
                        done(null, user);
                    }
                } catch (err: any) {
                    console.error(err)
                    done(err)
                }
            }
        )
    );

    passport.serializeUser(function (user: Express.User, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user: Express.User, done) {
        done(null, user);
    });
}