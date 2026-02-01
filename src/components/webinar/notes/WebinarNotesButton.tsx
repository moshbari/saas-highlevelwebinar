import { useState } from 'react';
import { StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { WebinarNotesPanel } from './WebinarNotesPanel';
import { WebinarNotesMobile } from './WebinarNotesMobile';
import { useIsMobile } from '@/hooks/use-mobile';

interface WebinarNotesButtonProps {
  webinarId: string;
  webinarName: string;
  hasNotes?: boolean;
}

export const WebinarNotesButton = ({ 
  webinarId, 
  webinarName,
  hasNotes = false,
}: WebinarNotesButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="h-8 px-2 relative"
          >
            <StickyNote className="w-4 h-4" />
            {hasNotes && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Webinar Notes</p>
        </TooltipContent>
      </Tooltip>

      {isOpen && (
        isMobile ? (
          <WebinarNotesMobile
            webinarId={webinarId}
            webinarName={webinarName}
            onClose={() => setIsOpen(false)}
          />
        ) : (
          <WebinarNotesPanel
            webinarId={webinarId}
            webinarName={webinarName}
            onClose={() => setIsOpen(false)}
          />
        )
      )}
    </>
  );
};
