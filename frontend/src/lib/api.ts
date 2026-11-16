const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await `${API_BASE_URL}${endpoint}` as unknown as string;
  const response = await fetch(res, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  // Handle empty responses gracefully
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}