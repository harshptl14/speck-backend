import express from 'express';
import { getUserInfo, deleteUserAccount } from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.get(
    '/userinfo',
    getUserInfo
);

userRouter.delete(
    '/delete-account',
    deleteUserAccount
);
export default userRouter;