import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Bell, 
  BellOff, 
  Send, 
  Mic, 
  Bot, 
  User, 
  MessageSquare,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  useChatSessions, 
  useSessionMessages, 
  useTakeOverSession, 
  useReturnToAI, 
  useSendHumanReply,
  useQuickReplies,
  usePendingCount
} from '@/hooks/useLiveChat';
import { useWebinars } from '@/hooks/useWebinars';
import { ChatSession, getSessionStatus, getStatusEmoji } from '@/types/liveChat';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

export default function LiveChat() {
  const navigate = useNavigate();
  const [selectedWebinarId, setSelectedWebinarId] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { data: webinars } = useWebinars();
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = useChatSessions(
    selectedWebinarId === 'all' ? undefined : selectedWebinarId
  );
  const { data: messages, isLoading: messagesLoading } = useSessionMessages(selectedSession?.id || null);
  const { data: quickReplies } = useQuickReplies();
  const { data: pendingCount } = usePendingCount();
  
  const takeOverMutation = useTakeOverSession();
  const returnToAIMutation = useReturnToAI();
  const sendReplyMutation = useSendHumanReply();

  // Sort sessions: pending first, then by last_message_at
  const sortedSessions = [...(sessions || [])].sort((a, b) => {
    const statusA = getSessionStatus(a);
    const statusB = getSessionStatus(b);
    
    // Pending always first
    if (statusA === 'pending' && statusB !== 'pending') return -1;
    if (statusB === 'pending' && statusA !== 'pending') return 1;
    
    // Then by last message time
    const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return timeB - timeA;
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Play sound for new pending messages
  useEffect(() => {
    if (soundEnabled && pendingCount && pendingCount > 0) {
      // Play notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
      audio.play().catch(() => {});
    }
  }, [pendingCount, soundEnabled]);

  const handleTakeOver = async (session: ChatSession) => {
    try {
      await takeOverMutation.mutateAsync(session.id);
      setSelectedSession({ ...session, mode: 'human' });
      toast.success(`Took over chat with ${session.user_name || session.user_email}`);
    } catch (error) {
      toast.error('Failed to take over chat');
    }
  };

  const handleReturnToAI = async () => {
    if (!selectedSession) return;
    try {
      await returnToAIMutation.mutateAsync(selectedSession.id);
      setSelectedSession({ ...selectedSession, mode: 'ai' });
      toast.success('Returned chat to AI mode');
    } catch (error) {
      toast.error('Failed to return to AI mode');
    }
  };

  const handleSendReply = async () => {
    if (!selectedSession || !replyMessage.trim()) return;

    // Find the pending message to reply to
    const pendingMessage = messages?.find(m => m.is_pending);

    try {
      await sendReplyMutation.mutateAsync({
        sessionId: selectedSession.id,
        message: replyMessage.trim(),
        pendingMessageId: pendingMessage?.id,
      });
      setReplyMessage('');
      toast.success('Reply sent!');
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleQuickReply = (message: string) => {
    setReplyMessage(prev => prev ? `${prev} ${message}` : message);
    setShowQuickReplies(false);
  };

  // Voice Recording - Toggle mode (click to start, click to stop)
  const recordingStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setIsTranscribing(true);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        recordingStartTimeRef.current = Date.now();

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          streamRef.current?.getTracks().forEach(track => track.stop());
          streamRef.current = null;
          
          // Check if recording was long enough (at least 500ms)
          const duration = Date.now() - recordingStartTimeRef.current;
          if (duration < 500) {
            toast.error('Record for at least 0.5 seconds');
            setIsTranscribing(false);
            return;
          }
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size < 1000) {
            toast.error('Recording too short, try again');
            setIsTranscribing(false);
            return;
          }
          
          await transcribeAudio(audioBlob);
        };

        mediaRecorder.start(100); // Collect data every 100ms
        setIsRecording(true);
        toast.info('Recording... Tap again to stop');
      } catch (error) {
        toast.error('Microphone access denied');
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio },
        });

        if (error) throw error;

        if (data?.text) {
          setReplyMessage(prev => prev ? `${prev} ${data.text}` : data.text);
          toast.success('Voice transcribed!');
        }
        setIsTranscribing(false);
      };
    } catch (error) {
      toast.error('Transcription failed');
      setIsTranscribing(false);
    }
  };

  const pendingSessionCount = sortedSessions.filter(s => getSessionStatus(s) === 'pending').length;
  const activeSessionCount = sortedSessions.filter(s => getSessionStatus(s) === 'active').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile: Show either list or conversation */}
      <div className="lg:hidden">
        {selectedSession ? (
          <MobileConversation
            session={selectedSession}
            messages={messages || []}
            messagesLoading={messagesLoading}
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
            onBack={() => setSelectedSession(null)}
            onSendReply={handleSendReply}
            onReturnToAI={handleReturnToAI}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            onToggleRecording={toggleRecording}
            quickReplies={quickReplies || []}
            showQuickReplies={showQuickReplies}
            setShowQuickReplies={setShowQuickReplies}
            onQuickReply={handleQuickReply}
            sendingReply={sendReplyMutation.isPending}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          <MobileChatList
            sessions={sortedSessions}
            sessionsLoading={sessionsLoading}
            webinars={webinars || []}
            selectedWebinarId={selectedWebinarId}
            setSelectedWebinarId={setSelectedWebinarId}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            pendingCount={pendingSessionCount}
            activeCount={activeSessionCount}
            onSelectSession={setSelectedSession}
            onTakeOver={handleTakeOver}
            onRefresh={refetchSessions}
            onBack={() => navigate(ROUTES.HOME)}
          />
        )}
      </div>

      {/* Desktop: Two panel layout */}
      <div className="hidden lg:flex h-screen">
        {/* Left Panel - Chat List */}
        <div className="w-96 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.HOME)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Live Chat
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              </Button>
            </div>

            <Select value={selectedWebinarId} onValueChange={setSelectedWebinarId}>
              <SelectTrigger>
                <SelectValue placeholder="All Webinars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Webinars</SelectItem>
                {webinars?.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.webinarName}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-4 mt-4 text-sm">
              <span className="text-yellow-500">🟡 {pendingSessionCount} Pending</span>
              <span className="text-green-500">🟢 {activeSessionCount} Active</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sessionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : sortedSessions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No active chats
              </div>
            ) : (
              sortedSessions.map(session => (
                <ChatSessionCard
                  key={session.id}
                  session={session}
                  isSelected={selectedSession?.id === session.id}
                  onClick={() => setSelectedSession(session)}
                  onTakeOver={() => handleTakeOver(session)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Conversation */}
        <div className="flex-1 flex flex-col">
          {selectedSession ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold flex items-center gap-2">
                      {selectedSession.user_name || 'Anonymous'}
                      {selectedSession.mode === 'human' ? (
                        <Badge variant="default" className="bg-blue-500">🧑 HUMAN</Badge>
                      ) : (
                        <Badge variant="secondary">🤖 AI</Badge>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground">{selectedSession.user_email}</p>
                    {selectedSession.webinar_name && (
                      <p className="text-sm text-primary font-medium">{selectedSession.webinar_name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  messages?.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t space-y-3">
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="min-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "flex-shrink-0",
                      isRecording && "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                    )}
                    onClick={toggleRecording}
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>

                  <Sheet open={showQuickReplies} onOpenChange={setShowQuickReplies}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        📎 Quick Replies
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom">
                      <SheetHeader>
                        <SheetTitle>Quick Replies</SheetTitle>
                      </SheetHeader>
                      <div className="grid gap-2 py-4">
                        {quickReplies?.map(qr => (
                          <Button
                            key={qr.id}
                            variant="outline"
                            className="justify-start text-left h-auto py-3"
                            onClick={() => handleQuickReply(qr.message)}
                          >
                            <div>
                              <div className="font-medium">{qr.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-2">{qr.message}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || sendReplyMutation.isPending}
                    className="min-w-[100px]"
                  >
                    {sendReplyMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>

                {selectedSession.mode === 'human' && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleReturnToAI}
                    disabled={returnToAIMutation.isPending}
                  >
                    <Bot className="h-5 w-5 mr-2" />
                    Return to AI Mode
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Chat Session Card Component
function ChatSessionCard({ 
  session, 
  isSelected, 
  onClick, 
  onTakeOver 
}: { 
  session: ChatSession; 
  isSelected: boolean;
  onClick: () => void;
  onTakeOver: () => void;
}) {
  const status = getSessionStatus(session);
  const statusEmoji = getStatusEmoji(status);
  const timeAgo = session.last_message_at 
    ? formatDistanceToNow(new Date(session.last_message_at), { addSuffix: true })
    : 'No messages';

  return (
    <Card
      className={cn(
        "p-4 mb-2 cursor-pointer transition-colors",
        isSelected && "ring-2 ring-primary",
        status === 'pending' && "border-yellow-500 bg-yellow-500/5"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{statusEmoji}</span>
            <span className="font-medium truncate">
              {session.user_name || session.user_email}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate mt-1">
            "{session.last_message || 'No messages yet'}"
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {status === 'pending' ? (
              <span className="text-yellow-500 font-medium">⏳ PENDING</span>
            ) : session.mode === 'human' ? (
              <span className="text-blue-500">🧑 HUMAN</span>
            ) : (
              <span>🤖 AI</span>
            )}
            <span>· {timeAgo}</span>
          </div>
        </div>
        <Button
          size="sm"
          variant={session.mode === 'human' ? 'secondary' : 'default'}
          onClick={(e) => {
            e.stopPropagation();
            if (session.mode === 'ai') onTakeOver();
            else onClick();
          }}
        >
          {session.mode === 'human' ? 'View' : 'Take Over'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: any }) {
  const isUser = true; // user_message is always from user
  const time = new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-2">
      {/* User Message */}
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
            {message.user_message}
          </div>
          <div className="text-xs text-muted-foreground text-right mt-1">{time}</div>
        </div>
      </div>

      {/* AI/Human Response */}
      {message.ai_response ? (
        <div className="flex justify-start">
          <div className="max-w-[80%]">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                {message.response_type === 'human' ? (
                  <><User className="h-3 w-3" /> You</>
                ) : (
                  <><Bot className="h-3 w-3" /> AI</>
                )}
              </div>
              {message.ai_response}
            </div>
          </div>
        </div>
      ) : message.is_pending ? (
        <div className="flex justify-start">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
            <span className="text-yellow-500">⏳ Waiting for your reply...</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Mobile Chat List Component
function MobileChatList({
  sessions,
  sessionsLoading,
  webinars,
  selectedWebinarId,
  setSelectedWebinarId,
  soundEnabled,
  setSoundEnabled,
  pendingCount,
  activeCount,
  onSelectSession,
  onTakeOver,
  onRefresh,
  onBack,
}: any) {
  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b safe-area-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Live Chat
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <Select value={selectedWebinarId} onValueChange={setSelectedWebinarId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Webinars" />
          </SelectTrigger>
          <SelectContent className="z-[9999] bg-background border shadow-lg max-h-[300px]">
            <SelectItem value="all">All Webinars</SelectItem>
            {webinars?.map((w: any) => (
              <SelectItem key={w.id} value={w.id}>
                {w.webinarName ?? w.webinar_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-4 mt-4 text-sm">
          <span className="text-yellow-500 font-medium">🟡 {pendingCount} Pending</span>
          <span className="text-green-500">🟢 {activeCount} Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {sessionsLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No active chats
          </div>
        ) : (
          sessions.map((session: ChatSession) => (
            <ChatSessionCard
              key={session.id}
              session={session}
              isSelected={false}
              onClick={() => onSelectSession(session)}
              onTakeOver={() => onTakeOver(session)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Mobile Conversation Component
function MobileConversation({
  session,
  messages,
  messagesLoading,
  replyMessage,
  setReplyMessage,
  onBack,
  onSendReply,
  onReturnToAI,
  isRecording,
  isTranscribing,
  onToggleRecording,
  quickReplies,
  showQuickReplies,
  setShowQuickReplies,
  onQuickReply,
  sendingReply,
  messagesEndRef,
}: any) {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b safe-area-top">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">
                {session.user_name || 'Anonymous'}
              </span>
              {session.mode === 'human' ? (
                <Badge variant="default" className="bg-blue-500 text-xs">🧑</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">🤖</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{session.user_email}</p>
            {session.webinar_name && (
              <p className="text-xs text-primary font-medium truncate">{session.webinar_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          messages?.map((msg: any) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t space-y-3 safe-area-bottom">
        <Textarea
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Type your reply or hold 🎤 to speak..."
          className="min-h-[80px] resize-none text-base"
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 flex-shrink-0",
              isRecording && "bg-red-500 text-white hover:bg-red-600 animate-pulse"
            )}
            onClick={onToggleRecording}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>

          <Sheet open={showQuickReplies} onOpenChange={setShowQuickReplies}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 h-12">
                📎 Quick Replies
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetHeader>
                <SheetTitle>Quick Replies</SheetTitle>
              </SheetHeader>
              <div className="grid gap-2 py-4 overflow-y-auto">
                {quickReplies?.map((qr: any) => (
                  <Button
                    key={qr.id}
                    variant="outline"
                    className="justify-start text-left h-auto py-3"
                    onClick={() => onQuickReply(qr.message)}
                  >
                    <div>
                      <div className="font-medium">{qr.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{qr.message}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button
            onClick={onSendReply}
            disabled={!replyMessage.trim() || sendingReply}
            className="h-12 min-w-[100px]"
          >
            {sendingReply ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Send
                <Send className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {session.mode === 'human' && (
          <Button
            variant="secondary"
            className="w-full h-12"
            onClick={onReturnToAI}
          >
            <Bot className="h-5 w-5 mr-2" />
            Return to AI Mode
          </Button>
        )}
      </div>
    </div>
  );
}
