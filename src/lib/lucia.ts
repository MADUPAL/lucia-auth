import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "./prisma";

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
const getUser = () => {};
