'use server';

import { z } from "zod";
import { signUpSchema } from "./SignUpForm";
import { prisma } from "@/lib/prisma";
import { Argon2id } from 'oslo/password';

//values : passing in from form
export const signUp = async (values: z.infer<typeof signUpSchema>) => {
  console.log('im running in the server with values being', values)
  try {
    // if user already exists, throw error
    const existingUser = await prisma.user.findUnique({
      where : {
        email: values.email
      }
    })
    if (existingUser) {
      return {error: 'User already exists', success: false}
    }
    //oslo 5725
    const hashedPassword = await new Argon2id().hash(values.password)

    const user = await prisma.user.create({
      data : {
        email: values.email.toLowerCase(),
        name: values.name,
        hashedPassword
      }
    })
  } catch (error) {
    
  }
}