'use client';

import { useState } from 'react';
import { Armchair, UserPlus, UserMinus } from 'lucide-react';
import { Table, Seat, GuestWithHousehold } from '@/types/wedding';
import { weddingApi } from '@/services/weddingApi';

interface SeatingChartTabProps {
  weddingId: number;
  tables: Table[];
  allGuests: GuestWithHousehold[];
  isTableModalOpen: boolean;
  setIsTableModalOpen: (open: boolean) => void;
  onRefresh: () => void;
}

export default function SeatingChartTab({
  weddingId,
  tables,
  allGuests,
  isTableModalOpen,
  setIsTableModalOpen,
  onRefresh,
}: SeatingChartTabProps) {
  // Create table modal local state
  const [tableName, setTableName] = useState('');
  const [tableCapacity, setTableCapacity] = useState(8);
  const [tableShape, setTableShape] = useState('round');

  // Assign seat modal local state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<{ seat: Seat; tableName: string } | null>(null);
  const [selectedGuestToAssign, setSelectedGuestToAssign] = useState<string>('');

  const seatedGuestIds = new Set(
    tables.flatMap((t) => t.seats.map((s) => s.guestId).filter((id): id is number => id !== null))
  );
  const unseatedGuests = allGuests.filter((g) => !seatedGuestIds.has(g.id));

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await weddingApi.createTable({
        weddingId,
        tableName,
        capacity: Number(tableCapacity),
        shape: tableShape,
      });
      setTableName('');
      setTableCapacity(8);
      setTableShape('round');
      setIsTableModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat || !selectedGuestToAssign) return;

    try {
      await weddingApi.assignSeat(selectedSeat.seat.id, Number(selectedGuestToAssign));
      setIsAssignModalOpen(false);
      setSelectedSeat(null);
      setSelectedGuestToAssign('');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUnassignSeat = async (seatId: number) => {
    try {
      await weddingApi.unassignSeat(seatId);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Bar */}
      <div className="glass-card rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="font-serif text-2xl text-[#1C1C1E]">Reception Floor & Table Plan</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Assign guests to individual seats across your reception tables.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-400 block">Seated</span>
            <span className="font-serif text-2xl font-medium text-[#1C1C1E]">
              {seatedGuestIds.size}{' '}
              <span className="text-sm font-sans text-neutral-400">/ {allGuests.length}</span>
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-400 block">Unseated</span>
            <span className="font-serif text-2xl font-medium text-[#D4AF37]">
              {unseatedGuests.length}
            </span>
          </div>
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl">
          <Armchair className="w-10 h-10 mx-auto text-[#D4AF37] mb-3 stroke-1" />
          <h3 className="font-serif text-2xl mb-1">No Reception Tables Created</h3>
          <p className="text-neutral-500 text-sm mb-5">
            Create your first table to auto-generate individual seats for your guests.
          </p>
          <button
            onClick={() => setIsTableModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-full text-xs font-medium hover:bg-[#c29e2f] transition"
          >
            Create First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => {
            const sortedSeats = [...table.seats].sort((a, b) => a.seatNumber - b.seatNumber);
            const occupiedCount = sortedSeats.filter((s) => s.guestId !== null).length;

            return (
              <div
                key={table.id}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-start justify-between border-b border-neutral-100 pb-4 mb-5">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                        {table.shape} Table
                      </span>
                      <h3 className="font-serif text-2xl font-medium text-[#1C1C1E] mt-0.5">
                        {table.tableName}
                      </h3>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#D4AF37]/30 text-[#1C1C1E]">
                      {occupiedCount} / {table.capacity} Seated
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {sortedSeats.map((seat) => {
                      const assignedGuest =
                        seat.guest || allGuests.find((g) => g.id === seat.guestId);

                      return (
                        <div
                          key={seat.id}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition ${
                            assignedGuest
                              ? 'bg-white border-neutral-200/80 shadow-2xs'
                              : 'bg-[#FAF9F6]/60 border-dashed border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-semibold flex items-center justify-center shrink-0">
                              {seat.seatNumber}
                            </span>
                            {assignedGuest ? (
                              <div className="truncate">
                                <p className="font-medium text-[#1C1C1E] truncate">
                                  {assignedGuest.firstName} {assignedGuest.lastName}
                                </p>
                                <p className="text-[11px] text-neutral-400 capitalize">
                                  {assignedGuest.mealPreference}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400 italic">Empty Seat</span>
                            )}
                          </div>

                          {assignedGuest ? (
                            <button
                              onClick={() => handleUnassignSeat(seat.id)}
                              title="Unassign guest"
                              className="text-neutral-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition shrink-0"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedSeat({ seat, tableName: table.tableName });
                                setSelectedGuestToAssign(
                                  unseatedGuests.length > 0 ? unseatedGuests[0].id.toString() : ''
                                );
                                setIsAssignModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:text-[#1C1C1E] px-2.5 py-1 rounded-full hover:bg-[#D4AF37]/10 transition shrink-0"
                            >
                              <UserPlus className="w-3.5 h-3.5" /> Assign
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Table Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-neutral-100">
            <h2 className="font-serif text-3xl mb-2 text-[#1C1C1E]">Add Reception Table</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Individual seat slots will be generated automatically based on capacity.
            </p>
            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                  Table Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 1 — Bridal Party"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={tableCapacity}
                    onChange={(e) => setTableCapacity(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                    Table Shape
                  </label>
                  <select
                    value={tableShape}
                    onChange={(e) => setTableShape(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm bg-white"
                  >
                    <option value="round">Round</option>
                    <option value="rectangular">Rectangular</option>
                    <option value="head">Head / Sweetheart</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D4AF37] transition"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Guest Modal */}
      {isAssignModalOpen && selectedSeat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-neutral-100">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              {selectedSeat.tableName} • Seat {selectedSeat.seat.seatNumber}
            </span>
            <h2 className="font-serif text-3xl mt-1 mb-2 text-[#1C1C1E]">Assign Guest</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Select an unseated guest from your wedding roster.
            </p>
            {unseatedGuests.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-neutral-500 mb-6">
                  All registered guests are already assigned to seats, or no guests have been added yet.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D4AF37] transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssignGuest} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                    Unseated Guests ({unseatedGuests.length} available)
                  </label>
                  <select
                    value={selectedGuestToAssign}
                    onChange={(e) => setSelectedGuestToAssign(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm bg-white"
                  >
                    {unseatedGuests.map((guest) => (
                      <option key={guest.id} value={guest.id}>
                        {guest.firstName} {guest.lastName} ({guest.householdName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D4AF37] transition"
                  >
                    Confirm Seat
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}