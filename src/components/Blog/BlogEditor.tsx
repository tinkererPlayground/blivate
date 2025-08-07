import { useState } from 'react';
import { Save, Eye, Image, Code, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogPreview } from './BlogPreview';
import { useToast } from '@/components/ui/use-toast';

interface BlogPost {
  title: string;
  content: string;
  tags: string[];
}

interface BlogEditorProps {
  initialPost?: Partial<BlogPost>;
  onSave: (post: BlogPost) => Promise<void>;
  onCancel: () => void;
}

export const BlogEditor = ({ initialPost, onSave, onCancel }: BlogEditorProps) => {
  const [post, setPost] = useState<BlogPost>({
    title: initialPost?.title || '',
    content: initialPost?.content || '',
    tags: initialPost?.tags || [],
  });
  
  const [activeTab, setActiveTab] = useState('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const { toast } = useToast();

  const handleSave = async () => {
    if (!post.title.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez entrer un titre pour votre blog",
        variant: "destructive",
      });
      return;
    }

    if (!post.content.trim()) {
      toast({
        title: "Contenu requis", 
        description: "Veuillez entrer du contenu pour votre blog",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(post);
      toast({
        title: "Blog sauvegardé",
        description: "Votre blog a été sauvegardé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder le blog",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const insertImage = () => {
    if (imageUrl.trim()) {
      const imageMarkdown = `![Image](${imageUrl})`;
      setPost(prev => ({
        ...prev,
        content: prev.content + '\n\n' + imageMarkdown
      }));
      setImageUrl('');
    }
  };

  const insertCodeBlock = () => {
    const codeMarkdown = '\n```javascript\n// Votre code ici\n```\n';
    setPost(prev => ({
      ...prev,
      content: prev.content + codeMarkdown
    }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setPost(prev => ({ ...prev, tags }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {initialPost ? 'Modifier le blog' : 'Nouveau blog'}
        </h2>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-secondary neon-glow"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Title & Tags */}
        <Card className="p-4 glass-effect">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Titre</label>
              <Input
                value={post.title}
                onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de votre blog..."
                className="text-lg font-semibold"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tags (séparés par des virgules)</label>
              <Input
                value={post.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="react, javascript, tutorial..."
              />
            </div>
          </div>
        </Card>

        {/* Editor */}
        <Card className="flex-1 glass-effect">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <TabsList>
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Éditer
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Aperçu
                </TabsTrigger>
              </TabsList>

              {/* Toolbar */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL de l'image..."
                    className="w-48"
                  />
                  <Button variant="outline" size="sm" onClick={insertImage}>
                    <Image className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button variant="outline" size="sm" onClick={insertCodeBlock}>
                  <Code className="w-4 h-4" />
                  Code
                </Button>
              </div>
            </div>

            <TabsContent value="edit" className="m-0 h-full">
              <Textarea
                value={post.content}
                onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Écrivez votre contenu en Markdown..."
                className="h-full min-h-[500px] resize-none border-0 focus-visible:ring-0"
              />
            </TabsContent>

            <TabsContent value="preview" className="m-0 h-full">
              <div className="h-full overflow-auto p-4">
                <BlogPreview content={post.content} />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};