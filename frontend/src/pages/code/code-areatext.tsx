import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';

export function CodeTextarea() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleSend = () => {
    console.log('Sending code:', code, 'Language:', language);
    setCode('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const programmingLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
  ];

  return (
    <div className="grid place-items-center min-h-screen bg-primary-foreground">
      <div className="w-full max-w-md gap-4 p-4">
        <div className="relative">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your code code here..."
            className="min-h-[120px] pr-28 resize-none"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <Combobox 
              items={programmingLanguages}
              onChange={(value) => {setLanguage(value)}}
              value={language}
            />
            <Button
              onClick={handleSend}
              disabled={!code.trim()}
              size="icon"
              className="h-8 w-8"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}