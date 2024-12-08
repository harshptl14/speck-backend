import express, { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from "jsonwebtoken";

export const authRouter: Router = express.Router();

// Helper function to get cookie configuration based on environment
const getCookieConfig = (isProduction: boolean) => {
    const baseConfig = {
        // httpOnly: true, // Enable httpOnly for security
        // secure: isProduction, // Only require secure in production
        secure: true,
        sameSite: 'none',
        // sameSite: isProduction ? 'none' : 'lax', // 'none' for production (cross-domain), 'lax' for development
        // maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
    } as const;

    // Only add domain in production
    if (isProduction && process.env.MAIN_DOMAIN) {
        return {
            ...baseConfig,
            domain: process.env.MAIN_DOMAIN
        };
    }

    return baseConfig;
};

authRouter.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth',
        successRedirect: '/speck/v1/auth/google/success',
    })
);

authRouter.get('/google/success', (req: Request, res: Response) => {
    console.log("in google success");

    try {
        if (!req.user) {
            throw new Error('No user found in request');
        }

        const token = jwt.sign(
            { user: req.user },
            process.env.JWT_SECRET || '',
            { expiresIn: "2h" }
        );

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieConfig = getCookieConfig(isProduction);

        res.cookie('jwtToken', token, cookieConfig);

        // Redirect to the appropriate frontend URL
        res.redirect(process.env.REDIRECT_URL_FRONTEND || '/');
    } catch (error) {
        console.error('Error in Google success redirect:', error);
        res.redirect('/auth?error=authentication_failed');
    }
});

authRouter.get('/logout', function (req: Request, res: Response, next: NextFunction) {
    req.logout(function (err) {
        if (err) { return next(err); }

        const isProduction = process.env.NODE_ENV === 'production';
        const cookieConfig = getCookieConfig(isProduction);

        // Clear the cookie using the same configuration used to set it
        res.clearCookie('jwtToken', cookieConfig);

        req.session.destroy(function (err) {
            if (err) { return next(err); }
            res.redirect(process.env.URL_FRONTEND || '/');
        });
    });
});

authRouter.post('/verify-token', (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.token;

    if (!token) {
        return res.status(400).json({ valid: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
        res.json({ valid: true, user: decoded });
    } catch (error) {
        req.logout(function (err) {
            if (err) {
                console.error('Error during logout:', err);
            }

            const isProduction = process.env.NODE_ENV === 'production';
            const cookieConfig = getCookieConfig(isProduction);

            res.clearCookie('jwtToken', cookieConfig);
            res.status(401).json({ valid: false, message: 'Invalid or expired token' });
        });
    }
});