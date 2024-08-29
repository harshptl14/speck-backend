import { Prisma } from '@prisma/client';

// create a user model
const User = Prisma.validator<Prisma.UserArgs>()({});

type User = Prisma.UserGetPayload<typeof User>;

export default User;