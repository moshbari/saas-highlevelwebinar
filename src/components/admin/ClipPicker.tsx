import { useState, useMemo } from 'react';
import { Clip } from '@/types/clip';
import { formatDuration } from '@/lib/clipStorage';
import { useClips, useDeleteClip } from '@/hooks/useClips';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClipPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (clips: Clip[]) => void;
  onCreateNew: () => void;
  excludeIds?: string[];
}

export function ClipPicker({ open, onClose, onSelect, onCreateNew, excludeIds = [] }: ClipPickerProps) {
  const { data: allClips = [], isLoading } = useClips();
  const deleteClipMutation = useDeleteClip();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter clips based on search and exclusions
  const filteredClips = useMemo(() => {
    return allClips.filter(clip => {
      if (excludeIds.includes(clip.id)) return false;
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        clip.name.toLowerCase().includes(searchLower) ||
        clip.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    });
  }, [allClips, search, excludeIds]);

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async (e: React.MouseEvent, clipId: string, clipName: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!confirm(`Delete "${clipName}" from the library?`)) return;
    
    try {
      await deleteClipMutation.mutateAsync(clipId);
      selectedIds.delete(clipId);
      setSelectedIds(new Set(selectedIds));
      toast.success('Clip deleted');
    } catch (error) {
      toast.error('Failed to delete clip');
    }
  };

  const handleAdd = () => {
    const selectedClips = allClips.filter(c => selectedIds.has(c.id));
    onSelect(selectedClips);
    setSelectedIds(new Set());
    setSearch('');
    onClose();
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearch('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Clips from Library</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clips..."
            className="pl-10 input-field"
          />
        </div>
        
        <ScrollArea className="h-[300px] border border-border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredClips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">No clips found</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredClips.map((clip) => (
                <div
                  key={clip.id}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => handleToggle(clip.id)}
                >
                  <Checkbox
                    checked={selectedIds.has(clip.id)}
                    onCheckedChange={() => handleToggle(clip.id)}
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="font-medium truncate">{clip.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{clip.url}</p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDuration(clip.durationSeconds)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label={`Delete ${clip.name}`}
                    className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDelete(e, clip.id, clip.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleClose();
              onCreateNew();
            }}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Create New Clip
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={selectedIds.size === 0}>
            Add Selected ({selectedIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
