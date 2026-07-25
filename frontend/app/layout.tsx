import type { Metadata } from "next"
import { Geist_Mono, Geist } from "next/font/google"
import "@/app/globals.css"
import { cn } from "@/lib/utils"
import UserStatusProvider from "@/providers/userStatus"

const geist = Geist({ subsets:["latin"], variable:"--font-sans" })

const GeistMono = Geist_Mono({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
})

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
      className={cn("h-full", "antialiased", "text-[14px]", GeistMono.className, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
        <UserStatusProvider>
          {children}
        </UserStatusProvider>
      </body>
    </html>
  )
}