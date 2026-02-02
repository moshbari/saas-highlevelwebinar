import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Loader2, Bot, User, RotateCcw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
}

interface TestChatPanelProps {
  webinarId: string | undefined;
  botName?: string;
  botAvatar?: string;
}

export function TestChatPanel({ webinarId, botName = 'AI Assistant', botAvatar = 'AI' }: TestChatPanelProps) {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !webinarId || isLoading) return;

    const userMessage: TestMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        is_user: m.role === 'user',
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          webinar_id: webinarId,
          user_email: 'test@preview.local',
          user_name: 'Test User',
          user_message: userMessage.content,
          conversation_history: conversationHistory,
        },
      });

      if (error) throw error;

      const assistantMessage: TestMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || 'No response received',
        provider: data.provider,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Test chat error:', err);
      toast.error('Failed to get AI response');
      
      const errorMessage: TestMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Error: Failed to get response. Make sure your chatbot is configured.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput('');
  };

  if (!webinarId) {
    return (
      <Card className="glass-card h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Save the webinar first to test the chatbot</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-[400px] flex flex-col">
      <CardHeader className="py-3 px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-primary" />
            Test Chat Preview
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Send a test message to see how the AI responds</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  {botAvatar.slice(0, 2)}
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 border border-border'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="text-xs text-muted-foreground mb-1 font-medium">{botName}</div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.provider && message.role === 'assistant' && (
                  <div className="text-xs text-muted-foreground mt-1 opacity-70">
                    via {message.provider}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                {botAvatar.slice(0, 2)}
              </div>
              <div className="bg-secondary/50 border border-border rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <CardContent className="py-3 px-4 border-t border-border flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a test message..."
            className="flex-1 input-field h-9"
            disabled={isLoading}
          />
          <Button type="submit" size="sm" disabled={!input.trim() || isLoading} className="h-9 px-3">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
