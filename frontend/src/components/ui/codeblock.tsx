import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  description?: string;
}

export function CodeBlock({ code, language, title = "Code Preview", description }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Map common language names to syntax highlighter supported names
  const getSyntaxLanguage = (lang: string) => {
    const languageMap: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      java: 'java',
      csharp: 'csharp',
      cpp: 'cpp',
      php: 'php',
      ruby: 'ruby',
      go: 'go',
      rust: 'rust',
      swift: 'swift',
      kotlin: 'kotlin',
      html: 'html',
      css: 'css',
      sql: 'sql',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      markdown: 'markdown',
      bash: 'bash',
    };
    
    return languageMap[lang.toLowerCase()] || 'plaintext';
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 gap-1"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <SyntaxHighlighter
            language={getSyntaxLanguage(language)}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0 0 0.5rem 0.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
            }}
            wrapLongLines={true}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 py-2">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize">{language}</span>
          <span>Code Review</span>
        </div>
      </CardFooter>
    </Card>
  );
}