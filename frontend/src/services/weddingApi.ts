import { Wedding, Household, Table, PublicRsvpDetails } from '@/types/wedding';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5251/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${res.statusText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const weddingApi = {
  getWeddings: () => request<Wedding[]>('/weddings'),

  getHouseholdsByWedding: (weddingId: string) =>
    request<Household[]>(`/households/wedding/${weddingId}`),

  createHousehold: (weddingId: number, householdName: string) =>
    request('/households', {
      method: 'POST',
      body: JSON.stringify({ weddingId, householdName }),
    }),

  addGuest: (payload: {
    householdId: number;
    firstName: string;
    lastName: string;
    mealPreference: string;
    dietaryNotes: string;
  }) =>
    request('/guests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getTablesByWedding: (weddingId: string) =>
    request<Table[]>(`/tables/wedding/${weddingId}`),

  createTable: (payload: {
    weddingId: number;
    tableName: string;
    capacity: number;
    shape: string;
  }) =>
    request('/tables', {
      method: 'POST',
      body: JSON.stringify({ ...payload, posX: 0, posY: 0 }),
    }),

  assignSeat: (seatId: number, guestId: number) =>
    request('/seating/assign', {
      method: 'POST',
      body: JSON.stringify({ seatId, guestId }),
    }),

  unassignSeat: (seatId: number) =>
    request(`/seating/unassign/${seatId}`, {
      method: 'POST',
    }),

  getRsvpByToken: (token: string) =>
    request<PublicRsvpDetails>(`/rsvp/${encodeURIComponent(token)}`),

  submitRsvp: (
    token: string,
    payload: {
      rsvpStatus: string;
      guests: { id: number; mealPreference: string; dietaryNotes?: string }[];
    }
  ) =>
    request<{ message: string; rsvpStatus: string }>(`/rsvp/${encodeURIComponent(token)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),  
};