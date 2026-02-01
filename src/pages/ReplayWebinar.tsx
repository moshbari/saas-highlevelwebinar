import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateReplayCode } from '@/lib/generateReplayCode';
import { rowToConfig } from '@/lib/webinarStorage';
import { WebinarConfig } from '@/types/webinar';
import { Loader2 } from 'lucide-react';

export default function ReplayWebinar() {
  const { webinarId } = useParams<{ webinarId: string }>();
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState<WebinarConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Pre-fill lead data from URL params if provided
  const prefillName = searchParams.get('name') || '';
  const prefillEmail = searchParams.get('email') || '';

  useEffect(() => {
    async function fetchWebinar() {
      if (!webinarId) {
        setError('Webinar ID is required');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('webinars')
          .select('*')
          .eq('id', webinarId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching webinar:', fetchError);
          setError('Failed to load webinar');
          setLoading(false);
          return;
        }

        if (!data) {
          setError('Webinar not found');
          setLoading(false);
          return;
        }

        const webinarConfig = rowToConfig(data);
        setConfig(webinarConfig);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }

    fetchWebinar();
  }, [webinarId]);

  // Generate and inject the replay code into iframe
  useEffect(() => {
    if (!config || !iframeRef.current) return;

    let replayCode = generateReplayCode(config);

    // Inject prefill data if provided
    if (prefillName || prefillEmail) {
      const prefillScript = `
        <script>
          window.PREFILL_DATA = {
            name: "${prefillName.replace(/"/g, '\\"')}",
            email: "${prefillEmail.replace(/"/g, '\\"')}"
          };
        </script>
      `;
      replayCode = replayCode.replace('</head>', `${prefillScript}</head>`);
    }

    iframeRef.current.srcdoc = replayCode;
  }, [config, prefillName, prefillEmail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-white/70 text-sm">Loading replay...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">{error}</h1>
          <p className="text-white/60 mb-6">
            The replay you're looking for doesn't exist or has been removed.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title={`${config?.headerTitle || 'Webinar'} - Replay`}
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      allow="autoplay; fullscreen"
    />
  );
}
