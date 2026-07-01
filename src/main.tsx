import React, {StrictMode, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error catcher for load/resource errors
window.addEventListener('error', (event) => {
  const rootEl = document.getElementById('root');
  if (rootEl && (!rootEl.innerHTML || rootEl.innerHTML === '')) {
    rootEl.innerHTML = `
      <div style="padding: 24px; font-family: sans-serif; background: #FFF5F5; color: #C53030; border: 1px solid #FEB2B2; margin: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0; font-size: 18px; font-weight: bold;">Ladefehler / Script Error</h2>
        <p style="font-size: 14px;">Ein Fehler ist beim Laden der Anwendung aufgetreten:</p>
        <pre style="background: #FFF; padding: 12px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 12px; border: 1px solid #E2E8F0;">${event.message || 'Script ladefehler oder CORS problem'}</pre>
        <p style="font-size: 13px; color: #4A5568;">Quelle: ${event.filename || 'unbekannt'}:${event.lineno || 0}:${event.colno || 0}</p>
        <button onclick="window.location.reload()" style="background: #C53030; color: #FFF; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">
          Seite neu laden
        </button>
      </div>
    `;
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const rootEl = document.getElementById('root');
  if (rootEl && (!rootEl.innerHTML || rootEl.innerHTML === '')) {
    rootEl.innerHTML = `
      <div style="padding: 24px; font-family: sans-serif; background: #FFF5F5; color: #C53030; border: 1px solid #FEB2B2; margin: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0; font-size: 18px; font-weight: bold;">Unhandled Promise Rejection</h2>
        <p style="font-size: 14px;">Ein asynchroner Fehler ist aufgetreten:</p>
        <pre style="background: #FFF; padding: 12px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 12px; border: 1px solid #E2E8F0;">${event.reason?.stack || event.reason || 'Unbekannter Promise-Fehler'}</pre>
        <button onclick="window.location.reload()" style="background: #C53030; color: #FFF; border: none; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">
          Seite neu laden
        </button>
      </div>
    `;
  }
});

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#FFF5F5', color: '#C53030', border: '1px solid #FEB2B2', margin: 20, borderRadius: 8 }}>
          <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 'bold' }}>Anwendungsfehler (Application Error)</h2>
          <p style={{ fontSize: 14 }}>Es gab ein Problem beim Rendern der Seite:</p>
          <pre style={{ background: '#FFF', padding: 12, borderRadius: 4, overflowX: 'auto', fontSize: 12, fontFamily: 'monospace', border: '1px solid #E2E8F0', color: '#2D3748' }}>
            {this.state.error?.stack || this.state.error?.message || 'Unbekannter Fehler'}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ background: '#C53030', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 }}
          >
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
