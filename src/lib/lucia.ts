// create session cookies
// validating user tokens, session cookies

import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { prisma } from './prisma';

const adapter = new PrismaAdapter(prisma.session, prisma.user)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: 'auth-cookie',
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  }
})