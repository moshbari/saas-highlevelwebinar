import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function TrialWarningBar() {
  const { isTrial, trialEndsAt, trialExpired } = useAuth();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!isTrial || !trialEndsAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = trialEndsAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isTrial, trialEndsAt]);

  if (!isTrial || !timeLeft) return null;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm font-medium">
          {trialExpired ? (
            'Your trial has expired!'
          ) : (
            <>
              Trial expires in:{' '}
              <span className="font-mono font-bold">
                {timeLeft.days}d {formatNumber(timeLeft.hours)}:
                {formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
              </span>
            </>
          )}
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate('/upgrade')}
        className="bg-white text-destructive hover:bg-white/90 font-semibold"
      >
        Upgrade Now
      </Button>
    </div>
  );
}
