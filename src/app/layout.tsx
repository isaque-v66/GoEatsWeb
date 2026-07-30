import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "../shared/contexts/theme-context"
import { ToggleTheme } from "../shared/components/toggleTheme"
import { FormProvider } from "../features/register/contexts/formRegister-context"
import { UserProvider } from "../features/auth/contexts/user-context"
import "@/src/lib/cron-logic"
import { QueryProvider } from "../providers/query-provider"
import { Toaster } from "react-hot-toast"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Go Eats - Food Ordering System",
  description: "Corporate food ordering made simple",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <FormProvider>
            <UserProvider>
              <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      padding: "16px",
                    },
                    success: {
                      iconTheme: {
                        primary: "#16a34a",
                        secondary: "#fff",
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: "#dc2626",
                        secondary: "#fff",
                      },
                    },
                  }}
                />
              <QueryProvider>
                {children}
              </QueryProvider>
            </UserProvider>
            <ToggleTheme />
            <Analytics />
          </FormProvider>
        </ThemeProvider>
        
      </body>
    </html>
  )
}
