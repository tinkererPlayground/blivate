import { useState, useEffect } from 'react';
import { ArrowLeft, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlogPreview } from './BlogPreview';
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

interface BlogViewerProps {
  blogId: string;
  githubService: GitHubService | null;
  onBack: () => void;
}

export const BlogViewer = ({ blogId, githubService, onBack }: BlogViewerProps) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBlogPost();
  }, [blogId, githubService]);

  const loadBlogPost = async () => {
    if (!githubService) return;
    
    setIsLoading(true);
    try {
      const blogPost = await githubService.getBlogPost(blogId);
      if (blogPost) {
        setPost({ ...blogPost, id: blogId });
      }
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger le blog",
        variant: "destructive",
      });
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

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 glass-effect animate-pulse">
          <div className="space-y-4 max-w-md">
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center glass-effect">
          <p className="text-muted-foreground mb-4">Blog non trouvé</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isMaximized 
        ? 'fixed inset-0 z-50 bg-background' 
        : 'container mx-auto px-4 sm:px-6 py-4 sm:py-8'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b mb-6 ${
        isMaximized ? 'px-6 py-4' : 'pb-4'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMaximize}
              className="shrink-0"
            >
              {isMaximized ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ml-2">
                {isMaximized ? 'Réduire' : 'Plein écran'}
              </span>
            </Button>
          </div>

          <ShareLinkDialog 
            blogId={blogId} 
            githubService={githubService}
          />
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-none ${
        isMaximized 
          ? 'px-6 pb-6 max-w-4xl mx-auto' 
          : 'max-w-4xl mx-auto'
      }`}>
        {/* Blog Header */}
        <div className="mb-8">
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

        {/* Blog Content */}
        <Card className={`glass-effect ${
          isMaximized ? 'border-0 shadow-none bg-transparent' : ''
        }`}>
          <div className={isMaximized ? 'p-0' : 'p-6 sm:p-8'}>
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
              <BlogPreview content={post.content} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};