import { useTotalLiveViewers } from '@/hooks/useLiveViewerCounts';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function Live() {
  const { totalCount, breakdown, isLoading, dataUpdatedAt } = useTotalLiveViewers(5000);

  const lastUpdated = dataUpdatedAt ? format(new Date(dataUpdatedAt), 'h:mm:ss a') : '--';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-lg font-semibold text-green-500 tracking-wider">LIVE</span>
        </div>

        {/* Main count */}
        {isLoading ? (
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        ) : (
          <motion.div
            key={totalCount}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-8xl font-display font-bold text-foreground mb-2"
          >
            {totalCount}
          </motion.div>
        )}

        <p className="text-muted-foreground text-lg mb-2">viewers watching</p>
        <p className="text-muted-foreground/60 text-sm">Last updated: {lastUpdated}</p>
      </motion.div>

      {/* Breakdown section */}
      {breakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 w-full max-w-md"
        >
          <div className="border-t border-border/50 pt-6">
            <div className="space-y-2">
              {breakdown.map((item, index) => (
                <motion.div
                  key={item.webinar_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-sm text-foreground/80 truncate max-w-[280px]">
                    {item.webinar_name}
                  </span>
                  <span className="text-sm font-medium text-foreground ml-4">
                    {item.live_count}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && breakdown.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-muted-foreground/60 text-sm"
        >
          No active viewers right now
        </motion.p>
      )}
    </div>
  );
}
