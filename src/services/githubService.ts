interface GitHubFile {
  name: string;
  path: string;
  sha?: string;
  content: string;
}

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

interface ClickAnalytics {
  linkId: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  location?: string;
}

interface GitHubRepository {
  name: string;
  full_name: string;
  private: boolean;
}

export class GitHubService {
  private token: string;
  private owner: string;
  private repo: string = 'blivate-blog-posts';

  constructor(token: string) {
    this.token = token;
    this.owner = this.getUserFromToken();
  }

  private getUserFromToken(): string {
    const userData = localStorage.getItem('github_user');
    if (userData) {
      return JSON.parse(userData).login;
    }
    throw new Error('Utilisateur GitHub non trouvé');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`GitHub API Error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  async ensureRepository(): Promise<void> {
    try {
      // Vérifier si le repo existe
      await this.makeRequest(`/repos/${this.owner}/${this.repo}`);
    } catch (error) {
      // Créer le repo s'il n'existe pas
      await this.makeRequest('/user/repos', {
        method: 'POST',
        body: JSON.stringify({
          name: this.repo,
          description: 'Blog posts créés avec Blivate Blog Platform',
          private: false,
          auto_init: true,
        }),
      });
    }
  }

  private generateBlogId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + '-' + Date.now();
  }

  private createMarkdownContent(post: BlogPost): string {
    const frontMatter = `---
title: "${post.title}"
tags: [${post.tags.map(tag => `"${tag}"`).join(', ')}]
createdAt: "${post.createdAt || new Date().toISOString()}"
updatedAt: "${new Date().toISOString()}"
---

`;
    return frontMatter + post.content;
  }

  async saveBlogPost(post: BlogPost, blogId?: string): Promise<string> {
    await this.ensureRepository();
    
    const id = blogId || this.generateBlogId(post.title);
    const fileName = `${id}.md`;
    const filePath = `blogs/${fileName}`;
    
    const markdownContent = this.createMarkdownContent(post);
    const encodedContent = btoa(unescape(encodeURIComponent(markdownContent)));

    let sha: string | undefined;
    
    try {
      // Vérifier si le fichier existe déjà
      const existingFile = await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/${filePath}`);
      sha = existingFile.sha;
    } catch (error) {
      // Le fichier n'existe pas, c'est normal pour un nouveau post
    }

    const requestBody: any = {
      message: sha ? `Mise à jour: ${post.title}` : `Nouveau blog: ${post.title}`,
      content: encodedContent,
    };

    if (sha) {
      requestBody.sha = sha;
    }

    await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify(requestBody),
    });

    return id;
  }

  async getBlogPost(blogId: string): Promise<BlogPost | null> {
    try {
      const filePath = `blogs/${blogId}.md`;
      const file = await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/${filePath}`);
      
      const content = atob(file.content);
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      
      if (!frontMatterMatch) {
        throw new Error('Format de fichier invalide');
      }

      const frontMatter = frontMatterMatch[1];
      const blogContent = frontMatterMatch[2];
      
      const titleMatch = frontMatter.match(/title:\s*"(.+)"/);
      const tagsMatch = frontMatter.match(/tags:\s*\[(.*?)\]/);
      const createdAtMatch = frontMatter.match(/createdAt:\s*"(.+)"/);
      const updatedAtMatch = frontMatter.match(/updatedAt:\s*"(.+)"/);
      
      return {
        title: titleMatch ? titleMatch[1] : 'Sans titre',
        content: blogContent.trim(),
        tags: tagsMatch ? 
          tagsMatch[1].split(',').map(tag => tag.trim().replace(/"/g, '')) :
          [],
        createdAt: createdAtMatch ? createdAtMatch[1] : undefined,
        updatedAt: updatedAtMatch ? updatedAtMatch[1] : undefined,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du blog:', error);
      return null;
    }
  }

  async getAllBlogPosts(): Promise<Array<BlogPost & { id: string }>> {
    try {
      await this.ensureRepository();
      
      const contents = await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/blogs`);
      
      if (!Array.isArray(contents)) {
        return [];
      }

      const blogPosts = await Promise.all(
        contents
          .filter((file: any) => file.name.endsWith('.md'))
          .map(async (file: any) => {
            const blogId = file.name.replace('.md', '');
            const post = await this.getBlogPost(blogId);
            return post ? { ...post, id: blogId } : null;
          })
      );

      return blogPosts.filter(Boolean) as Array<BlogPost & { id: string }>;
    } catch (error) {
      console.error('Erreur lors de la récupération des blogs:', error);
      return [];
    }
  }

  async deleteBlogPost(blogId: string): Promise<void> {
    const filePath = `blogs/${blogId}.md`;
    
    try {
      const file = await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/${filePath}`);
      
      await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/${filePath}`, {
        method: 'DELETE',
        body: JSON.stringify({
          message: `Suppression du blog: ${blogId}`,
          sha: file.sha,
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  private generateLinkId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async createSharedLink(blogId: string, expiresAt?: string): Promise<string> {
    await this.ensureRepository();
    
    const linkId = this.generateLinkId();
    // Create the raw GitHub URL for the blog file
    const rawUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/blogs/${blogId}.md`;
    
    const sharedLink: SharedLink = {
      id: linkId,
      blogId,
      rawUrl,
      expiresAt,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const fileName = `${linkId}.json`;
    const filePath = `analytics/links/${fileName}`;
    const content = JSON.stringify(sharedLink, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Nouveau lien partagé: ${linkId}`,
        content: encodedContent,
      }),
    });

    // Return the share URL with the filename as parameter
    const currentDomain = window.location.origin;
    return `${currentDomain}/share?name=${blogId}.md`;
  }

  async getSharedLink(linkId: string): Promise<SharedLink | null> {
    try {
      const filePath = `analytics/links/${linkId}.json`;
      const file = await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/${filePath}`);
      const content = atob(file.content);
      return JSON.parse(content);
    } catch (error) {
      console.error('Erreur lors de la récupération du lien:', error);
      return null;
    }
  }

  async trackClick(linkId: string, ip: string, userAgent: string): Promise<void> {
    try {
      const analytics: ClickAnalytics = {
        linkId,
        timestamp: new Date().toISOString(),
        ip,
        userAgent,
      };

      const fileName = `${linkId}-${Date.now()}.json`;
      const filePath = `analytics/clicks/${fileName}`;
      const content = JSON.stringify(analytics, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(content)));

      await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/${filePath}`, {
        method: 'PUT',
        body: JSON.stringify({
          message: `Click tracking: ${linkId}`,
          content: encodedContent,
        }),
      });
    } catch (error) {
      console.error('Erreur lors du tracking:', error);
    }
  }

  async getLinkAnalytics(linkId: string): Promise<ClickAnalytics[]> {
    try {
      const contents = await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/analytics/clicks`);
      
      if (!Array.isArray(contents)) {
        return [];
      }

      const clickFiles = contents.filter((file: any) => file.name.startsWith(linkId));
      const analytics = await Promise.all(
        clickFiles.map(async (file: any) => {
          try {
            const fileContent = await this.makeRequest(`/repos/${this.owner}/${this.repo}/contents/${file.path}`);
            const content = atob(fileContent.content);
            return JSON.parse(content);
          } catch (error) {
            return null;
          }
        })
      );

      return analytics.filter(Boolean);
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      return [];
    }
  }


  async createShareLink(blogId: string): Promise<string> {
    // Return the shareable URL with filename format
    const shareUrl = `${window.location.origin}?share=${blogId}.md`;
    console.log('createShareLink called with blogId:', blogId, 'returning:', shareUrl);
    return shareUrl;
  }

  generatePublicLink(linkId: string): string {
    return `${window.location.origin}/shared/${linkId}`;
  }

  // New method to get raw content directly from GitHub without authentication
  async getRawContent(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch raw content: ${response.statusText}`);
    }
    return response.text();
  }

  parseBlogFromRaw(rawContent: string): BlogPost {
    const frontMatterMatch = rawContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontMatterMatch) {
      throw new Error('Format de fichier invalide');
    }

    const frontMatter = frontMatterMatch[1];
    const blogContent = frontMatterMatch[2];
    
    const titleMatch = frontMatter.match(/title:\s*"(.+)"/);
    const tagsMatch = frontMatter.match(/tags:\s*\[(.*?)\]/);
    const createdAtMatch = frontMatter.match(/createdAt:\s*"(.+)"/);
    const updatedAtMatch = frontMatter.match(/updatedAt:\s*"(.+)"/);
    
    return {
      title: titleMatch ? titleMatch[1] : 'Sans titre',
      content: blogContent.trim(),
      tags: tagsMatch ? 
        tagsMatch[1].split(',').map(tag => tag.trim().replace(/"/g, '')) :
        [],
      createdAt: createdAtMatch ? createdAtMatch[1] : undefined,
      updatedAt: updatedAtMatch ? updatedAtMatch[1] : undefined,
    };
  }
}