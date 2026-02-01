import { useNavigate, useParams } from 'react-router-dom';
import { useWebinar } from '@/hooks/useWebinars';
import { CodeOutput } from '@/components/admin/CodeOutput';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { ROUTES } from '@/lib/routes';

export default function WebinarCode() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: webinar, isLoading, error } = useWebinar(id);

  useEffect(() => {
    if (!isLoading && !webinar && !error) {
      navigate(ROUTES.HOME);
    }
  }, [isLoading, webinar, error, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!webinar) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.HOME)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-xl">Embed Code</h1>
              <p className="text-xs text-muted-foreground">{webinar.webinarName}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/webinar/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Settings
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CodeOutput webinar={webinar} />
        </motion.div>
      </main>
    </div>
  );
}
