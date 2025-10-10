export function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>StudyFlow</h1>
      <p>Welcome. This is a minimal shell.</p>
      <ul>
        <li>
          <a href="http://localhost:4000/healthz" target="_blank" rel="noreferrer">API health</a>
        </li>
        <li>
          <a href="http://localhost:4000/docs" target="_blank" rel="noreferrer">API docs</a>
        </li>
      </ul>
    </main>
  );
}
