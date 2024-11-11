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
        const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        console.log("Requested URL:", fullUrl);

        try {
            console.log(req.user);

            const token = jwt.sign(
                { user: req.user },
                process.env.JWT_SECRET || '',
                { expiresIn: "2h" },
            );
            console.log("setting cookie");

            // res.cookie('jwtToken', token,
            //     {
            //         path: '/',
            //         // "domain" - The cookie belongs to the 'example.com' domain
            //         domain: process.env.REDIRECT_URL_FRONTEND || 'localhost',
            //         // "secure" - The cookie will be sent over HTTPS only
            //         secure: true,
            //         // "HttpOnly" - The cookie cannot be accessed by client-side scripts
            //         httpOnly: true,
            //         sameSite: 'none'
            //     }
            // );

            res.cookie('jwtToken', token, {
                httpOnly: true,
                secure: true,

                sameSite: "none",
                maxAge: 2 * 60 * 60 * 1000, // 2 hours
                path: '/',
                domain: process.env.ENVIRONMENT === 'production' ? process.env.REDIRECT_URL_FRONTEND : undefined
            });

            console.log("token", token);

            res.redirect(process.env.REDIRECT_URL_FRONTEND || '/');
        } catch (error) {
            console.log('Error in Google callback:', error);
            res.redirect('/auth?error=authentication_failed');
        }
    }
);

authRouter.get('/logout', function (req: Request, res: Response, next: NextFunction) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.clearCookie('jwtToken');
        req.session.destroy(function (err) {
            if (err) { return next(err); }
            res.redirect(process.env.REDIRECT_URL_FRONTEND || '/');
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
