import { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState<{ status: string; timestamp: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/healthz')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>StudyFlow</h1>
      <p>Welcome to StudyFlow - Your study management platform</p>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>API Status</h2>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {health && (
          <div>
            <p style={{ color: 'green' }}>✓ API is {health.status}</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>Last checked: {new Date(health.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Quick Links</h3>
        <ul>
          <li>
            <a href="http://localhost:4000/healthz" target="_blank" rel="noopener noreferrer">
              API Health Check
            </a>
          </li>
          <li>
            <a href="http://localhost:4000/docs" target="_blank" rel="noopener noreferrer">
              API Documentation (Swagger)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
