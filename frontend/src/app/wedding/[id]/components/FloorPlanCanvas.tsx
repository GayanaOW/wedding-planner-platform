'use client';

import { useState, useRef } from 'react';
import { Move, UserPlus, X } from 'lucide-react';
import { Table, Seat, GuestWithHousehold } from '@/types/wedding';
import { weddingApi } from '@/services/weddingApi';

interface FloorPlanCanvasProps {
  tables: Table[];
  allGuests: GuestWithHousehold[];
  onSelectEmptySeat: (seat: Seat, tableName: string) => void;
  onUnassignSeat: (seatId: number) => void;
  onRefresh: () => void;
}

export default function FloorPlanCanvas({
  tables,
  allGuests,
  onSelectEmptySeat,
  onUnassignSeat,
  onRefresh,
}: FloorPlanCanvasProps) {
  // Local optimistic coordinates while dragging
  const [positions, setPositions] = useState<Record<number, { x: number; y: number }>>(() => {
    const initial: Record<number, { x: number; y: number }> = {};
    tables.forEach((t, idx) => {
      // If posX/posY are both 0 (newly created), stagger them neatly on the canvas
      const hasSavedPos = t.posX !== 0 || t.posY !== 0;
      initial[t.id] = hasSavedPos
        ? { x: t.posX, y: t.posY }
        : { x: 80 + (idx % 3) * 320, y: 80 + Math.floor(idx / 3) * 300 };
    });
    return initial;
  });

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent, tableId: number) => {
    // Prevent dragging when clicking a seat button
    if ((e.target as HTMLElement).closest('button')) return;

    const currentPos = positions[tableId] || { x: 100, y: 100 };
    dragOffset.current = {
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    };
    setDraggingId(tableId);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingId === null || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const rawX = e.clientX - dragOffset.current.x;
    const rawY = e.clientY - dragOffset.current.y;

    // Keep tables inside canvas bounds
    const clampedX = Math.max(20, Math.min(rawX, canvasRect.width - 260));
    const clampedY = Math.max(20, Math.min(rawY, canvasRect.height - 260));

    setPositions((prev) => ({
      ...prev,
      [draggingId]: { x: clampedX, y: clampedY },
    }));
  };

  const handlePointerUp = async (e: React.PointerEvent) => {
    if (draggingId === null) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const finalPos = positions[draggingId];
    const tableId = draggingId;
    setDraggingId(null);

    if (finalPos) {
      try {
        await weddingApi.updateTablePosition(tableId, finalPos.x, finalPos.y);
        onRefresh();
      } catch (err) {
        console.error('Failed to save table position', err);
      }
    }
  };

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
        <span className="inline-flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-[#D4AF37]" />
          Drag any table to arrange your reception floor plan. Positions save automatically.
        </span>
        <span>Click any seat node to assign or unassign a guest</span>
      </div>

      {/* Scrollable Architectural Floor Canvas */}
      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-[720px] rounded-3xl border border-[#D4AF37]/25 bg-[#FAF9F6] overflow-auto shadow-inner select-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(212, 175, 55, 0.22) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {tables.map((table) => {
          const pos = positions[table.id] || { x: 100, y: 100 };
          const sortedSeats = [...table.seats].sort((a, b) => a.seatNumber - b.seatNumber);
          const occupiedCount = sortedSeats.filter((s) => s.guestId !== null).length;
          const isDragging = draggingId === table.id;
          const isRound = table.shape === 'round';

          return (
            <div
              key={table.id}
              onPointerDown={(e) => handlePointerDown(e, table.id)}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
              }}
              className={`absolute top-0 left-0 cursor-grab active:cursor-grabbing transition-shadow ${
                isDragging ? 'z-30 shadow-2xl scale-[1.02]' : 'z-10'
              }`}
            >
              {isRound ? (
                /* ROUND TABLE GEOMETRY */
                <div className="relative w-60 h-60 flex items-center justify-center">
                  {/* Center Table Surface */}
                  <div className="w-32 h-32 rounded-full bg-white border-2 border-[#D4AF37]/50 shadow-md flex flex-col items-center justify-center text-center p-3">
                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                      {occupiedCount}/{table.capacity} Seated
                    </span>
                    <h4 className="font-serif text-base font-medium text-[#1C1C1E] leading-tight mt-0.5 line-clamp-2">
                      {table.tableName}
                    </h4>
                  </div>

                  {/* Radial Seats around Circumference */}
                  {sortedSeats.map((seat, idx) => {
                    const angle = (idx / sortedSeats.length) * 2 * Math.PI - Math.PI / 2;
                    const radius = 94; // Distance from center in px
                    const seatX = Math.cos(angle) * radius;
                    const seatY = Math.sin(angle) * radius;
                    const assignedGuest =
                      seat.guest || allGuests.find((g) => g.id === seat.guestId);

                    return (
                      <div
                        key={seat.id}
                        style={{
                          transform: `translate(${seatX}px, ${seatY}px)`,
                        }}
                        className="absolute group"
                      >
                        {assignedGuest ? (
                          <button
                            type="button"
                            onClick={() => onUnassignSeat(seat.id)}
                            title={`${assignedGuest.firstName} ${assignedGuest.lastName} (${assignedGuest.mealPreference}) — Click to unassign`}
                            className="w-10 h-10 rounded-full bg-[#1C1C1E] text-white border-2 border-[#D4AF37] text-xs font-semibold flex items-center justify-center shadow-sm hover:bg-rose-600 hover:border-rose-600 transition relative"
                          >
                            <span className="group-hover:hidden">
                              {getInitials(assignedGuest.firstName, assignedGuest.lastName)}
                            </span>
                            <X className="w-3.5 h-3.5 hidden group-hover:block" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectEmptySeat(seat, table.tableName)}
                            title={`Seat ${seat.seatNumber} (Empty) — Click to assign`}
                            className="w-10 h-10 rounded-full bg-white/90 border border-dashed border-neutral-400 text-neutral-400 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-medium flex items-center justify-center shadow-2xs transition"
                          >
                            <span className="group-hover:hidden">{seat.seatNumber}</span>
                            <UserPlus className="w-3.5 h-3.5 hidden group-hover:block" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* RECTANGULAR / HEAD TABLE GEOMETRY */
                <div className="flex flex-col items-center gap-2.5 p-2">
                  {/* Top Row of Seats */}
                  <div className="flex items-center gap-2.5">
                    {sortedSeats
                      .slice(0, table.shape === 'head' ? sortedSeats.length : Math.ceil(sortedSeats.length / 2))
                      .map((seat) => {
                        const assignedGuest =
                          seat.guest || allGuests.find((g) => g.id === seat.guestId);
                        return assignedGuest ? (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => onUnassignSeat(seat.id)}
                            title={`${assignedGuest.firstName} ${assignedGuest.lastName} — Click to unassign`}
                            className="group w-10 h-10 rounded-full bg-[#1C1C1E] text-white border-2 border-[#D4AF37] text-xs font-semibold flex items-center justify-center shadow-sm hover:bg-rose-600 hover:border-rose-600 transition"
                          >
                            <span className="group-hover:hidden">
                              {getInitials(assignedGuest.firstName, assignedGuest.lastName)}
                            </span>
                            <X className="w-3.5 h-3.5 hidden group-hover:block" />
                          </button>
                        ) : (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => onSelectEmptySeat(seat, table.tableName)}
                            title={`Seat ${seat.seatNumber} — Click to assign`}
                            className="group w-10 h-10 rounded-full bg-white/90 border border-dashed border-neutral-400 text-neutral-400 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-medium flex items-center justify-center transition"
                          >
                            <span className="group-hover:hidden">{seat.seatNumber}</span>
                            <UserPlus className="w-3.5 h-3.5 hidden group-hover:block" />
                          </button>
                        );
                      })}
                  </div>

                  {/* Rectangular Table Body */}
                  <div className="min-w-[210px] px-6 py-4 rounded-2xl bg-white border-2 border-[#D4AF37]/50 shadow-md text-center">
                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold block">
                      {table.shape} • {occupiedCount}/{table.capacity} Seated
                    </span>
                    <h4 className="font-serif text-lg font-medium text-[#1C1C1E]">
                      {table.tableName}
                    </h4>
                  </div>

                  {/* Bottom Row of Seats (Omitted for single-sided Head/Sweetheart tables) */}
                  {table.shape !== 'head' && (
                    <div className="flex items-center gap-2.5">
                      {sortedSeats.slice(Math.ceil(sortedSeats.length / 2)).map((seat) => {
                        const assignedGuest =
                          seat.guest || allGuests.find((g) => g.id === seat.guestId);
                        return assignedGuest ? (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => onUnassignSeat(seat.id)}
                            title={`${assignedGuest.firstName} ${assignedGuest.lastName} — Click to unassign`}
                            className="group w-10 h-10 rounded-full bg-[#1C1C1E] text-white border-2 border-[#D4AF37] text-xs font-semibold flex items-center justify-center shadow-sm hover:bg-rose-600 hover:border-rose-600 transition"
                          >
                            <span className="group-hover:hidden">
                              {getInitials(assignedGuest.firstName, assignedGuest.lastName)}
                            </span>
                            <X className="w-3.5 h-3.5 hidden group-hover:block" />
                          </button>
                        ) : (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => onSelectEmptySeat(seat, table.tableName)}
                            title={`Seat ${seat.seatNumber} — Click to assign`}
                            className="group w-10 h-10 rounded-full bg-white/90 border border-dashed border-neutral-400 text-neutral-400 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-medium flex items-center justify-center transition"
                          >
                            <span className="group-hover:hidden">{seat.seatNumber}</span>
                            <UserPlus className="w-3.5 h-3.5 hidden group-hover:block" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}