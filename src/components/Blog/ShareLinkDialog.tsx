import { useState } from 'react';
import { Share2, Copy, Calendar, Clock, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { GitHubService } from '@/services/githubService';

interface ShareLinkDialogProps {
  blogId: string;
  githubService: GitHubService | null;
  trigger?: React.ReactNode;
}

export const ShareLinkDialog = ({ blogId, githubService, trigger }: ShareLinkDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expiryType, setExpiryType] = useState<'never' | '1day' | '7days' | '30days' | 'custom'>('never');
  const [customDate, setCustomDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState<string>('');
  const { toast } = useToast();

  const calculateExpiryDate = (type: string, customDate?: string): string | undefined => {
    const now = new Date();
    
    switch (type) {
      case '1day':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case '7days':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30days':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'custom':
        return customDate ? new Date(customDate).toISOString() : undefined;
      default:
        return undefined;
    }
  };

  const handleCreateLink = async () => {
    if (!githubService) return;

    setIsCreating(true);
    try {
      const shareLink = await githubService.createShareLink(blogId);
      setCreatedLink(shareLink);
      
      toast({
        title: "Lien créé",
        description: "Le lien de partage a été créé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le lien de partage",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(createdLink);
    toast({
      title: "Lien copié",
      description: "Le lien a été copié dans le presse-papiers",
    });
  };

  const resetDialog = () => {
    setCreatedLink('');
    setExpiryType('never');
    setCustomDate('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Créer un lien de partage
          </DialogTitle>
        </DialogHeader>
        
        {!createdLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Expiration du lien</Label>
              <Select value={expiryType} onValueChange={(value) => setExpiryType(value as typeof expiryType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">
                    <div className="flex items-center gap-2">
                      <Infinity className="w-4 h-4" />
                      Jamais
                    </div>
                  </SelectItem>
                  <SelectItem value="1day">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      1 jour
                    </div>
                  </SelectItem>
                  <SelectItem value="7days">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      7 jours
                    </div>
                  </SelectItem>
                  <SelectItem value="30days">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      30 jours
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date personnalisée
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {expiryType === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-date">Date d'expiration</Label>
                <Input
                  id="custom-date"
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
            
            <Button 
              onClick={handleCreateLink} 
              disabled={isCreating || (expiryType === 'custom' && !customDate)}
              className="w-full"
            >
              {isCreating ? 'Création...' : 'Créer le lien'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lien de partage créé</Label>
              <div className="flex gap-2">
                <Input 
                  value={createdLink} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetDialog} className="flex-1">
                Créer un autre
              </Button>
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};