import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/app/components/login-form";

export const metadata: Metadata = {
  title: "Sign in · Sniff",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
