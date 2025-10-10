import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:4000';

function App() {
  const [health, setHealth] = useState<{ status: string; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/healthz`)
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>StudyFlow</h1>
        <p className="subtitle">Learning management platform</p>
      </header>

      <main className="main">
        <section className="card">
          <h2>API Status</h2>
          {error && <p className="error">Error: {error}</p>}
          {health && (
            <div className="status">
              <p>
                Status: <span className="status-badge">{health.status}</span>
              </p>
              <p className="timestamp">Last checked: {new Date(health.timestamp).toLocaleString()}</p>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Quick Links</h2>
          <ul className="links">
            <li>
              <a href={`${API_URL}/healthz`} target="_blank" rel="noopener noreferrer">
                Health Endpoint
              </a>
            </li>
            <li>
              <a href={`${API_URL}/docs`} target="_blank" rel="noopener noreferrer">
                API Documentation
              </a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
