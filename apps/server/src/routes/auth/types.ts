import z from 'zod';

const Auth = z.object({
  email: z.string().email(),
  name: z.string().max(50).optional(),
  type: z.enum(['SIGN_UP', 'SIGN_IN']),
});
const Verify = z.object({ email: z.string().email(), code: z.string() });

export default { Auth, Verify };
