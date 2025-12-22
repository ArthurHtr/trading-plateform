import { SignInForm } from "@/features/authentification/components/sign-in-form"
import { redirect } from "next/navigation";
import { getSession } from "@/features/authentification/server/auth";

export default async function Page() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  )
}
