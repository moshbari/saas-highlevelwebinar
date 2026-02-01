import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, getSafeBackPath } from '@/lib/routes';

/**
 * Hook that provides a safe back navigation function.
 * If browser history exists, navigates back. Otherwise, navigates to home.
 */
export function useSafeBack() {
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    const path = getSafeBackPath();
    if (path === 'BACK') {
      navigate(-1);
    } else {
      navigate(ROUTES.HOME);
    }
  }, [navigate]);

  return goBack;
}
