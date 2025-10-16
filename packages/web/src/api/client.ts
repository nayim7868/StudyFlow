const RAW = import.meta.env?.VITE_API_URL ?? 'http://localhost:4000';
const BASE_URL = RAW.replace(/\/+$/, ''); // strip trailing slash

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
      return { error: (json && (json.error || json.message)) || `HTTP ${res.status}` };
    }
    return { data: json as T };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Network error' };
  }
}

export const api = {
  getRooms: () => apiFetch('/rooms'),
  getRoom: (slug: string) => apiFetch(`/rooms/${slug}`),
  createRoom: (data: { name: string; slug: string }) =>
    apiFetch('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  getPost: (id: string) => apiFetch(`/posts/${id}`),
  createPost: (data: { roomId: string; title: string; bodyMarkdown: string }) =>
    apiFetch('/posts', { method: 'POST', body: JSON.stringify(data) }),
  createAnswer: (data: { postId: string; bodyMarkdown: string }) =>
    apiFetch('/answers', { method: 'POST', body: JSON.stringify(data) }),
  createVote: (
    data: { entityType: 'post' | 'answer'; entityId: string; value: -1 | 1 },
    userId?: string
  ) =>
    apiFetch('/votes', {
      method: 'POST',
      headers: userId ? { 'X-Demo-User': userId } : {},
      body: JSON.stringify(data),
    }),
};
