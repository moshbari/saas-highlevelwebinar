import { WebinarConfig } from '@/types/webinar';
import { Users, Volume2, Send } from 'lucide-react';

interface WebinarPreviewProps {
  config: Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'>;
}

export function WebinarPreview({ config }: WebinarPreviewProps) {
  const primaryColor = config.primaryColor || '#e53935';
  const bgColor = config.backgroundColor || '#0a0a0f';
  const chatBg = config.chatBackground || '#12121a';

  return (
    <div 
      className="rounded-xl overflow-hidden border border-border/50"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            {config.logoText || 'W'}
          </div>
          <span className="text-white font-semibold text-sm">
            {config.headerTitle || 'Webinar Title'}
          </span>
        </div>
        <div 
          className="flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-semibold"
          style={{ background: `linear-gradient(90deg, ${primaryColor}, #c62828)` }}
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Users className="w-4 h-4" />
          <span>{config.minViewers || 150}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex" style={{ height: '300px' }}>
        {/* Video Section */}
        <div className="flex-1 relative flex items-center justify-center p-4">
          <div className="w-full h-full bg-black/50 rounded-lg flex items-center justify-center">
            <div className="text-center text-white/50">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                ▶
              </div>
              <p className="text-sm">Video Preview</p>
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-lg flex items-center gap-2 text-white text-sm">
            <Volume2 className="w-4 h-4" />
            Click to unmute
          </div>
        </div>

        {/* Chat Section */}
        <div 
          className="w-64 flex flex-col border-l"
          style={{ backgroundColor: chatBg, borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div 
            className="px-4 py-3 border-b text-white font-semibold text-sm"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            💬 Live Chat
          </div>
          
          <div className="flex-1 p-3 space-y-3 overflow-hidden">
            {/* Bot Message */}
            <div className="flex gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {config.botAvatar || 'AI'}
              </div>
              <div className="bg-white/5 rounded-xl rounded-bl-sm px-3 py-2 text-white text-xs max-w-[80%]">
                {config.welcomeMessage?.replace('{name}', 'John') || 'Welcome! Ask me anything.'}
              </div>
            </div>
            
            {/* User Message */}
            <div className="flex gap-2 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                J
              </div>
              <div 
                className="rounded-xl rounded-br-sm px-3 py-2 text-white text-xs max-w-[80%]"
                style={{ backgroundColor: primaryColor }}
              >
                This looks great!
              </div>
            </div>
          </div>
          
          <div 
            className="p-3 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-500"
                disabled
              />
              <button 
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: primaryColor }}
                disabled
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
