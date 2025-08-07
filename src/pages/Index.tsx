import { useState, useEffect } from 'react';
import { GitHubAuth } from '@/components/Auth/GitHubAuth';
import { BlogDashboard } from '@/components/Blog/BlogDashboard';
import { BlogEditor } from '@/components/Blog/BlogEditor';
import { BlogViewer } from '@/components/Blog/BlogViewer';
import { GitHubService } from '@/services/githubService';

type AppState = 'login' | 'dashboard' | 'editor' | 'viewer';

interface BlogPost {
  title: string;
  content: string;
  tags: string[];
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [githubToken, setGithubToken] = useState<string>('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [githubService, setGithubService] = useState<GitHubService | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('github_token');
    if (token) {
      setGithubToken(token);
      setGithubService(new GitHubService(token));
      setAppState('dashboard');
    }
  }, []);

  const handleAuthenticated = (token: string) => {
    setGithubToken(token);
    setGithubService(new GitHubService(token));
    setAppState('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    setGithubToken('');
    setAppState('login');
  };

  const handleCreateNew = () => {
    setEditingPostId(null);
    setAppState('editor');
  };

  const handleEditPost = async (id: string) => {
    if (githubService) {
      const post = await githubService.getBlogPost(id);
      setEditingPost(post);
      setEditingPostId(id);
      setAppState('editor');
    }
  };

  const handleViewPost = (id: string) => {
    setViewingPostId(id);
    setAppState('viewer');
  };

  const handleSavePost = async (post: BlogPost) => {
    if (githubService) {
      await githubService.saveBlogPost(post, editingPostId || undefined);
      setEditingPost(null);
      setEditingPostId(null);
      setAppState('dashboard');
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditingPostId(null);
    setAppState('dashboard');
  };

  const handleBackToDashboard = () => {
    setViewingPostId(null);
    setAppState('dashboard');
  };

  // Render based on current state
  switch (appState) {
    case 'login':
      return <GitHubAuth onAuthenticated={handleAuthenticated} />;
      
    case 'dashboard':
      return (
        <BlogDashboard
          onCreateNew={handleCreateNew}
          onEditPost={handleEditPost}
          onViewPost={handleViewPost}
          onLogout={handleLogout}
          githubService={githubService}
        />
      );
      
    case 'editor':
      return (
        <BlogEditor
          initialPost={editingPost || undefined}
          onSave={handleSavePost}
          onCancel={handleCancelEdit}
        />
      );
      
    case 'viewer':
      return viewingPostId ? (
        <BlogViewer
          blogId={viewingPostId}
          githubService={githubService}
          onBack={handleBackToDashboard}
        />
      ) : (
        <BlogDashboard
          onCreateNew={handleCreateNew}
          onEditPost={handleEditPost}
          onViewPost={handleViewPost}
          onLogout={handleLogout}
          githubService={githubService}
        />
      );
      
    default:
      return (
        <BlogDashboard
          onCreateNew={handleCreateNew}
          onEditPost={handleEditPost}
          onViewPost={handleViewPost}
          onLogout={handleLogout}
          githubService={githubService}
        />
      );
  }
};

export default Index;
