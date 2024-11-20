import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: "Authorization token is missing" });
    }
    if (!token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token should start with Bearer" });
    }
    const jwtToken = token.substring(7);
    try {
        console.log("checking token");
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET || '') as { user: any };
        req.user = decoded.user;
        console.log("backend:", decoded);
        next();
    } catch (err) {
        // res.clearCookie('jwtToken');
        console.log("error in jwtAuth", err);

        res.setHeader('Set-Cookie', 'jwtToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
        console.log(err);
        // res.redirect('/auth');
        return res.status(401).json({ message: "Token Expired" });
    }
};
// Middleware to check and refresh access token
// const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // Check if access token is expired
//         const decodedToken = jwt.verify(req.cookies.jwtToken, process.env.JWT_SECRET);
//         if (decodedToken.exp < Date.now() / 1000) {
//             // Access token is expired, use refresh token to get new access token
//             const newAccessToken = await refreshToken(decodedToken.user.refreshToken);
//             // Generate new JWT token with updated access token
//             const newJwtToken = jwt.sign({ user: { ...decodedToken.user, accessToken: newAccessToken } }, process.env.JWT_SECRET, { expiresIn: '1h' });
//             // Update JWT token in cookie
//             res.cookie('jwtToken', newJwtToken);
//         }
//         next();
//     } catch (err) {
//         next(err);
//     }
// };

// // Protect route using the refreshAccessToken middleware
// someRouter.post('/', refreshAccessToken, async (req: Request, res: Response, next: NextFunction) => {
//     // Router implementation
// });

// // Function to refresh access token using refresh token
// async function refreshToken(refreshToken: string) {
//     // Make POST request to Google OAuth2 token endpoint with refresh token
//     // and receive new access token
//     // Return the new access token
// }

// Middleware to check and refresh access token const refreshAccessToken = async (req, res, next) => {   try {     // Check if access token is expired     const decodedToken = jwt.verify(req.cookies.jwtToken, process.env.JWT_SECRET);     if (decodedToken.exp < Date.now() / 1000) {       // Access token is expired, use refresh token to get new access token       const newAccessToken = await refreshToken(decodedToken.user.refreshToken);       // Generate new JWT token with updated access token       const newJwtToken = jwt.sign({ user: { ...decodedToken.user, accessToken: newAccessToken } }, process.env.JWT_SECRET, { expiresIn: '1h' });       // Update JWT token in cookie       res.cookie('jwtToken', newJwtToken);     }     next();   } catch (err) {     next(err);   } };  // Protect route using the refreshAccessToken middleware someRouter.post('/', refreshAccessToken, async (req, res, next) => {   // Router implementation });  // Function to refresh access token using refresh token async function refreshToken(refreshToken) {   // Make POST request to Google OAuth2 token endpoint with refresh token   // and receive new access token   // Return the new access token }
