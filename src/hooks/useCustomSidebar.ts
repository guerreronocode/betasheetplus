import { useState, useEffect } from 'react'
import { useSidebar } from '@/components/ui/sidebar'

export function useCustomSidebar() {
  const sidebarContext = useSidebar()
  const [shouldUseOverlay, setShouldUseOverlay] = useState(false)
  
  useEffect(() => {
    const checkOverlay = () => {
      // Para telas entre 1024px e 1180px, usar comportamento de overlay
      const width = window.innerWidth
      setShouldUseOverlay(width >= 1024 && width <= 1180)
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