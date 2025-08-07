import { Calendar, Eye, Share2, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  viewCount?: number;
  tags?: string[];
}

interface BlogCardProps {
  post: BlogPost;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  shareComponent?: React.ReactNode;
}

export const BlogCard = ({ post, onView, onEdit, onDelete, onShare, shareComponent }: BlogCardProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="p-4 sm:p-6 glass-effect hover:neon-glow transition-all duration-300 cursor-pointer group">
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <h3 
              className="text-lg sm:text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors break-words"
              onClick={() => onView(post.id)}
            >
              {post.title}
            </h3>
            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
              {post.excerpt}
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {post.isPublic && (
              <Badge variant="secondary" className="text-xs">
                Public
              </Badge>
            )}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="truncate">{formatDate(post.createdAt)}</span>
            </div>
            {post.viewCount && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 shrink-0" />
                <span>{post.viewCount}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(post.id);
                }}
                className="shrink-0"
              >
                <Edit className="w-4 h-4" />
                <span className="sr-only">Modifier</span>
              </Button>
            )}
            
            {shareComponent ? (
              <div onClick={(e) => e.stopPropagation()}>
                {shareComponent}
              </div>
            ) : onShare ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(post.id);
                }}
                className="shrink-0"
              >
                <Share2 className="w-4 h-4" />
                <span className="sr-only">Partager</span>
              </Button>
            ) : null}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(post.id);
                }}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Supprimer</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};