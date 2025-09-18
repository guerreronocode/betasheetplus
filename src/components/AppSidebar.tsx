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
  const { signOut } = useAuth()
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
    <Sidebar 
      className={`fnb-card border-r-2 border-fnb-accent/20 transition-all duration-150 rounded-r-2xl ${
        collapsed ? 'w-14 rounded-l-2xl' : 'w-64 rounded-l-2xl'
      }`}
      collapsible="icon"
    >
      <SidebarHeader className={`border-b border-fnb-accent/10 ${collapsed ? 'p-2' : 'p-4'}`}>
        <div className={`flex items-center ${collapsed ? 'flex-col gap-2 items-center' : 'justify-between'}`}>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={() => console.log('Abrindo gerenciamento de perfil...')}
            className={`fnb-card hover:bg-fnb-accent/10 transition-colors ${
              collapsed ? 'h-10 w-10' : 'gap-3'
            }`}
          >
            <User className="h-6 w-6 text-fnb-accent" />
            {!collapsed && <span className="font-title text-fnb-ink">Perfil</span>}
          </Button>
          
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-6 w-6"
            >
              <ChevronRight className="h-4 w-4 text-fnb-ink/70" />
            </Button>
          )}
        </div>
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
                  className={`w-full fnb-card hover:bg-fnb-accent/10 transition-colors ${
                    collapsed ? 'justify-center mb-2 h-10 w-10' : 'justify-start'
                  }`}
                >
                  <section.icon className="h-6 w-6 text-fnb-accent flex-shrink-0" />
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

      <SidebarFooter className={`border-t border-fnb-accent/10 ${collapsed ? 'p-2' : 'p-4'}`}>
        <div className={`${collapsed ? 'flex flex-col gap-2 items-center' : 'flex gap-2'}`}>
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleTutorials}
            className={`fnb-card hover:bg-fnb-secondary-blue/10 transition-colors ${
              collapsed ? 'h-10 w-10' : ''
            }`}
          >
            <Video className="h-5 w-5 text-fnb-secondary-blue" />
            {!collapsed && <span className="font-body">Tutoriais</span>}
          </Button>
          
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            onClick={handleLogout}
            className={`fnb-card hover:bg-red-500/10 transition-colors ${
              collapsed ? 'h-10 w-10' : ''
            }`}
          >
            <LogOut className="h-5 w-5 text-red-500" />
            {!collapsed && <span className="font-body text-red-500">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}