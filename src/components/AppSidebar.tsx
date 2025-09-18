import React, { useState } from "react"
import { 
  BarChart3, 
  PiggyBank, 
  TrendingUp, 
  Target,
  Banknote,
  CreditCard,
  Plus,
  Wallet,
  Building,
  FileText,
  Calendar,
  Goal,
  Video,
  LogOut,
  ChevronRight,
  User,
  Menu
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"

const dashboardItems = [
  { title: "Balanço mensal", icon: BarChart3 },
  { title: "Análise financeira", icon: TrendingUp },
  { title: "Planos & Metas", icon: Target },
  { title: "Investimentos", icon: PiggyBank },
]

const controleItems = [
  { title: "Contas", icon: Banknote },
  { title: "Cartões", icon: CreditCard },
  { title: "Lançamentos", icon: Plus },
]

const patrimonioItems = [
  { title: "Investimentos", icon: PiggyBank },
  { title: "Dívidas", icon: FileText },
  { title: "Patrimônio", icon: Building },
]

const planejamentoItems = [
  { title: "Orçamento & Projeção", icon: Calendar },
  { title: "Objetivos & Metas", icon: Goal },
]

const mainSections = [
  { title: "Dashboards", icon: BarChart3, items: dashboardItems },
  { title: "Controle", icon: Wallet, items: controleItems },
  { title: "Gestão de Patrimônio", icon: Building, items: patrimonioItems },
  { title: "Planejamento", icon: Calendar, items: planejamentoItems },
]

export function AppSidebar() {
  const { state, setOpen } = useSidebar()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [openSections, setOpenSections] = useState<string[]>([])
  const collapsed = state === 'collapsed'

  const toggleSection = (sectionTitle: string) => {
    if (collapsed) {
      setOpen(true)
      setOpenSections([sectionTitle])
    } else {
      setOpenSections(prev => 
        prev.includes(sectionTitle) 
          ? prev.filter(s => s !== sectionTitle)
          : [...prev, sectionTitle]
      )
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleTutorials = () => {
    // TODO: Implementar redirecionamento para tutoriais
    console.log('Abrindo tutoriais...')
  }

  return (
    <Sidebar className="fnb-card border-r-2 border-fnb-accent/20">
      <SidebarHeader className="p-4 border-b border-fnb-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 fnb-card">
              <AvatarFallback className="bg-fnb-accent text-fnb-ink text-sm font-title">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-title text-fnb-ink">Perfil</span>
                <span className="text-xs text-fnb-ink/70 font-body">{user?.email}</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <SidebarTrigger>
              <ChevronRight className="h-4 w-4 text-fnb-ink/70" />
            </SidebarTrigger>
          )}
        </div>
        {collapsed && (
          <div className="mt-2">
            <SidebarTrigger>
              <Menu className="h-4 w-4 text-fnb-ink/70" />
            </SidebarTrigger>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {mainSections.map((section) => (
          <SidebarGroup key={section.title}>
            <Collapsible 
              open={openSections.includes(section.title)}
              onOpenChange={() => toggleSection(section.title)}
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className="w-full justify-start fnb-card hover:bg-fnb-accent/10 transition-colors"
                >
                  <section.icon className="h-5 w-5 text-fnb-accent" />
                  {!collapsed && (
                    <>
                      <span className="font-title text-fnb-ink">{section.title}</span>
                      <ChevronRight className={`ml-auto h-4 w-4 text-fnb-ink/50 transition-transform ${
                        openSections.includes(section.title) ? 'rotate-90' : ''
                      }`} />
                    </>
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              
              {!collapsed && (
                <CollapsibleContent>
                  <SidebarGroupContent className="ml-4 mt-2">
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton className="hover:bg-fnb-accent/5 transition-colors">
                            <item.icon className="h-4 w-4 text-fnb-ink/70" />
                            <span className="font-body text-fnb-ink/90">{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              )}
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-fnb-accent/10">
        <div className={`${collapsed ? 'flex flex-col gap-2' : 'flex gap-2'}`}>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleTutorials}
            className="fnb-card hover:bg-fnb-secondary-blue/10 transition-colors"
          >
            <Video className="h-4 w-4 text-fnb-secondary-blue" />
            {!collapsed && <span className="font-body">Tutoriais</span>}
          </Button>
          
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleLogout}
            className="fnb-card hover:bg-fnb-secondary-red/10 transition-colors"
          >
            <LogOut className="h-4 w-4 text-fnb-secondary-red" />
            {!collapsed && <span className="font-body">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}