import { AppSidebar } from "@/shared/components/app-sidebar"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/features/authentification/server/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  if (!session.user.emailVerified) {
    redirect("/auth/verify-email")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 md:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
