
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, LogOut, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const AuthButtons = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('icecast_auth'));
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showDialog, setShowDialog] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Encode credentials for basic auth
      const encoded = btoa(`${credentials.username}:${credentials.password}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encoded}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        localStorage.setItem('icecast_auth', encoded);
        localStorage.setItem('icecast_user', credentials.username);
        setIsLoggedIn(true);
        setShowDialog(false);
        toast.success('Login successful');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('icecast_auth');
    localStorage.removeItem('icecast_user');
    setIsLoggedIn(false);
    toast.success('Logged out successfully');
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <User size={14} />
          {localStorage.getItem('icecast_user')}
        </span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut size={14} className="mr-1" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <LogIn size={14} className="mr-1" />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Login to Icecast Admin</DialogTitle>
          <DialogDescription>
            Enter your Icecast admin credentials to access server management
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              placeholder="admin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleLogin} disabled={isLoading || !credentials.username || !credentials.password}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
