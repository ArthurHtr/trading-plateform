import { GalleryVerticalEnd } from "lucide-react"
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/auth";

import { SignUpForm } from "@/components/features/authentification/sign-up-form"

export default async function SignupPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignUpForm />
      </div>
    </div>
  )
}
