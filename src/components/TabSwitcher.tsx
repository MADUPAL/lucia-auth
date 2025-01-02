"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type Props = { SignUpTab: React.ReactNode; SignInTab: React.ReactNode };

const TabSwitcher = (props: Props) => {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="sign-in">Sign in</TabsTrigger>
        <TabsTrigger value="sign-up">Sign up</TabsTrigger>
      </TabsList>
      <TabsContent value="sign-in">{props.SignInTab}</TabsContent>
      <TabsContent value="sign-up">{props.SignUpTab}</TabsContent>
    </Tabs>
  );
};

export default TabSwitcher;
