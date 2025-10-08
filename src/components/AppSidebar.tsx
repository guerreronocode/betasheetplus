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
  Menu,
  Settings,
  Trash2
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { AccountResetDialog } from "@/components/AccountResetDialog"

const dashboardItems = [
  { title: "Balanço mensal", icon: BarChart3, path: "/monthly-balance" },
  { title: "Análise financeira", icon: TrendingUp, path: "/financial-analysis" },
  { title: "Planos & Metas", icon: Target, path: "/goals-dashboard" },
  { title: "Investimentos", icon: PiggyBank, path: "/investment-dashboard" },
]

const controleItems = [
  { title: "Contas", icon: Banknote, path: "/bank-accounts" },
  { title: "Cartões", icon: CreditCard, path: "/credit-cards" },
  { title: "Lançamentos", icon: Plus, path: "/lancamentos" },
]

const patrimonioItems = [
  { title: "Investimentos", icon: PiggyBank, path: "/investments" },
  { title: "Dívidas", icon: FileText, path: "/" },
  { title: "Patrimônio", icon: Building, path: "/" },
]

const planejamentoItems = [
  { title: "Orçamento & Projeção", icon: Calendar, path: "/" },
  { title: "Objetivos & Metas", icon: Goal, path: "/" },
]

const mainSections = [
  { title: "Dashboards", icon: BarChart3, items: dashboardItems },
  { title: "Controle", icon: Wallet, items: controleItems },
  { title: "Gestão de Patrimônio", icon: Building, items: patrimonioItems },
  { title: "Planejamento", icon: Calendar, items: planejamentoItems },
]

export function AppSidebar() {
  const { state, setOpen } = useSidebar()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [openSections, setOpenSections] = useState<string[]>([])
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const collapsed = state === 'collapsed'

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    return user?.email?.split('@')[0] || 'Usuário'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const toggleSection = (sectionTitle: string) => {
    if (collapsed) {
      setOpen(true)
      setOpenSections([sectionTitle])
    } else {
      // Permite apenas uma seção aberta por vez
      setOpenSections(prev => 
        prev.includes(sectionTitle) 
          ? [] // Fecha a seção se já estiver aberta
          : [sectionTitle] // Abre apenas a seção clicada
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
        collapsed ? 'w-14 rounded-l-2xl' : 'w-56 rounded-l-2xl'
      }`}
      collapsible="icon"
    >
      <SidebarHeader className={`border-b border-fnb-accent/10 ${collapsed ? 'p-1' : 'p-4'}`}>
        <div className={`flex items-center ${collapsed ? 'flex-col gap-2 items-center' : 'justify-between'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size={collapsed ? "icon" : "sm"}
                className={`fnb-card hover:bg-fnb-accent/10 transition-colors ${
                  collapsed ? 'h-10 w-10' : 'gap-3'
                }`}
              >
                {collapsed ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-fnb-accent text-white text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-fnb-accent text-white text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-title text-fnb-ink">{getUserDisplayName()}</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-title">{getUserDisplayName()}</span>
                  <span className="text-xs text-fnb-ink/60 font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsResetDialogOpen(true)}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Zerar dados da conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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

      <AccountResetDialog 
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
      />

      <SidebarContent className="px-2 py-4">
        {mainSections.map((section) => (
          <SidebarGroup key={section.title}>
            <Collapsible 
              open={openSections.includes(section.title)}
              onOpenChange={() => toggleSection(section.title)}
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className={`w-full fnb-card transition-colors ${
                    collapsed ? 'justify-center mb-2 h-10 w-10' : 'justify-start'
                  } ${
                    openSections.includes(section.title) 
                      ? 'bg-green-800 [&:hover]:!bg-green-800' 
                      : 'hover:bg-fnb-accent/10'
                  }`}
                >
                  <section.icon className={`h-6 w-6 flex-shrink-0 ${
                    openSections.includes(section.title) ? 'text-white' : 'text-fnb-accent'
                  }`} />
                  {!collapsed && (
                    <span className={`font-title ${
                      openSections.includes(section.title) ? 'text-white' : 'text-fnb-ink'
                    }`}>{section.title}</span>
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              
              {!collapsed && (
                <CollapsibleContent>
                  <SidebarGroupContent className="ml-2 mt-2 min-w-0 overflow-hidden max-w-full">
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            className="hover:bg-fnb-accent/5 transition-colors text-xs truncate"
                            onClick={() => navigate(item.path || '/')}
                          >
                            <item.icon className="h-4 w-4 text-fnb-ink/70 flex-shrink-0" />
                            <span className="font-body text-fnb-ink/90 truncate">{item.title}</span>
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

      <SidebarFooter className={`border-t border-fnb-accent/10 ${collapsed ? 'p-1' : 'p-4'}`}>
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