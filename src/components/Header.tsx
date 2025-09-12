
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
    <header className="bg-card border-b border-border fnb-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="fnb-heading text-2xl font-bold text-fnb-primary">
              Futuro no Bolso
            </h1>
            <p className="fnb-body text-sm text-muted-foreground flex items-center mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              {currentDate}
            </p>
          </div>
          
          <div className="flex items-center space-x-6">

            {user && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground fnb-body text-sm fnb-shape">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="hidden md:block">
                  <p className="fnb-body text-sm font-medium text-foreground">
                    {getUserDisplayName()}
                  </p>
                  <p className="fnb-body text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground fnb-shape"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
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
