import React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useCustomSidebar } from "@/hooks/useCustomSidebar"

interface LayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: LayoutProps) {
  const { shouldUseOverlay, closeOverlay } = useCustomSidebar()
  
  return (
    <div className="min-h-screen flex w-full bg-fnb-cream relative">
      <AppSidebar />
      
      <SidebarInset className={`flex-1 transition-all duration-200 ${
        shouldUseOverlay ? 'relative' : ''
      }`}>
        {/* Trigger da sidebar - sempre visível no topo para telas na faixa de overlay */}
        {shouldUseOverlay && (
          <div className="sticky top-0 z-50 bg-fnb-cream/95 backdrop-blur-sm border-b border-fnb-accent/10 p-2">
            <SidebarTrigger />
          </div>
        )}
        {children}
      </SidebarInset>
    </div>
  )
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider 
      defaultOpen={true}
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3.5rem",
        "--sidebar-width-mobile": "16rem",
      } as React.CSSProperties}
    >
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  )
}