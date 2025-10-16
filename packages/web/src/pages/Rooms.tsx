import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

interface Room {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    const response = await api.getRooms();
    if (response.error) {
      setError(response.error);
    } else {
      setRooms(response.data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('Name and slug are required');
      return;
    }

    const response = await api.createRoom({
      name: formData.name.trim(),
      slug: formData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    });

    if (response.error) {
      setError(response.error);
    } else {
      setMessage('Room created successfully!');
      setFormData({ name: '', slug: '' });
      loadRooms();
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading rooms...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>StudyFlow Rooms</h1>

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
        <h2>Create New Room</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Room name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="text"
            placeholder="Room slug (e.g., my-room)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create Room
          </button>
        </form>
      </div>

      <div>
        <h2>All Rooms</h2>
        {rooms.length === 0 ? (
          <p>No rooms found. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rooms.map((room) => (
              <div
                key={room.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  background: '#f9f9f9'
                }}
              >
                <h3 style={{ margin: '0 0 5px 0' }}>
                  <Link
                    to={`/r/${room.slug}`}
                    style={{ color: '#007bff', textDecoration: 'none' }}
                  >
                    {room.name}
                  </Link>
                </h3>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  Slug: {room.slug} • Created: {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
