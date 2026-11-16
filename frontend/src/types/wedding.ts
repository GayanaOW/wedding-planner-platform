export interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  mealPreference: string;
  dietaryNotes?: string;
}

export interface GuestWithHousehold extends Guest {
  householdName: string;
}

export interface Household {
  id: number;
  householdName: string;
  rsvpStatus: string;
  token: string;
  guests: Guest[];
}

export interface Seat {
  id: number;
  tableId: number;
  seatNumber: number;
  guestId: number | null;
  guest?: Guest | null;
}

export interface Table {
  id: number;
  weddingId: number;
  tableName: string;
  capacity: number;
  shape: string;
  posX: number;
  posY: number;
  seats: Seat[];
}

export interface Wedding {
  id: number;
  coupleNames: string;
  weddingDate: string;
  venueName?: string;
}