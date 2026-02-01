import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { rowToConfig } from '@/lib/webinarStorage';
import { WebinarConfig, TIMEZONES } from '@/types/webinar';
import { Loader2, AlertCircle, CalendarOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getBorderRadius = (radius: string) => {
  switch (radius) {
    case 'none': return '0px';
    case 'slight': return '6px';
    case 'rounded': return '12px';
    case 'pill': return '9999px';
    default: return '12px';
  }
};

export default function RegisterPage() {
  const { webinarId } = useParams<{ webinarId: string }>();
  const { toast } = useToast();
  const [config, setConfig] = useState<WebinarConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

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
          setError('Failed to load registration form');
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

  const nextSession = useMemo(() => {
    if (!config) return null;
    
    const now = new Date();
    const sessionDate = new Date(now);
    sessionDate.setHours(config.startHour, config.startMinute, 0, 0);
    
    if (sessionDate <= now) {
      sessionDate.setDate(sessionDate.getDate() + 1);
    }
    
    const tz = TIMEZONES.find(t => t.value === config.timezone);
    const tzLabel = tz ? tz.label.split(' ')[0] : 'Local';
    
    return {
      date: sessionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      timezone: tzLabel
    };
  }, [config]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setFormError('Please enter your name');
      return false;
    }
    if (!email.trim()) {
      setFormError('Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !config) return;

    if (!config.regFormGhlWebhookUrl) {
      setFormError('Registration is not configured. Please contact the host.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      // Parse name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        name: name.trim(),
        firstName,
        lastName,
        email: email.trim(),
        webinar_id: config.id,
        webinar_name: config.webinarName,
        registered_at: new Date().toISOString(),
        source: 'registration_page'
      };

      const response = await fetch(config.regFormGhlWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit registration');
      }

      // Redirect to thank you page
      if (config.regFormThankYouUrl) {
        const thankYouUrl = new URL(config.regFormThankYouUrl);
        thankYouUrl.searchParams.set('name', name.trim());
        thankYouUrl.searchParams.set('email', email.trim());
        window.location.href = thankYouUrl.toString();
      } else {
        toast({
          title: "Registration successful!",
          description: "You've been registered for the webinar.",
        });
        setName('');
        setEmail('');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setFormError('Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-white/70 text-sm">Loading registration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Registration Not Found</h1>
          <p className="text-white/60 mb-6">
            This registration page doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (!config?.enableRegistrationForm) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <CalendarOff className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Registration Unavailable</h1>
          <p className="text-white/60 mb-6">
            Registration for this webinar is currently closed.
          </p>
        </div>
      </div>
    );
  }

  const isDark = config.regFormTheme === 'dark';
  const borderRadius = getBorderRadius(config.regFormBorderRadius);

  const containerStyle = {
    background: config.regFormBackground || '#0a0a0f',
    color: config.regFormTextColor || '#ffffff',
    borderRadius,
  };

  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#d1d5db'}`,
    borderRadius: '8px',
    color: config.regFormTextColor || '#ffffff',
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)' }}
    >
      <div 
        className="w-full max-w-md p-8 md:p-10 text-center shadow-2xl"
        style={containerStyle}
      >
        <h1 
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
        >
          {config.regFormHeadline || 'Register for the Webinar'}
        </h1>
        
        {config.regFormSubheadline && (
          <p className="opacity-80 mb-4">{config.regFormSubheadline}</p>
        )}
        
        {config.regFormShowDatetime && nextSession && (
          <div 
            className="mb-6 py-2 px-4 rounded-lg inline-block"
            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          >
            <span className="text-sm">
              📅 Next Session: {nextSession.date} at {nextSession.time} ({nextSession.timezone})
            </span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-medium mb-1.5">
              {config.regFormNameLabel || 'Your Name'}
            </label>
            <input
              type="text"
              placeholder={config.regFormNamePlaceholder || 'Enter your name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 outline-none transition-all focus:ring-2"
              style={{
                ...inputStyle,
                ['--tw-ring-color' as string]: config.regFormButtonColor || '#e53935',
              }}
              disabled={submitting}
            />
          </div>
          
          <div className="text-left">
            <label className="block text-sm font-medium mb-1.5">
              {config.regFormEmailLabel || 'Your Email'}
            </label>
            <input
              type="email"
              placeholder={config.regFormEmailPlaceholder || 'Enter your email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 outline-none transition-all focus:ring-2"
              style={{
                ...inputStyle,
                ['--tw-ring-color' as string]: config.regFormButtonColor || '#e53935',
              }}
              disabled={submitting}
            />
          </div>
          
          {formError && (
            <div className="text-red-400 text-sm text-left bg-red-500/10 p-3 rounded-lg">
              {formError}
            </div>
          )}
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 font-semibold text-white text-lg transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            style={{ 
              background: config.regFormButtonColor || '#e53935',
              borderRadius,
            }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </span>
            ) : (
              config.regFormButtonText || 'Reserve My Seat →'
            )}
          </button>
          
          {config.regFormShowPrivacy && (
            <p className="text-xs opacity-60 mt-4">
              🔒 {config.regFormPrivacyText || 'We respect your privacy. Unsubscribe anytime.'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
