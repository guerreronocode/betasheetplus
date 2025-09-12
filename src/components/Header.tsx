
import React, { useState } from 'react';
import { Star, Coins, Calendar, LogOut, Settings, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { AccountResetDialog } from '@/components/AccountResetDialog';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, signOut } = useAuth();
  
  const navigate = useNavigate();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="relative" style={{ 
      background: 'linear-gradient(135deg, var(--brand-cream), rgba(196,214,58,.08))', 
      borderBottom: '1px solid rgba(196,214,58,.15)', 
      boxShadow: 'var(--shadow-soft)' 
    }}>
      {/* Formas orgânicas decorativas */}
      <div className="organic-shape absolute top-4 right-16 w-24 h-24 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="organic-shape absolute top-8 right-80 w-16 h-16 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="animate-scale-in">
            <h1 className="text-3xl font-bold mb-1" style={{ 
              fontFamily: 'var(--font-display)', 
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              Futuro no Bolso
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              Seu futuro sob seu controle
            </p>
            <p className="text-sm flex items-center mt-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              <Calendar className="w-4 h-4 mr-2 opacity-70" />
              {currentDate}
            </p>
          </div>
          
          <div className="flex items-center space-x-6">

            {user && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-sm font-semibold" style={{ 
                    background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', 
                    color: 'var(--brand-ink)' 
                  }}>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="hidden md:block">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {user.email}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-full transition-all duration-200 hover:bg-white/50 hover:shadow-md" style={{ color: 'var(--text-muted)' }}>
                      <Settings className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setIsResetDialogOpen(true)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Zerar todos os dados
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair da conta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AccountResetDialog 
        open={isResetDialogOpen} 
        onOpenChange={setIsResetDialogOpen}
      />
    </header>
  );
};

export default Header;
