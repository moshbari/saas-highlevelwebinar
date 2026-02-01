import { useState, useEffect } from 'react';
import { Clip, VideoSequenceItem, VideoSequenceClip } from '@/types/clip';
import { formatDuration } from '@/lib/clipStorage';
import { useClipsByIds } from '@/hooks/useClips';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipPicker } from './ClipPicker';
import { AddClipModal } from './AddClipModal';
import { useSaveClip } from '@/hooks/useClips';
import { GripVertical, ChevronUp, ChevronDown, Trash2, Plus, Film, Loader2 } from 'lucide-react';

interface VideoSequenceBuilderProps {
  sequence: VideoSequenceItem[];
  onChange: (sequence: VideoSequenceItem[]) => void;
}

export function VideoSequenceBuilder({ sequence, onChange }: VideoSequenceBuilderProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const saveClipMutation = useSaveClip();
  
  // Get clip IDs from sequence
  const clipIds = sequence.map(s => s.clipId);
  const { data: clips = [], isLoading } = useClipsByIds(clipIds);
  
  // Build sequence clips with order
  const sequenceClips: VideoSequenceClip[] = sequence
    .map(item => {
      const clip = clips.find(c => c.id === item.clipId);
      if (!clip) return null;
      return {
        id: clip.id,
        name: clip.name,
        url: clip.url,
        durationSeconds: clip.durationSeconds,
        order: item.order,
      };
    })
    .filter((c): c is VideoSequenceClip => c !== null)
    .sort((a, b) => a.order - b.order);
  
  // Calculate total duration
  const totalDuration = sequenceClips.reduce((sum, c) => sum + c.durationSeconds, 0);
  
  const handleAddClips = (newClips: Clip[]) => {
    const maxOrder = sequence.length > 0 ? Math.max(...sequence.map(s => s.order)) : 0;
    const newItems: VideoSequenceItem[] = newClips.map((clip, index) => ({
      clipId: clip.id,
      order: maxOrder + index + 1,
    }));
    onChange([...sequence, ...newItems]);
  };
  
  const handleRemove = (clipId: string) => {
    const newSequence = sequence.filter(s => s.clipId !== clipId);
    // Reorder remaining items
    onChange(newSequence.map((item, index) => ({ ...item, order: index + 1 })));
  };
  
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSequence = [...sequenceClips];
    [newSequence[index - 1], newSequence[index]] = [newSequence[index], newSequence[index - 1]];
    onChange(newSequence.map((clip, i) => ({ clipId: clip.id, order: i + 1 })));
  };
  
  const handleMoveDown = (index: number) => {
    if (index === sequenceClips.length - 1) return;
    const newSequence = [...sequenceClips];
    [newSequence[index], newSequence[index + 1]] = [newSequence[index + 1], newSequence[index]];
    onChange(newSequence.map((clip, i) => ({ clipId: clip.id, order: i + 1 })));
  };
  
  const handleSaveNewClip = async (clip: Omit<Clip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const saved = await saveClipMutation.mutateAsync(clip);
    if (saved) {
      handleAddClips([saved]);
    }
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Build your video sequence by adding clips from your library. Clips will play seamlessly in order.
        </p>
        <Button onClick={() => setPickerOpen(true)} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          Add from Library
        </Button>
      </div>
      
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Film className="w-4 h-4" />
            Video Sequence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : sequenceClips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
              <Film className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No clips added yet</p>
              <p className="text-xs">Click "Add from Library" to start building your sequence</p>
            </div>
          ) : (
            <>
              {sequenceClips.map((clip, index) => (
                <div
                  key={clip.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{clip.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{clip.url}</p>
                  </div>
                  <span className="text-sm text-muted-foreground font-mono whitespace-nowrap">
                    {formatDuration(clip.durationSeconds)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sequenceClips.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(clip.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-medium">Total Duration:</span>
                <span className="text-sm font-mono font-bold text-primary">
                  {formatDuration(totalDuration)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <ClipPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddClips}
        onCreateNew={() => {
          setPickerOpen(false);
          setAddModalOpen(true);
        }}
        excludeIds={clipIds}
      />
      
      <AddClipModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveNewClip}
      />
    </div>
  );
}
