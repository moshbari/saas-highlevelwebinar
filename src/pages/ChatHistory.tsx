import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Search, Eye, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ROUTES } from '@/lib/routes';

interface ChatSession {
  lead_id: string | null;
  user_name: string;
  user_email: string;
  webinar_id: string;
  webinar_name: string;
  session_date: string;
  message_count: number;
  first_message_at: string;
}

export default function ChatHistory() {
  const navigate = useNavigate();
  const [webinarFilter, setWebinarFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [deleteId, setDeleteId] = useState<{ email: string; webinar_id: string; session_date: string } | null>(null);

  // Fetch webinars for filter
  const { data: webinars = [] } = useQuery({
    queryKey: ['webinars'],
    queryFn: async () => {
      const { data } = await supabase.from('webinars').select('id, webinar_name').order('webinar_name');
      return data || [];
    },
  });

  // Fetch chat sessions grouped by user/webinar/date
  const { data: chatSessions = [], isLoading, refetch } = useQuery({
    queryKey: ['chat-sessions', webinarFilter, searchQuery, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from('chat_messages')
        .select('lead_id, user_name, user_email, webinar_id, session_date, sent_at, webinars(webinar_name)')
        .order('sent_at', { ascending: false });

      if (webinarFilter && webinarFilter !== 'all') {
        query = query.eq('webinar_id', webinarFilter);
      }
      if (dateFilter) {
        query = query.eq('session_date', dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by user_email + webinar_id + session_date
      const grouped = new Map<string, ChatSession>();
      (data || []).forEach((msg: any) => {
        const key = `${msg.user_email}-${msg.webinar_id}-${msg.session_date}`;
        if (!grouped.has(key)) {
          grouped.set(key, {
            lead_id: msg.lead_id,
            user_name: msg.user_name,
            user_email: msg.user_email,
            webinar_id: msg.webinar_id,
            webinar_name: msg.webinars?.webinar_name || 'Unknown',
            session_date: msg.session_date,
            message_count: 1,
            first_message_at: msg.sent_at,
          });
        } else {
          const existing = grouped.get(key)!;
          existing.message_count++;
          if (new Date(msg.sent_at) < new Date(existing.first_message_at)) {
            existing.first_message_at = msg.sent_at;
          }
        }
      });

      let sessions = Array.from(grouped.values());

      // Apply search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        sessions = sessions.filter(
          (s) => s.user_name.toLowerCase().includes(q) || s.user_email.toLowerCase().includes(q)
        );
      }

      return sessions;
    },
  });

  const handleExportCSV = async () => {
    let query = supabase
      .from('chat_messages')
      .select('*, webinars(webinar_name)')
      .order('sent_at', { ascending: true });

    if (webinarFilter && webinarFilter !== 'all') {
      query = query.eq('webinar_id', webinarFilter);
    }
    if (dateFilter) {
      query = query.eq('session_date', dateFilter);
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: 'Export failed', variant: 'destructive' });
      return;
    }

    const csvContent = [
      ['Webinar Name', 'Session Date', 'User Name', 'User Email', 'Timestamp', 'User Message', 'AI Response'].join(','),
      ...(data || []).map((row: any) =>
        [
          `"${row.webinars?.webinar_name || ''}"`,
          row.session_date,
          `"${row.user_name}"`,
          `"${row.user_email}"`,
          row.sent_at,
          `"${row.user_message.replace(/"/g, '""')}"`,
          `"${row.ai_response.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Export complete', description: 'CSV file downloaded' });
  };

  const handleDeleteSession = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_email', deleteId.email)
      .eq('webinar_id', deleteId.webinar_id)
      .eq('session_date', deleteId.session_date);

    if (error) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } else {
      toast({ title: 'Conversation deleted' });
      refetch();
    }
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.HOME)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-xl">Chat History</h1>
              <p className="text-xs text-muted-foreground">View and export chat conversations</p>
            </div>
          </div>
          <Button onClick={handleExportCSV} variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="glass-card mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Webinar</label>
                <Select value={webinarFilter} onValueChange={setWebinarFilter}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="All webinars" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All webinars</SelectItem>
                    {webinars.map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>{w.webinar_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Search</label>
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Conversations ({chatSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : chatSessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No chat conversations found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Webinar</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chatSessions.map((session) => (
                      <TableRow key={`${session.user_email}-${session.webinar_id}-${session.session_date}`}>
                        <TableCell className="font-medium">{session.webinar_name}</TableCell>
                        <TableCell>{format(new Date(session.session_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{session.user_name}</TableCell>
                        <TableCell className="text-muted-foreground">{session.user_email}</TableCell>
                        <TableCell>{session.message_count}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/chat-history/${session.webinar_id}/${session.session_date}/${encodeURIComponent(session.user_email)}`
                                )
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setDeleteId({
                                  email: session.user_email,
                                  webinar_id: session.webinar_id,
                                  session_date: session.session_date,
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
