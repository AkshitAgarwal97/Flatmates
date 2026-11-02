import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Join free",
  description: "Create a free Flatmates.co.in account to post rooms and chat with flatmates.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
