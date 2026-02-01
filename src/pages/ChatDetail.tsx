import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, User, Mail, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

export default function ChatDetail() {
  const navigate = useNavigate();
  const { webinarId, sessionDate, userEmail } = useParams();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-detail', webinarId, sessionDate, userEmail],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, webinars(webinar_name)')
        .eq('webinar_id', webinarId)
        .eq('session_date', sessionDate)
        .eq('user_email', decodeURIComponent(userEmail || ''))
        .order('sent_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!webinarId && !!sessionDate && !!userEmail,
  });

  const handleExportCSV = () => {
    const csvContent = [
      ['Timestamp', 'User Message', 'AI Response'].join(','),
      ...messages.map((msg: any) =>
        [
          msg.sent_at,
          `"${msg.user_message.replace(/"/g, '""')}"`,
          `"${msg.ai_response.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${sessionDate}-${userEmail}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Export complete', description: 'CSV file downloaded' });
  };

  const firstMessage = messages[0];
  const webinarName = firstMessage?.webinars?.webinar_name || 'Unknown Webinar';
  const userName = firstMessage?.user_name || 'Unknown';
  const email = decodeURIComponent(userEmail || '');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/chat-history')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-xl">Conversation Detail</h1>
              <p className="text-xs text-muted-foreground">{webinarName}</p>
            </div>
          </div>
          <Button onClick={handleExportCSV} variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* User Info Card */}
            <Card className="glass-card mb-6">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {userName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-semibold">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {userName}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {sessionDate && format(new Date(sessionDate), 'MMMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    {messages.length} messages
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display">Conversation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {messages.map((msg: any, index: number) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-3"
                  >
                    {/* User Message */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {userName[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.sent_at), 'h:mm a')}
                          </span>
                        </div>
                        <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-2">
                          {msg.user_message}
                        </div>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold flex-shrink-0 text-primary-foreground">
                        AI
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">AI Assistant</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.sent_at), 'h:mm a')}
                          </span>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-2">
                          {msg.ai_response}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
