import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlogPreview } from '@/components/Blog/BlogPreview';
import { GitHubService } from '@/services/githubService';

interface BlogPost {
  title: string;
  content: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface SharedLink {
  id: string;
  blogId: string;
  rawUrl: string;
  expiresAt?: string;
  createdAt: string;
  isActive: boolean;
}

// Create a service instance for public access (no token needed for raw content)
const createPublicService = () => {
  // We still need a token to access the link metadata, but not for the raw content
  const token = localStorage.getItem('github_token') || '';
  return new GitHubService(token);
};

export const SharedBlog = () => {
  const [searchParams] = useSearchParams();
  const filename = searchParams.get('name');
  const rawUrl = filename ? `https://raw.githubusercontent.com/fabrichgit/lovable-blog-posts/refs/heads/main/blogs/${filename}` : null;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (rawUrl) {
      loadSharedBlog();
    }
  }, [rawUrl]);

  const loadSharedBlog = async () => {
    if (!rawUrl) return;

    setIsLoading(true);
    try {
      const publicService = createPublicService();
      
      // Load the blog post directly from the raw URL (no authentication needed)
      try {
        const rawContent = await publicService.getRawContent(rawUrl);
        const blogPost = publicService.parseBlogFromRaw(rawContent);
        setPost(blogPost);
      } catch (error) {
        setError('Blog non trouvé ou inaccessible');
        return;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du blog partagé:', error);
      setError('Impossible de charger le blog. Assurez-vous que le lien est valide.');
    } finally {
      setIsLoading(false);
    }
  };


  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Card className="p-8 glass-effect animate-pulse max-w-md w-full mx-4">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Card className="p-8 text-center glass-effect max-w-md w-full mx-4">
          <div className="mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
          </div>
          
          <h1 className="text-xl font-semibold mb-2">Erreur</h1>
          
          <p className="text-muted-foreground mb-6">{error}</p>
          
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Card className="p-8 text-center glass-effect max-w-md w-full mx-4">
          <p className="text-muted-foreground mb-4">Blog non trouvé</p>
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            
            <Badge variant="secondary" className="text-xs">
              Partagé publiquement
            </Badge>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground mb-6">
            {post.createdAt && (
              <div className="flex items-center gap-2">
                <span>Créé le</span>
                <span className="font-medium">{formatDate(post.createdAt)}</span>
              </div>
            )}
            
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>Modifié le</span>
                <span className="font-medium">{formatDate(post.updatedAt)}</span>
              </div>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="glass-effect">
            <div className="p-6 sm:p-8">
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                <BlogPreview content={post.content} />
              </div>
            </div>
          </Card>
        </div>
        
        {/* Footer */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Partagé via Lovable Blog Platform
          </p>
        </div>
      </div>
    </div>
  );
};