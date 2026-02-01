// Live Chat Types

export interface ChatSession {
  id: string;
  created_at: string;
  updated_at: string;
  webinar_id: string | null;
  lead_id: string | null;
  user_name: string | null;
  user_email: string;
  mode: 'ai' | 'human';
  is_active: boolean;
  last_message_at: string | null;
  taken_over_at: string | null;
  taken_over_by: string | null;
  returned_to_ai_at: string | null;
  // Joined data
  webinar_name?: string;
  pending_count?: number;
  last_message?: string;
}

export interface PendingReply {
  id: string;
  created_at: string;
  session_id: string | null;
  chat_message_id: string | null;
  webinar_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_message: string | null;
  is_answered: boolean;
  answered_at: string | null;
  human_response: string | null;
}

export interface QuickReply {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  message: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface LiveChatMessage {
  id: string;
  webinar_id: string;
  lead_id: string | null;
  user_name: string;
  user_email: string;
  user_message: string;
  ai_response: string;
  sent_at: string;
  session_date: string;
  response_type: 'ai' | 'human' | null;
  session_id: string | null;
  is_pending: boolean | null;
  responded_at: string | null;
}

export type SessionStatus = 'pending' | 'active' | 'human' | 'inactive';

export function getSessionStatus(session: ChatSession): SessionStatus {
  const now = new Date();
  const lastMessageTime = session.last_message_at ? new Date(session.last_message_at) : null;
  const minutesSinceLastMessage = lastMessageTime 
    ? (now.getTime() - lastMessageTime.getTime()) / (1000 * 60) 
    : Infinity;

  // Check if there are pending messages (human mode with recent message)
  if (session.mode === 'human' && minutesSinceLastMessage < 5) {
    return 'pending';
  }
  
  // Human mode but handled
  if (session.mode === 'human') {
    return 'human';
  }
  
  // Inactive if no message in 5+ minutes
  if (minutesSinceLastMessage > 5) {
    return 'inactive';
  }
  
  return 'active';
}

export function getStatusColor(status: SessionStatus): string {
  switch (status) {
    case 'pending': return 'text-yellow-500';
    case 'active': return 'text-green-500';
    case 'human': return 'text-blue-500';
    case 'inactive': return 'text-gray-400';
  }
}

export function getStatusEmoji(status: SessionStatus): string {
  switch (status) {
    case 'pending': return '🟡';
    case 'active': return '🟢';
    case 'human': return '🔵';
    case 'inactive': return '⚪';
  }
}
