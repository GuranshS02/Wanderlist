import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Auto-scrolls to top of page when route changes.
 * Place this near the top of your app, inside the Router.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null; // This component renders nothing
}