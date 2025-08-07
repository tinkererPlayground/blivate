import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Github, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BlogCard } from './BlogCard';
import { ShareLinkDialog } from './ShareLinkDialog';
import { useToast } from '@/components/ui/use-toast';
import { GitHubService } from '@/services/githubService';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface BlogDashboardProps {
  onCreateNew: () => void;
  onEditPost: (id: string) => void;
  onViewPost: (id: string) => void;
  onLogout: () => void;
  githubService: GitHubService | null;
}

export const BlogDashboard = ({ 
  onCreateNew, 
  onEditPost, 
  onViewPost, 
  onLogout,
  githubService 
}: BlogDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBlogPosts();
  }, [githubService]);

  const loadBlogPosts = async () => {
    if (!githubService) return;
    
    setIsLoading(true);
    try {
      const blogPosts = await githubService.getAllBlogPosts();
      setPosts(blogPosts);
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les blogs depuis GitHub",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!githubService) return;
    
    try {
      await githubService.deleteBlogPost(id);
      setPosts(prev => prev.filter(post => post.id !== id));
      toast({
        title: "Blog supprimé",
        description: "Le blog a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur de suppression", 
        description: "Impossible de supprimer le blog",
        variant: "destructive",
      });
    }
  };

  const handleSharePost = (id: string) => {
    // Cette fonction n'est plus utilisée car nous utilisons ShareLinkDialog
    return id;
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const githubUser = JSON.parse(localStorage.getItem('github_user') || '{}');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center neon-glow shrink-0">
                <Github className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Blog Platform
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Connecté en tant que {githubUser.login}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                onClick={onCreateNew}
                className="bg-gradient-to-r from-primary to-secondary neon-glow flex-1 sm:flex-none"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Nouveau blog</span>
                <span className="xs:hidden">Nouveau</span>
              </Button>
              
              <Button variant="outline" onClick={onLogout} size="sm">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search & Filters */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 glass-effect">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher dans vos blogs..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filtres</span>
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-4 sm:p-6 glass-effect">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{posts.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Blogs créés</div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 glass-effect">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-secondary">
                {posts.reduce((acc, post) => acc + post.tags.length, 0)}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Tags utilisés</div>
            </div>
          </Card>
          
          <Card className="p-4 sm:p-6 glass-effect">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GitHub
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Stockage sécurisé</div>
            </div>
          </Card>
        </div>

        {/* Blog Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Vos blogs</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 glass-effect animate-pulse">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-12 text-center glass-effect">
              <div className="text-muted-foreground space-y-2">
                <p>{searchTerm ? 'Aucun blog trouvé' : 'Aucun blog créé'}</p>
                {searchTerm ? (
                  <p className="text-sm">Essayez de modifier votre recherche</p>
                ) : (
                  <Button onClick={onCreateNew} className="mt-4 neon-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer votre premier blog
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="relative">
                  <BlogCard
                    post={{
                      id: post.id,
                      title: post.title,
                      excerpt: post.content.substring(0, 150) + '...',
                      createdAt: post.createdAt || '',
                      updatedAt: post.updatedAt || '',
                      isPublic: false,
                      tags: post.tags
                    }}
                    onView={onViewPost}
                    onEdit={onEditPost}
                    onDelete={handleDeletePost}
                    
                    shareComponent={
                      <ShareLinkDialog 
                        blogId={post.id} 
                        githubService={githubService}
                      />
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};