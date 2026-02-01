import { WebinarConfig, TIMEZONES } from '@/types/webinar';
import { useMemo } from 'react';

interface RegistrationFormPreviewProps {
  config: Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'>;
}

const getBorderRadius = (radius: string) => {
  switch (radius) {
    case 'none': return '0px';
    case 'slight': return '6px';
    case 'rounded': return '12px';
    case 'pill': return '9999px';
    default: return '12px';
  }
};

export function RegistrationFormPreview({ config }: RegistrationFormPreviewProps) {
  const nextSession = useMemo(() => {
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
  }, [config.startHour, config.startMinute, config.timezone]);

  const isDark = config.regFormTheme === 'dark';
  const borderRadius = getBorderRadius(config.regFormBorderRadius);
  
  const containerStyle = {
    background: config.regFormBackground,
    color: config.regFormTextColor,
    borderRadius,
  };
  
  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#d1d5db'}`,
    borderRadius,
    color: config.regFormTextColor,
  };

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 border-b border-border/50">
        <span className="text-xs text-muted-foreground font-medium">Registration Form Preview</span>
      </div>
      
      <div className="p-6 bg-background/50">
        <div 
          className="max-w-md mx-auto p-8 text-center"
          style={containerStyle}
        >
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            {config.regFormHeadline || 'Register for the Free Training'}
          </h2>
          
          {config.regFormSubheadline && (
            <p className="opacity-80 mb-4">{config.regFormSubheadline}</p>
          )}
          
          {config.regFormShowDatetime && (
            <div 
              className="mb-6 py-2 px-4 rounded-lg inline-block"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
              <span className="text-sm">
                📅 Next Session: {nextSession.date} at {nextSession.time} ({nextSession.timezone})
              </span>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="text-left">
              <label className="block text-sm font-medium mb-1.5">{config.regFormNameLabel}</label>
              <input
                type="text"
                placeholder={config.regFormNamePlaceholder}
                className="w-full px-4 py-3 outline-none"
                style={inputStyle}
                disabled
              />
            </div>
            
            <div className="text-left">
              <label className="block text-sm font-medium mb-1.5">{config.regFormEmailLabel}</label>
              <input
                type="email"
                placeholder={config.regFormEmailPlaceholder}
                className="w-full px-4 py-3 outline-none"
                style={inputStyle}
                disabled
              />
            </div>
            
            <button
              className="w-full py-3.5 font-semibold text-white transition-all hover:opacity-90"
              style={{ 
                background: config.regFormButtonColor,
                borderRadius,
              }}
              disabled
            >
              {config.regFormButtonText}
            </button>
            
            {config.regFormShowPrivacy && (
              <p className="text-xs opacity-60">
                🔒 {config.regFormPrivacyText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
