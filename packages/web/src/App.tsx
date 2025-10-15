import { useState } from 'react';
import './App.css';

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [readyStatus, setReadyStatus] = useState<string>('');
  const [roomData, setRoomData] = useState<any>(null);
  const [postData, setPostData] = useState<any>(null);

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
      setReadyStatus(`Ready: ${data.ok ? 'true' : 'false'} (${data.timestamp})`);
    } catch (error) {
      setReadyStatus('Readiness check failed');
    }
  };

  const createRoom = async () => {
    try {
      const response = await fetch('http://localhost:4000/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Room',
          slug: 'test-room-' + Date.now(),
        }),
      });
      const data = await response.json();
      setRoomData(data);
    } catch (error) {
      setRoomData({ error: 'Failed to create room' });
    }
  };

  const getRoom = async () => {
    try {
      const response = await fetch('http://localhost:4000/rooms/intro-to-algos');
      const data = await response.json();
      setRoomData(data);
    } catch (error) {
      setRoomData({ error: 'Failed to get room' });
    }
  };

  const createPost = async () => {
    if (!roomData?.room?.id) {
      setPostData({ error: 'No room ID available' });
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomData.room.id,
          title: 'Test Post ' + Date.now(),
          bodyMarkdown: 'This is a **test post** with some *markdown* content.',
        }),
      });
      const data = await response.json();
      setPostData(data);
    } catch (error) {
      setPostData({ error: 'Failed to create post' });
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

        <div className="api-tests">
          <h3>API Tests</h3>
          <div className="test-buttons">
            <button onClick={createRoom} className="button">
              Create Room
            </button>
            <button onClick={getRoom} className="button">
              Get Demo Room
            </button>
            <button onClick={createPost} className="button">
              Create Post
            </button>
          </div>

          {roomData && (
            <div className="status">
              <strong>Room Data:</strong>
              <pre>{JSON.stringify(roomData, null, 2)}</pre>
            </div>
          )}

          {postData && (
            <div className="status">
              <strong>Post Data:</strong>
              <pre>{JSON.stringify(postData, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
