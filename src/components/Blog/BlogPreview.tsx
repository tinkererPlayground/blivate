import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

interface BlogPreviewProps {
  content: string;
}

export const BlogPreview = ({ content }: BlogPreviewProps) => {
  return (
    <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom components for better styling
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4 leading-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-primary mb-3 leading-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary mb-2 leading-tight">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-foreground mb-4 leading-relaxed">{children}</p>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-secondary hover:text-secondary-glow underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4 bg-muted/30 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-4 text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-4 text-foreground">
              {children}
            </ol>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <code className={`${className} block p-4 rounded-lg bg-muted/50 border text-sm`}>
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-muted/30 px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto mb-4 backdrop-blur-sm">
              {children}
            </pre>
          ),
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto rounded-lg shadow-lg my-4 border"
            />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted/50 px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">
              {children}
            </td>
          ),
        }}
      >
        {content || '*Aucun contenu à afficher*'}
      </ReactMarkdown>
    </div>
  );
};