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
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req: Request, res: Response) => {
        console.log(req.user);

        const token = jwt.sign(
            { user: req.user },
            process.env.JWT_SECRET || '',
            { expiresIn: "2h" },
        );
        res.cookie('jwtToken', token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            path: '/',
        });
        res.redirect(process.env.REDIRECT_URL_FRONTEND || '/');
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
