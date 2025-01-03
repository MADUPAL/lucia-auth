import SignOutButton from "@/components/SignOutButton";
import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";
import React from "react";

const DashboardPage = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/authenticate");
  }
  return (
    <>
      <div>you are logged in as {user.email}</div>{" "}
      <SignOutButton>Sign Outz</SignOutButton>
    </>
  );
};

export default DashboardPage;
