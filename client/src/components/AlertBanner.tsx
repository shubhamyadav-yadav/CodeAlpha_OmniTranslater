import React from 'react';

interface AlertBannerProps {
  message: string | null;
  type?: 'error' | 'warning';
  onDismiss: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  message,
  type = 'error',
  onDismiss,
}) => {
  if (!message) return null;

  return (
    <div className={`alert-banner ${type}`} role="alert" aria-live="assertive">
      <div className="alert-content">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{message}</span>
      </div>
      <button
        type="button"
        className="alert-close"
        onClick={onDismiss}
        aria-label="Dismiss error notification"
        title="Dismiss"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};
