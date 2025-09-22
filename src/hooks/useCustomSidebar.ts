import { useState, useEffect } from 'react'
import { useSidebar } from '@/components/ui/sidebar'

export function useCustomSidebar() {
  const sidebarContext = useSidebar()
  const [shouldUseOverlay, setShouldUseOverlay] = useState(false)
  
  useEffect(() => {
    const checkOverlay = () => {
      // Para telas menores que 1024px (lg), usar comportamento de overlay
      setShouldUseOverlay(window.innerWidth < 1024)
    }
    
    checkOverlay()
    window.addEventListener('resize', checkOverlay)
    return () => window.removeEventListener('resize', checkOverlay)
  }, [])
  
  const isOverlayOpen = shouldUseOverlay && (sidebarContext.isMobile ? sidebarContext.openMobile : sidebarContext.open)
  
  const closeOverlay = () => {
    if (sidebarContext.isMobile) {
      sidebarContext.setOpenMobile(false)
    } else {
      sidebarContext.setOpen(false)
    }
  }
  
  return {
    ...sidebarContext,
    shouldUseOverlay,
    isOverlayOpen,
    closeOverlay
  }
}