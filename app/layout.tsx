import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import { cn } from "@/lib/utils"
import "@/app/globals.css"

const GeistMono = Geist_Mono({ subsets:["latin-ext"] })

export const metadata: Metadata = {
  title: "code battle",
  description: "A coding game where you can compete with other players by writing code to solve challenges."
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>): React.JSX.Element {
  return (
    <html
      lang="en"
      className={cn("dark", "h-full", "antialiased", "text-[14px]", GeistMono.className)}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  )
}