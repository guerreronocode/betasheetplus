import React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider 
      defaultOpen={true}
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3.5rem",
      } as React.CSSProperties}
    >
      <div className="min-h-screen flex w-full bg-fnb-cream">
        <AppSidebar />
        <SidebarInset className="flex-1 w-0 max-w-full">
          {/* Header sempre visível com trigger para telas menores */}
          <div className="sticky top-0 z-50 flex items-center h-12 px-4 bg-fnb-cream/95 backdrop-blur supports-[backdrop-filter]:bg-fnb-cream/60 border-b border-fnb-accent/10 lg:hidden">
            <SidebarTrigger className="p-2" />
          </div>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}