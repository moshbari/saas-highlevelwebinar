import { useState, useEffect } from 'react';
import { Clip } from '@/types/clip';
import { detectVideoDuration } from '@/lib/clipStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, AlertCircle, X } from 'lucide-react';

interface AddClipModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (clip: Omit<Clip, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingClip?: Clip | null;
}

export function AddClipModal({ open, onClose, onSave, editingClip }: AddClipModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [autoDetected, setAutoDetected] = useState(true);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [detectError, setDetectError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (editingClip) {
        setName(editingClip.name);
        setUrl(editingClip.url);
        const totalSecs = editingClip.durationSeconds;
        setHours(Math.floor(totalSecs / 3600));
        setMinutes(Math.floor((totalSecs % 3600) / 60));
        setSeconds(totalSecs % 60);
        setAutoDetected(editingClip.durationAutoDetected);
        setNotes(editingClip.notes || '');
        setTags(editingClip.tags || []);
      } else {
        setName('');
        setUrl('');
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setAutoDetected(true);
        setNotes('');
        setTags([]);
      }
      setDetecting(false);
      setDetectStatus('idle');
      setDetectError('');
      setNewTag('');
    }
  }, [open, editingClip]);

  // Auto-detect duration when URL changes
  useEffect(() => {
    if (!url || !autoDetected || editingClip) return;
    
    const detectDuration = async () => {
      setDetecting(true);
      setDetectStatus('idle');
      setDetectError('');
      
      const result = await detectVideoDuration(url);
      
      setDetecting(false);
      
      if (result.success) {
        const totalSecs = result.duration;
        setHours(Math.floor(totalSecs / 3600));
        setMinutes(Math.floor((totalSecs % 3600) / 60));
        setSeconds(totalSecs % 60);
        setDetectStatus('success');
      } else {
        setDetectStatus('error');
        setDetectError(result.error || 'Failed to detect duration');
      }
    };
    
    const timer = setTimeout(detectDuration, 500);
    return () => clearTimeout(timer);
  }, [url, autoDetected, editingClip]);

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = () => {
    const durationSeconds = hours * 3600 + minutes * 60 + seconds;
    
    onSave({
      userId: null,
      name,
      url,
      durationSeconds,
      durationAutoDetected: autoDetected,
      thumbnailUrl: null,
      fileSizeMb: null,
      notes: notes || null,
      tags,
      isArchived: false,
    });
    
    onClose();
  };

  const isValid = name.trim() && url.trim() && (hours > 0 || minutes > 0 || seconds > 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingClip ? 'Edit Clip' : 'Add New Clip'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clipName">Clip Name *</Label>
            <Input
              id="clipName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Partner A - Intro"
              className="input-field"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clipUrl">Video URL *</Label>
            <Input
              id="clipUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://storage.example.com/video.mp4"
              className="input-field"
            />
            {detecting && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Detecting duration...
              </div>
            )}
            {detectStatus === 'success' && (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <Check className="w-4 h-4" />
                Duration detected: {hours}h {minutes}m {seconds}s
              </div>
            )}
            {detectStatus === 'error' && (
              <div className="flex items-center gap-2 text-sm text-yellow-500">
                <AlertCircle className="w-4 h-4" />
                {detectError}. Please enter manually.
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Hours</Label>
                <Input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                  className="input-field"
                  min={0}
                  disabled={autoDetected && detecting}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Minutes</Label>
                <Input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.min(59, parseInt(e.target.value) || 0))}
                  className="input-field"
                  min={0}
                  max={59}
                  disabled={autoDetected && detecting}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Seconds</Label>
                <Input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.min(59, parseInt(e.target.value) || 0))}
                  className="input-field"
                  min={0}
                  max={59}
                  disabled={autoDetected && detecting}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch
                checked={autoDetected}
                onCheckedChange={setAutoDetected}
                id="autoDetect"
              />
              <Label htmlFor="autoDetect" className="text-sm">Auto-detected</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Tags (optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this clip..."
              className="input-field min-h-[80px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {editingClip ? 'Update Clip' : 'Save Clip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
