// create session cookies
// validating user tokens, session cookies

import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "auth-cookie",
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});

/*
  1. user carries with cookie object
  2. cookie contains session id
  3. user makes request to nextjs server
  4. take a cookie from user, look up session id, match session id in the db and find out user id
  5. see who is authenticated with server
*/
export const getUser = async () => {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value || null;
  if (!sessionId) {
    return null;
  }
  const { session, user } = await lucia.validateSession(sessionId);
  // console.log("sessionId : ", sessionId);
  // console.log("user : ", user);

  try {
    //session.fresh => not expired
    if (session && session.fresh) {
      const sessionCookie = await lucia.createSessionCookie(session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!session) {
      const sessionCookie = await lucia.createBlankSessionCookie();
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch (error) {}
  const dbUser = await prisma.user.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      name: true,
      email: true,
    },
  });
  return dbUser;
};
