import { useState } from 'react';
import './App.css';

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [readyStatus, setReadyStatus] = useState<string>('');

  const checkHealth = async () => {
    try {
      const response = await fetch('http://localhost:4000/healthz');
      const data = await response.json();
      setHealthStatus(`Health: ${data.status} (${data.timestamp})`);
    } catch (error) {
      setHealthStatus('Health check failed');
    }
  };

  const checkReady = async () => {
    try {
      const response = await fetch('http://localhost:4000/readyz');
      const data = await response.json();
      setReadyStatus(`Ready: ${data.status} (${data.timestamp})`);
    } catch (error) {
      setReadyStatus('Readiness check failed');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>StudyFlow</h1>
        <p>Monorepo with API + Web</p>
      </header>

      <main className="app-main">
        <div className="links">
          <a
            href="http://localhost:4000/healthz"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            API Health Check
          </a>
          <a
            href="http://localhost:4000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            API Documentation
          </a>
        </div>

        <div className="status-checks">
          <button onClick={checkHealth} className="button">
            Check Health
          </button>
          <button onClick={checkReady} className="button">
            Check Ready
          </button>

          {healthStatus && <div className="status">{healthStatus}</div>}
          {readyStatus && <div className="status">{readyStatus}</div>}
        </div>
      </main>
    </div>
  );
}

export default App;
