// app/layout.tsx
import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/shared/components/navbar"

export const metadata: Metadata = {
  title: "Trading Platform",
  description: "Plateforme de trading avec API + SDK",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="w-full">
          {children}
        </main>
      </body>
    </html>
  )
}
