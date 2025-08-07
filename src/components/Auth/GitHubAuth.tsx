import { useState } from 'react';
import { Github, Key, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface GitHubAuthProps {
  onAuthenticated: (token: string) => void;
}

export const GitHubAuth = ({ onAuthenticated }: GitHubAuthProps) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async () => {
    if (!token.trim()) {
      toast({
        title: "Token requis",
        description: "Veuillez entrer votre token GitHub",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Verify GitHub token
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_user', JSON.stringify(userData));
        
        toast({
          title: "Authentification réussie",
          description: `Bienvenue ${userData.login}!`,
        });
        
        onAuthenticated(token);
      } else {
        throw new Error('Token invalide');
      }
    } catch (error) {
      toast({
        title: "Erreur d'authentification",
        description: "Token GitHub invalide",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 glass-effect neon-glow">
        <div className="text-center space-y-6">
          {/* Logo/Header */}
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center neon-glow">
              <Github className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Blog Platform
              </h1>
              <p className="text-muted-foreground mt-2">
                Authentifiez-vous avec votre token GitHub
              </p>
            </div>
          </div>

          {/* Auth Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Key className="w-4 h-4" />
                <span>Token GitHub Personnel</span>
              </div>
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="glass-effect"
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>

            <Button 
              onClick={handleAuth} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 neon-glow"
            >
              {isLoading ? 'Authentification...' : 'Se connecter'}
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <Shield className="w-4 h-4" />
              <span>Vos données restent privées</span>
            </div>
            <p>
              Créez un token sur{' '}
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-secondary transition-colors underline"
              >
                GitHub Settings
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};