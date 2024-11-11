import express, { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport'
import jwt from "jsonwebtoken";

export const authRouter: Router = express.Router();

authRouter.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth' }),
    (req: Request, res: Response) => {
        try {
            // Generate JWT
            const token = jwt.sign(
                { user: req.user },
                process.env.JWT_SECRET || '',
                { expiresIn: "2h" },
            );
            console.log("Setting cookie");

            // Set cookie with correct domain
            res.cookie('jwtToken', token, {
                httpOnly: true,          // Prevents JavaScript access
                secure: true,            // Ensures cookie is sent over HTTPS
                sameSite: 'none',        // Allows cross-site cookie
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                path: '/',               // Root path
                domain: '.speck.ing',    // Parent domain for subdomain access
            });

            console.log("Token set:", token);

            // Redirect to frontend callback
            res.redirect('https://app.speck.ing/auth/callback');
        } catch (error) {
            console.log('Error in Google callback:', error);
            res.redirect('/auth?error=authentication_failed');
        }
    }
);

authRouter.get('/logout', function (req: Request, res: Response, next: NextFunction) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.clearCookie('jwtToken', { 
            path: '/', 
            domain: '.speck.ing',
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        req.session.destroy(function (err) {
            if (err) { return next(err); }
            res.redirect('https://app.speck.ing');
        });
    });
});

authRouter.post('/verify-token', (req, res, next) => {
    debugger;
    const token = req.body.token;
    console.log("token", token);


    if (!token) {
        return res.status(400).json({ valid: false, message: 'No token provided' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET || '');
        res.json({ valid: true });
    } catch (error) {

        req.logout(function (err) {
            console.log("in logout fun");
            res.cookie('jwtToken', '');
            res.status(401).json({ valid: false, message: 'Invalid or expired token' });
        });
    }
});
