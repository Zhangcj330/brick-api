"use client";

import { useRouter } from "next/navigation";
import { AuthPage } from "@/src/components/AuthPage";

export default function AuthRoutePage() {
  const router = useRouter();

  return (
    <AuthPage
      onBack={() => router.push("/")}
      onSuccess={() => router.push("/dashboard")}
    />
  );
}
