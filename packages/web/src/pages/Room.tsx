import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

interface Post {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface RoomData {
  room: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
  };
  posts: Post[];
}

export default function Room() {
  const { slug } = useParams<{ slug: string }>();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    bodyMarkdown: '',
  });

  useEffect(() => {
    if (slug) {
      loadRoom();
    }
  }, [slug]);

  const loadRoom = async () => {
    if (!slug) return;

    setLoading(true);
    const response = await api.getRoom(slug);
    if (response.error) {
      setError(response.error);
    } else {
      setRoomData(response.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.title.trim() || !formData.bodyMarkdown.trim()) {
      setError('Title and content are required');
      return;
    }

    if (!roomData?.room.id) {
      setError('Room ID not available');
      return;
    }

    const response = await api.createPost({
      roomId: roomData.room.id,
      title: formData.title.trim(),
      bodyMarkdown: formData.bodyMarkdown.trim(),
    });

    if (response.error) {
      setError(response.error);
    } else {
      setMessage('Post created successfully!');
      setFormData({ title: '', bodyMarkdown: '' });
      loadRoom();
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading room...</div>;
  }

  if (error && !roomData) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Error: {error}</p>
        <Link to="/">← Back to Rooms</Link>
      </div>
    );
  }

  if (!roomData) {
    return <div style={{ padding: '20px' }}>Room not found</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Back to Rooms</Link>
      </div>

      <h1>{roomData.room.name}</h1>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c00',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          background: '#efe',
          color: '#060',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h2>Create New Post</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Post title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <textarea
            placeholder="Post content (Markdown supported)"
            value={formData.bodyMarkdown}
            onChange={(e) => setFormData({ ...formData, bodyMarkdown: e.target.value })}
            rows={6}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              alignSelf: 'flex-start'
            }}
          >
            Create Post
          </button>
        </form>
      </div>

      <div>
        <h2>Posts ({roomData.posts.length})</h2>
        {roomData.posts.length === 0 ? (
          <p>No posts yet. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {roomData.posts.map((post) => (
              <div
                key={post.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  background: '#f9f9f9'
                }}
              >
                <h3 style={{ margin: '0 0 5px 0' }}>
                  <Link
                    to={`/p/${post.id}`}
                    style={{ color: '#007bff', textDecoration: 'none' }}
                  >
                    {post.title}
                  </Link>
                </h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  Status: {post.status} • Created: {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
