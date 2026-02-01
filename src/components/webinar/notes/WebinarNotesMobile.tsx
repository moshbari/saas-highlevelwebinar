import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mic, Loader2, Check, AlertCircle, Eye, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWebinarNotes } from '@/hooks/useWebinarNotes';
import { useVoiceDictation } from '@/hooks/useVoiceDictation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WebinarNotesMobileProps {
  webinarId: string;
  webinarName: string;
  onClose: () => void;
}

// Helper function to render text with clickable links
const renderContentWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export const WebinarNotesMobile = ({
  webinarId,
  webinarName,
  onClose,
}: WebinarNotesMobileProps) => {
  const { content, updateContent, saveStatus, isLoading, retrySave } = useWebinarNotes(webinarId);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const didInitModeRef = useRef(false);
  
  const { isRecording, isProcessing, toggleRecording } = useVoiceDictation({
    onTranscription: (text) => {
      const newContent = content ? `${content}\n${text}` : text;
      updateContent(newContent);
    },
    addTimestamp: true,
  });

  // On mobile, default to Preview mode once notes are loaded (so links are immediately tappable).
  // If there are no notes yet, keep Edit mode.
  useEffect(() => {
    if (didInitModeRef.current) return;
    if (isLoading) return;

    setIsPreviewMode(Boolean(content && content.trim().length > 0));
    didInitModeRef.current = true;
  }, [isLoading, content]);

  // Adjust height when keyboard opens (using visual viewport)
  useEffect(() => {
    const handleResize = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    };
    
    handleResize();
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving...
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center gap-1.5 text-green-600 text-sm">
            <Check className="w-3.5 h-3.5" />
            Auto-saved
          </span>
        );
      case 'error':
        return (
          <button 
            type="button"
            onClick={retrySave}
            className="flex items-center gap-1.5 text-destructive text-sm"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Retry
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 bg-background z-[1000] flex flex-col"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
        <Button 
          type="button"
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="shrink-0 h-11 w-11"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">Notes</h3>
          <p className="text-sm text-muted-foreground truncate">{webinarName}</p>
        </div>
        {/* Preview/Edit toggle */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className="shrink-0 h-11 w-11"
          title={isPreviewMode ? "Edit notes" : "Preview with clickable links"}
        >
          {isPreviewMode ? <Edit3 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </Button>
      </div>

      {/* Voice Dictation Button */}
      <div className="p-4 flex justify-center shrink-0">
        <Button
          type="button"
          variant={isRecording ? 'destructive' : 'secondary'}
          onClick={toggleRecording}
          disabled={isProcessing}
          className={cn(
            'w-14 h-14 rounded-full p-0',
            isRecording && 'animate-pulse'
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground -mt-2 mb-2 shrink-0">
        {isProcessing ? 'Transcribing...' : isRecording ? 'Recording... Tap to stop' : 'Tap to dictate'}
      </p>

      {/* Notes Content */}
      <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : isPreviewMode ? (
          <div 
            className="flex-1 overflow-auto text-base leading-relaxed whitespace-pre-wrap border rounded-md p-3 bg-muted/30"
            style={{ fontSize: '16px' }}
          >
            {content ? renderContentWithLinks(content) : (
              <span className="text-muted-foreground">No notes yet...</span>
            )}
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Start typing your notes here..."
            className="flex-1 resize-none text-base leading-relaxed min-h-[200px]"
            style={{ fontSize: '16px' }} // Prevents iOS zoom on focus
          />
        )}
      </div>

      {/* Save Status Footer */}
      <div className="p-4 border-t border-border shrink-0 flex items-center justify-between">
        {renderSaveStatus()}
        {!isPreviewMode && content && (
          <span className="text-xs text-muted-foreground">
            Tap 👁 to view clickable links
          </span>
        )}
        {isPreviewMode && (
          <span className="text-xs text-muted-foreground">
            Tap ✎ to edit
          </span>
        )}
      </div>
    </motion.div>
  );
};