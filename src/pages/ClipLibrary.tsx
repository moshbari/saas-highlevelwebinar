import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClips, useSaveClip, useUpdateClip, useDeleteClip } from '@/hooks/useClips';
import { Clip } from '@/types/clip';
import { formatDuration } from '@/lib/clipStorage';
import { AddClipModal } from '@/components/admin/AddClipModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Film, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Loader2,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/routes';

export default function ClipLibrary() {
  const navigate = useNavigate();
  const { data: clips = [], isLoading } = useClips();
  const saveClipMutation = useSaveClip();
  const updateClipMutation = useUpdateClip();
  const deleteClipMutation = useDeleteClip();
  
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClip, setEditingClip] = useState<Clip | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Get all unique tags
  const allTags = Array.from(new Set(clips.flatMap(c => c.tags))).sort();

  // Filter clips
  const filteredClips = clips.filter(clip => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        clip.name.toLowerCase().includes(searchLower) ||
        clip.url.toLowerCase().includes(searchLower) ||
        clip.tags.some(t => t.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    if (tagFilter !== 'all') {
      if (!clip.tags.includes(tagFilter)) return false;
    }
    return true;
  });

  const handleSave = async (clipData: Omit<Clip, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingClip) {
      const updated = await updateClipMutation.mutateAsync({
        id: editingClip.id,
        clip: clipData,
      });
      if (updated) {
        toast({ title: 'Clip updated', description: 'Changes saved successfully' });
      }
    } else {
      const saved = await saveClipMutation.mutateAsync(clipData);
      if (saved) {
        toast({ title: 'Clip added', description: 'New clip saved to library' });
      }
    }
    setEditingClip(null);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      const success = await deleteClipMutation.mutateAsync(deleteId);
      if (success) {
        toast({ title: 'Clip deleted', description: 'Clip removed from library' });
      }
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.HOME)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg sm:text-xl">Clip Library</h1>
              <p className="text-xs text-muted-foreground">Manage your video clips</p>
            </div>
          </div>
          <Button onClick={() => { setEditingClip(null); setModalOpen(true); }} className="glow-button">
            <Plus className="w-4 h-4 mr-2" />
            Add Clip
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clips..."
              className="pl-10 input-field"
            />
          </div>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-full sm:w-[180px] input-field">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : clips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-secondary/50 flex items-center justify-center">
              <Film className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">No Clips Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add video clips to your library to use them in webinar sequences.
            </p>
            <Button onClick={() => setModalOpen(true)} className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Clip
            </Button>
          </motion.div>
        ) : filteredClips.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No clips match your search</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px]">Clip</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClips.map((clip) => (
                  <TableRow key={clip.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Play className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{clip.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                            {clip.url}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {formatDuration(clip.durationSeconds)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {clip.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {clip.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{clip.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingClip(clip);
                            setModalOpen(true);
                          }}
                          className="h-8 px-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(clip.id)}
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <AddClipModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingClip(null); }}
        onSave={handleSave}
        editingClip={editingClip}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Clip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this clip? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
