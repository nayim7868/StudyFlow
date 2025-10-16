import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Rooms from './pages/Rooms';
import Room from './pages/Room';
import Post from './pages/Post';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              <h1 style={{ margin: 0 }}>StudyFlow</h1>
            </Link>
            <nav style={{ display: 'flex', gap: '15px' }}>
              <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                Rooms
              </Link>
              <a
                href="http://localhost:4000/docs"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'white', textDecoration: 'none' }}
              >
                API Docs
              </a>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Rooms />} />
            <Route path="/r/:slug" element={<Room />} />
            <Route path="/p/:id" element={<Post />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
