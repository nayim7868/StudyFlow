import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

interface Answer {
  id: string;
  bodyMarkdown: string;
  bodyText: string;
  isAccepted: boolean;
  createdAt: string;
  score: number;
}

interface PostData {
  post: {
    id: string;
    title: string;
    bodyMarkdown: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    score: number;
  };
  answers: Answer[];
  room: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function Post() {
  const { id } = useParams<{ id: string }>();
  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [formData, setFormData] = useState({
    bodyMarkdown: '',
  });

  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    if (!id) return;

    setLoading(true);
    const response = await api.getPost(id);
    if (response.error) {
      setError(response.error);
    } else {
      setPostData(response.data);
      // Initialize scores
      if (response.data) {
        setScores({
          [response.data.post.id]: response.data.post.score,
          ...Object.fromEntries(
            response.data.answers.map(answer => [answer.id, answer.score])
          )
        });
      }
    }
    setLoading(false);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.bodyMarkdown.trim()) {
      setError('Answer content is required');
      return;
    }

    if (!id) {
      setError('Post ID not available');
      return;
    }

    const response = await api.createAnswer({
      postId: id,
      bodyMarkdown: formData.bodyMarkdown.trim(),
    });

    if (response.error) {
      setError(response.error);
    } else {
      setMessage('Answer posted successfully!');
      setFormData({ bodyMarkdown: '' });
      loadPost();
    }
  };

  const handleVote = async (entityType: 'post' | 'answer', entityId: string, value: -1 | 1) => {
    if (voting.has(entityId)) return;

    setVoting(prev => new Set(prev).add(entityId));

    // Optimistically update score
    setScores(prev => ({
      ...prev,
      [entityId]: (prev[entityId] || 0) + value
    }));

    const response = await api.createVote({
      entityType,
      entityId,
      value,
    }, '00000000-0000-0000-0000-000000000001');

    setVoting(prev => {
      const newSet = new Set(prev);
      newSet.delete(entityId);
      return newSet;
    });

    if (response.error) {
      setError(response.error);
      // Revert optimistic update
      setScores(prev => ({
        ...prev,
        [entityId]: (prev[entityId] || 0) - value
      }));
    } else if (response.data) {
      // Update with actual score from server
      setScores(prev => ({
        ...prev,
        [entityId]: response.data.score
      }));
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading post...</div>;
  }

  if (error && !postData) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Error: {error}</p>
        <Link to="/">← Back to Rooms</Link>
      </div>
    );
  }

  if (!postData) {
    return <div style={{ padding: '20px' }}>Post not found</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Back to Rooms</Link>
        {postData.room && (
          <span style={{ margin: '0 10px', color: '#666' }}>•</span>
        )}
        {postData.room && (
          <Link
            to={`/r/${postData.room.slug}`}
            style={{ color: '#007bff', textDecoration: 'none' }}
          >
            {postData.room.name}
          </Link>
        )}
      </div>

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
        <h1>{postData.post.title}</h1>
        <div style={{
          background: '#f9f9f9',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '15px'
        }}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {postData.post.bodyMarkdown}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => handleVote('post', postData.post.id, 1)}
            disabled={voting.has(postData.post.id)}
            style={{
              padding: '5px 10px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: voting.has(postData.post.id) ? 'not-allowed' : 'pointer',
              opacity: voting.has(postData.post.id) ? 0.6 : 1
            }}
          >
            👍 Upvote
          </button>
          <button
            onClick={() => handleVote('post', postData.post.id, -1)}
            disabled={voting.has(postData.post.id)}
            style={{
              padding: '5px 10px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: voting.has(postData.post.id) ? 'not-allowed' : 'pointer',
              opacity: voting.has(postData.post.id) ? 0.6 : 1
            }}
          >
            👎 Downvote
          </button>
          <span style={{
            background: (scores[postData.post.id] || 0) >= 0 ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {(scores[postData.post.id] || 0) > 0 ? '+' : ''}{scores[postData.post.id] || 0}
          </span>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Status: {postData.post.status} • {new Date(postData.post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Post an Answer</h2>
        <form onSubmit={handleAnswerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <textarea
            placeholder="Your answer (Markdown supported)"
            value={formData.bodyMarkdown}
            onChange={(e) => setFormData({ ...formData, bodyMarkdown: e.target.value })}
            rows={4}
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
            Post Answer
          </button>
        </form>
      </div>

      <div>
        <h2>Answers ({postData.answers.length})</h2>
        {postData.answers.length === 0 ? (
          <p>No answers yet. Be the first to answer!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {postData.answers.map((answer) => (
              <div
                key={answer.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  background: answer.isAccepted ? '#f0f8ff' : '#f9f9f9',
                  borderLeft: answer.isAccepted ? '4px solid #007bff' : '4px solid #ddd'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '10px' }}>
                  {answer.bodyMarkdown}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleVote('answer', answer.id, 1)}
                    disabled={voting.has(answer.id)}
                    style={{
                      padding: '5px 10px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: voting.has(answer.id) ? 'not-allowed' : 'pointer',
                      opacity: voting.has(answer.id) ? 0.6 : 1
                    }}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleVote('answer', answer.id, -1)}
                    disabled={voting.has(answer.id)}
                    style={{
                      padding: '5px 10px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: voting.has(answer.id) ? 'not-allowed' : 'pointer',
                      opacity: voting.has(answer.id) ? 0.6 : 1
                    }}
                  >
                    👎
                  </button>
                  <span style={{
                    background: (scores[answer.id] || 0) >= 0 ? '#28a745' : '#dc3545',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {(scores[answer.id] || 0) > 0 ? '+' : ''}{scores[answer.id] || 0}
                  </span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {answer.isAccepted && '✓ Accepted • '}
                    {new Date(answer.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
