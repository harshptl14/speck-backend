import { User } from "../interfaces/User"
import { deleteUser } from "../services/user.service/userCRUD";
import { Request, Response } from 'express';

export const getUserInfo = (req: Request, res: Response) => {
    const user = req?.user as User;
    console.log("user in settings", user);

    res.status(200).json({
        message: 'User retrieved successfully',
        data: user,
    });
}


export const deleteUserAccount = async (req: Request, res: Response) => {
    const user = req?.user as User;
    console.log("user in settings", user);

    try {
        // Delete the user and all related data
        await deleteUser(user.id);

        res.status(200).json({
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            message: 'Failed to delete user',
        });
    }
}