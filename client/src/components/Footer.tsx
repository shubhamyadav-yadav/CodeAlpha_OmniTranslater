import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-content">
        <p className="footer-brand">
          OmniTranslater &bull; Next-Gen Intelligent Translation Architecture
        </p>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          Client-Side Zero Key Exposure &bull; Neural Machine Translation &bull; Strict Zero Data Retention
        </p>
      </div>
    </footer>
  );
};
