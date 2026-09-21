import React from 'react';
import { HealthInfo } from '../types/translation.js';

interface HeaderProps {
  healthInfo: HealthInfo | null;
  serverError: boolean;
}

export const Header: React.FC<HeaderProps> = ({ healthInfo, serverError }) => {
  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        <div className="brand-wrapper">
          <div className="brand-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </div>
          <div className="brand-text">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1>OmniTranslater</h1>
              <span className="brand-badge">AI v2.0</span>
            </div>
            <p>Universal Neural Translation Suite</p>
          </div>
        </div>

        <div className="header-badges">
          <div
            className="status-badge"
            role="status"
            aria-label={`Server status: ${serverError ? 'offline' : healthInfo ? 'online' : 'connecting'}`}
          >
            <span
              className={`status-dot ${serverError ? 'offline' : healthInfo ? 'online' : ''}`}
              aria-hidden="true"
            />
            <span>
              {serverError
                ? 'Gateway Offline'
                : healthInfo
                ? `Neural Online • ${healthInfo.activeProvider}`
                : 'Connecting to Neural Core...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
