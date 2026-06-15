"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { CartProvider } from "@/hooks/use-cart"
import { WishlistProvider } from "@/hooks/use-wishlist"
import { LanguageProvider } from "@/hooks/use-language"
import { AdminProvider } from "@/hooks/use-admin"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import BottomNavbar from "@/components/bottom-navbar"
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button"
import { GoogleOAuthProvider } from "@react-oauth/google"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  const isAdminRoute = pathname?.startsWith("/admin")

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <LanguageProvider>
          <AuthProvider>
            <AdminProvider>
              <CartProvider>
                <WishlistProvider>
                  <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
                    {!isAdminRoute && <Navbar />}
                    <main className={`flex-1 ${isAdminRoute ? "" : "pt-[110px] md:pt-[138px]"}`}>{children}</main>
                    {pathname === "/" && <Footer />}
                    {!isAdminRoute && <BottomNavbar />}
                    {!isAdminRoute && <FloatingWhatsAppButton />}
                  </div>
                  <Toaster />
                </WishlistProvider>
              </CartProvider>
            </AdminProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  )
}