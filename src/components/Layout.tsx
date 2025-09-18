import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
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
        <SidebarInset className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}