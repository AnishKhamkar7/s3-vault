import { TRPCError } from '@trpc/server';
import { middleware } from '@server/lib/trpc';
import jwt from 'jsonwebtoken';
import { env } from '@server/utils/env';
import type { BaseContext } from '@server/types';

export const verifyRefresh = middleware<BaseContext>(({ ctx, next }) => {
  const token = ctx.req.cookies['Refresh-Token'];
  if (!token) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Refresh token missing' });
  try {
    jwt.verify(token, env.JWT_REFRESH_SECRET);
    return next();
  } catch {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid refresh token' });
  }
});

//Can be used later for permission based access control

// export const validatePermissions = (resource: PermissionResource, permissions: Permission[]) => {
//   return middleware(async ({ ctx, input, next }) => {
//     const user = ctx.session!.user;
//     if (!user)
//       throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized access - Log in to access the resource!!' });

//     // Assert that input is an object with string keys
//     const tinput = input as Record<string, unknown>; // or whatever structure you expect
//     const id = tinput[resource] as string;
//     if (!id) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Missinng resource id!' });

//     let collaboration: (Collaboration & { role: Role }) | null = null;

//     switch (resource) {
//       case 'group':
//         collaboration = await db.collaboration.findFirst({
//           where: { userId: user.id, groupId: id },
//           include: { role: true },
//         });
//       case 'hotel':
//         collaboration = await db.collaboration.findFirst({
//           where: { userId: user.id, OR: [{ hotels: { has: '*' } }, { hotels: { has: id } }] },
//           include: { role: true },
//         });
//     }

//     if (!collaboration)
//       throw new TRPCError({ code: 'FORBIDDEN', message: 'Collaboration not found with required permissions!' });
//     if (collaboration.role.permissions[0] === '*') return next(); // is owner

//     // user permissions
//     const rp = collaboration.role.permissions;
//     const satisfies = permissions.every((p) => rp.includes(p));
//     if (!satisfies)
//       throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not permitted to perform this action!' });

//     return next();
//   });
// };
