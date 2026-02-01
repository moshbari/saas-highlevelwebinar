import { WebinarConfig } from '@/types/webinar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Code, Eye, Clock, Users, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface WebinarCardProps {
  webinar: WebinarConfig;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewCode: (id: string) => void;
  onPreview: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function WebinarCard({ webinar, onEdit, onDelete, onViewCode, onPreview, onDuplicate }: WebinarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-card overflow-hidden group hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                  {webinar.logoText}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground">
                    {webinar.webinarName || 'Untitled Webinar'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{webinar.headerTitle}</p>
                </div>
              </div>
              <div className="live-badge opacity-80">
                <span className="live-dot"></span>
                LIVE
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{webinar.startHour.toString().padStart(2, '0')}:{webinar.startMinute.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{webinar.minViewers}-{webinar.maxViewers} viewers</span>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground mb-4">
              Created {format(new Date(webinar.createdAt), 'MMM d, yyyy')}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(webinar.id)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPreview(webinar.id)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onViewCode(webinar.id)}
              >
                <Code className="w-4 h-4 mr-1" />
                Code
              </Button>
              {onDuplicate && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onDuplicate(webinar.id)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Duplicate
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(webinar.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
