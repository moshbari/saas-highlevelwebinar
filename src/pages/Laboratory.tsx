import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWebinars, useDeleteWebinar, useSaveWebinar } from '@/hooks/useWebinars';
import { useLiveViewerCounts } from '@/hooks/useLiveViewerCounts';
import { useWebinarNotesIndicators } from '@/hooks/useWebinarNotes';
import { getWebinar } from '@/lib/webinarStorage';
import { generateEmbedCode } from '@/lib/generateEmbedCode';
import { TrialWarningBar } from '@/components/auth/TrialWarningBar';
import { WebinarNotesButton } from '@/components/webinar/notes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Radio, Loader2, MessageSquare, Edit, Eye, Code, Copy, Clipboard, Trash2, Clock, BarChart3, Headphones, LogOut, Settings, User, ExternalLink, PlayCircle, Link } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Laboratory() {
  const navigate = useNavigate();
  const { profile, isAdmin, signOut } = useAuth();
  const { data: webinars = [], isLoading, refetch } = useWebinars();
  const { data: liveViewerCounts = [] } = useLiveViewerCounts(15000);
  const deleteWebinarMutation = useDeleteWebinar();
  const saveWebinarMutation = useSaveWebinar();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [duplicating, setDuplicating] = useState(false);

  // Get webinar IDs for notes indicators
  const webinarIds = useMemo(() => webinars.map(w => w.id), [webinars]);
  const notesIndicators = useWebinarNotesIndicators(webinarIds);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Create a map of webinar_id to live count for quick lookup
  const liveCountMap = useMemo(() => {
    const map = new Map<string, number>();
    liveViewerCounts.forEach(item => {
      map.set(item.webinar_id, item.live_count);
    });
    return map;
  }, [liveViewerCounts]);

  const handleDelete = async () => {
    if (deleteId) {
      const success = await deleteWebinarMutation.mutateAsync(deleteId);
      if (success) {
        toast({
          title: 'Webinar deleted',
          description: 'The webinar has been removed',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete webinar',
          variant: 'destructive',
        });
      }
      setDeleteId(null);
      setDeleteConfirmText('');
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteId(null);
    setDeleteConfirmText('');
  };

  const handleDuplicate = async (id: string) => {
    setDuplicating(true);
    try {
      const webinar = await getWebinar(id);
      if (!webinar) {
        toast({ title: 'Error', description: 'Webinar not found', variant: 'destructive' });
        return;
      }

      const { id: _, createdAt, updatedAt, ...config } = webinar;
      const duplicatedConfig = {
        ...config,
        webinarName: `${config.webinarName} (Copy)`,
      };

      const newWebinar = await saveWebinarMutation.mutateAsync(duplicatedConfig);
      if (newWebinar) {
        toast({
          title: 'Webinar duplicated',
          description: 'A copy has been created',
        });
        refetch();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to duplicate', variant: 'destructive' });
    } finally {
      setDuplicating(false);
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const safeHour = hour ?? 12;
    const safeMinute = minute ?? 0;
    const period = safeHour >= 12 ? 'PM' : 'AM';
    const displayHour = safeHour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${safeMinute.toString().padStart(2, '0')} ${period}`;
  };

  const handleCopyCode = async (id: string) => {
    const webinar = await getWebinar(id);
    if (!webinar) {
      toast({ title: 'Error', description: 'Webinar not found', variant: 'destructive' });
      return;
    }
    const code = generateEmbedCode(webinar);
    await navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: 'Embed code copied to clipboard' });
  };

  const handleCopyWatchUrl = async (id: string) => {
    const url = `${window.location.origin}/watch/${id}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'Watch page URL copied to clipboard' });
  };

  const handleCopyReplayUrl = async (id: string) => {
    const url = `${window.location.origin}/replay/${id}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'Replay page URL copied to clipboard' });
  };

  const handleOpenWatch = (id: string) => {
    window.open(`/watch/${id}`, '_blank');
  };

  const handleOpenReplay = (id: string) => {
    window.open(`/replay/${id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Trial Warning Bar */}
      <TrialWarningBar />

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/favicon.png" alt="GHL Webinar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl" />
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl">GHL Webinar</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                Welcome, {profile?.full_name || 'User'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')} className="h-8 sm:h-9 px-2 sm:px-3">
              <BarChart3 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/chat-history')} className="h-8 sm:h-9 px-2 sm:px-3">
              <MessageSquare className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Chat History</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/live-chat')} className="h-8 sm:h-9 px-2 sm:px-3">
              <Headphones className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Live Chat</span>
            </Button>
            <Button onClick={() => navigate('/webinar/new')} size="sm" className="glow-button h-8 sm:h-9 px-2 sm:px-3">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New Webinar</span>
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/app-settings')} className="h-8 sm:h-9 px-2 sm:px-3">
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/update-password')} className="h-8 sm:h-9 px-2 sm:px-3">
              <User className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="h-8 sm:h-9 px-2 sm:px-3">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {isLoading || duplicating ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : webinars.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-secondary/50 flex items-center justify-center">
              <Radio className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">No Webinars Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first webinar to get started. Configure settings, generate embed code, and go live!
            </p>
            <Button onClick={() => navigate('/webinar/new')} className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Webinar
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="font-display text-lg sm:text-xl font-semibold">Your Webinars</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{webinars.length} webinar(s)</p>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {webinars.map((webinar) => (
                <motion.div
                  key={webinar.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {webinar.logoText?.slice(0, 2).toUpperCase() || 'W'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{webinar.webinarName}</p>
                      <p className="text-sm text-muted-foreground truncate">{webinar.headerTitle}</p>
                    </div>
                  </div>
                  
                  {/* Watching Now & Schedule */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium text-foreground">{liveCountMap.get(webinar.id) ?? 0}</span>
                      <span className="text-xs">watching</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(webinar.startHour, webinar.startMinute)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-border/50">
                    <TooltipProvider delayDuration={300}>
                      {/* Notes Button - FIRST */}
                      <WebinarNotesButton
                        webinarId={webinar.id}
                        webinarName={webinar.webinarName}
                        hasNotes={!!notesIndicators[webinar.id]}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/webinar/${webinar.id}/edit`)} className="h-8 px-2">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Edit</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/webinar/${webinar.id}/preview`)} className="h-8 px-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Preview</p></TooltipContent>
                      </Tooltip>
                      {/* Watch Page Dropdown - Mobile */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => handleOpenWatch(webinar.id)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Watch page
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyWatchUrl(webinar.id)}>
                            <Link className="w-4 h-4 mr-2" />
                            Copy watch URL
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* Replay Page Dropdown - Mobile */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <PlayCircle className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => handleOpenReplay(webinar.id)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Replay page
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyReplayUrl(webinar.id)}>
                            <Link className="w-4 h-4 mr-2" />
                            Copy replay URL
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyCode(webinar.id)} className="h-8 px-2">
                            <Clipboard className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Copy code</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleDuplicate(webinar.id)} className="h-8 px-2">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Duplicate</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(webinar.id)} className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Delete</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table View */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden sm:block rounded-xl border border-border bg-card overflow-hidden"
            >
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Webinar</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Watching Now</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webinars.map((webinar) => (
                    <TableRow key={webinar.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {webinar.logoText?.slice(0, 2).toUpperCase() || 'W'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{webinar.webinarName}</p>
                            <p className="text-sm text-muted-foreground truncate">{webinar.headerTitle}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{formatTime(webinar.startHour, webinar.startMinute)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">{liveCountMap.get(webinar.id) ?? 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(webinar.createdAt), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          LIVE
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider delayDuration={300}>
                            {/* Notes Button - FIRST */}
                            <WebinarNotesButton
                              webinarId={webinar.id}
                              webinarName={webinar.webinarName}
                              hasNotes={!!notesIndicators[webinar.id]}
                            />

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/webinar/${webinar.id}/edit`)}
                                  className="h-8 px-2"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit webinar settings</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/webinar/${webinar.id}/preview`)}
                                  className="h-8 px-2"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Preview webinar</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/webinar/${webinar.id}/code`)}
                                  className="h-8 px-2"
                                >
                                  <Code className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View embed code</p>
                              </TooltipContent>
                            </Tooltip>

                            {/* Watch Page Dropdown */}
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 px-2">
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Watch page</p>
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end" className="bg-popover">
                                <DropdownMenuItem onClick={() => handleOpenWatch(webinar.id)}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open in new tab
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopyWatchUrl(webinar.id)}>
                                  <Link className="w-4 h-4 mr-2" />
                                  Copy URL
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Replay Page Dropdown */}
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 px-2">
                                      <PlayCircle className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Replay page</p>
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end" className="bg-popover">
                                <DropdownMenuItem onClick={() => handleOpenReplay(webinar.id)}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Open in new tab
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopyReplayUrl(webinar.id)}>
                                  <Link className="w-4 h-4 mr-2" />
                                  Copy URL
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyCode(webinar.id)}
                                  className="h-8 px-2"
                                >
                                  <Clipboard className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy embed code</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDuplicate(webinar.id)}
                                  className="h-8 px-2"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Duplicate webinar</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteId(webinar.id)}
                                  className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete webinar</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          </>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the webinar
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Type <span className="font-mono font-bold">delete</span> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type 'delete' to confirm"
              className="max-w-xs"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirmText.toLowerCase() !== 'delete'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Webinar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
