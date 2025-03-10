"use server";

import { z } from "zod";
import { signUpSchema } from "./SignUpForm";
import { prisma } from "@/lib/prisma";
import { Argon2id } from "oslo/password";
import { lucia } from "@/lib/lucia";
import { cookies } from "next/headers";
import { signInSchema } from "./SignInForm";
import { redirect } from "next/navigation";
import { generateCodeVerifier, generateState } from "arctic";
import { googleOAuthClient } from "@/lib/googleOAuth";
//values : passing in from form
export const signUp = async (values: z.infer<typeof signUpSchema>) => {
  console.log("Im running in the server with values being", values);
  try {
    // if user already exists, throw error
    const existingUser = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    });
    if (existingUser) {
      return { error: "User already exist", success: false };
    }
    //oslo 5725
    const hashedPassword = await new Argon2id().hash(values.password);

    const user = await prisma.user.create({
      data: {
        email: values.email.toLowerCase(),
        name: values.name,
        hashedPassword,
      },
    });
    //10145
    /* 1. create session for the user
       2. create a cookie to store the session
       3. asking nextjs to make sure that the cookie is set on the user's browser
          whenever user comes to a website, it's going to give the cookie
          and we can validate all sort of req to make sure user is loged in */
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = await lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return {
      success: true,
    };
  } catch (error) {
    return { error: "Something went wrong", success: false };
  }
};

/* 1. get userId
   2. create session/cookie for user
   3. ask nextjs to set the cookie on the browser */
export const signIn = async (values: z.infer<typeof signInSchema>) => {
  console.log("im running in the server signing in", values);

  const user = await prisma.user.findUnique({
    where: {
      email: values.email,
    },
  });

  if (!user || !user.hashedPassword) {
    return { success: false, error: "Invalid Credentials" };
  }

  const passwordMatch = await new Argon2id().verify(
    user.hashedPassword,
    values.password
  );

  if (!passwordMatch) {
    return { success: false, error: "Invalid Credentials" };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = await lucia.createSessionCookie(session.id);
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return { success: true };
};

export const logOut = async () => {
  const sessionCookie = await lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect("/authenticate");
};

export const getGoogleOAuthConsentUrl = async () => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    (await cookies()).set("codeVerifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    (await cookies()).set("state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    const authUrl = await googleOAuthClient.createAuthorizationURL(
      state,
      codeVerifier,
      ["email", "profile"]
    );

    return { success: true, url: authUrl.toString() };
  } catch (error) {
    return { success: false, error: "something went wrong" };
  }
};
