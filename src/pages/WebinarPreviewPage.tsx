import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebinar } from '@/hooks/useWebinars';
import { generateEmbedCode } from '@/lib/generateEmbedCode';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Maximize2, Loader2 } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export default function WebinarPreviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: webinar, isLoading, error } = useWebinar(id);

  useEffect(() => {
    if (!isLoading && !webinar && !error) {
      navigate(ROUTES.HOME);
    }
  }, [isLoading, webinar, error, navigate]);

  const handleFullscreen = () => {
    if (webinar) {
      const code = generateEmbedCode(webinar);
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!webinar) return null;

  const code = generateEmbedCode(webinar);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.HOME)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-xl">Preview</h1>
              <p className="text-xs text-muted-foreground">{webinar.webinarName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate(`/webinar/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button onClick={handleFullscreen} className="glow-button">
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen Preview
            </Button>
          </div>
        </div>
      </header>

      {/* Preview Frame */}
      <main className="flex-1 p-6">
        <div className="w-full h-full rounded-xl overflow-hidden border border-border/50 bg-black">
          <iframe
            srcDoc={code}
            className="w-full h-full min-h-[600px]"
            title="Webinar Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </main>
    </div>
  );
}
