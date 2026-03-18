
import React from 'react';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';

const UserAccountPopover = () => {
  const { user, signOut } = useAuth();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="btn-subtle h-10 w-10 rounded-full p-0"
        >
          <User className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="surface-panel w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(var(--primary)/0.16)] bg-[hsl(var(--primary)/0.08)]">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-1 text-sm font-medium">
              账户信息
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="dialog-section-muted rounded-lg p-3">
              <div className="mb-1 text-xs text-muted-foreground">
                邮箱地址
              </div>
              <div className="break-all text-sm">
                {user?.email}
              </div>
            </div>
            
            <div className="dialog-section-muted rounded-lg p-3">
              <div className="mb-1 text-xs text-muted-foreground">
                用户ID
              </div>
              <div className="break-all font-mono text-xs text-muted-foreground">
                {user?.id}
              </div>
            </div>
          </div>

          <div className="border-t border-border/70 pt-2">
            <Button
              onClick={signOut}
              variant="outline"
              className="btn-quiet-danger w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserAccountPopover;
