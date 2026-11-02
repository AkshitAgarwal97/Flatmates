import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Login",
  description: "Log in to Flatmates.co.in to chat with flatmates and manage listings.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
