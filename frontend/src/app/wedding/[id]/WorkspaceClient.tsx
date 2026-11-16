'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft, Plus, LayoutGrid } from 'lucide-react';
import { Wedding, Household, Table } from '@/types/wedding';
import { weddingApi } from '@/services/weddingApi';
import GuestRosterTab from './components/GuestRosterTab';
import SeatingChartTab from './components/SeatingChartTab';

export default function WorkspaceClient({ weddingId }: { weddingId: string }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'guests' | 'seating'>('guests');
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const [isHouseholdModalOpen, setIsHouseholdModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [weddingsData, householdsData, tablesData] = await Promise.all([
        weddingApi.getWeddings(),
        weddingApi.getHouseholdsByWedding(weddingId),
        weddingApi.getTablesByWedding(weddingId),
      ]);

      const currentWedding = weddingsData.find((w) => w.id.toString() === weddingId);
      setWedding(currentWedding || null);
      setHouseholds(householdsData);
      setTables(tablesData);
    } catch (err) {
      console.error('Failed to load workspace data', err);
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    if (weddingId) fetchData();
  }, [weddingId, fetchData]);

  const allGuests = households.flatMap((h) =>
    h.guests.map((g) => ({ ...g, householdName: h.householdName }))
  );

  if (loading) {
    return <div className="text-center py-24 font-serif text-neutral-400">Loading workspace...</div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <button
        onClick={() => router.push('/')}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-[#1C1C1E] mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Workspaces
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-[#D4AF37]/20 pb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2 block">
            Active Wedding Atelier
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-[#1C1C1E]">
            {wedding ? wedding.coupleNames : 'Wedding Workspace'}
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            {wedding?.weddingDate} {wedding?.venueName ? `• ${wedding.venueName}` : ''}
          </p>
        </div>

        <div className="mt-6 md:mt-0 flex items-center gap-3">
          {activeTab === 'guests' ? (
            <button
              onClick={() => setIsHouseholdModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#1C1C1E] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#D4AF37] transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Household Group
            </button>
          ) : (
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#1C1C1E] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#D4AF37] transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Reception Table
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-10 border-b border-neutral-200/80">
        <button
          onClick={() => setActiveTab('guests')}
          className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
            activeTab === 'guests'
              ? 'border-[#D4AF37] text-[#1C1C1E]'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Guest Roster</span>
          <span className="ml-1 text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
            {allGuests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('seating')}
          className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
            activeTab === 'seating'
              ? 'border-[#D4AF37] text-[#1C1C1E]'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Seating Chart</span>
          <span className="ml-1 text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
            {tables.length} Tables
          </span>
        </button>
      </div>

      {activeTab === 'guests' ? (
        <GuestRosterTab
          weddingId={Number(weddingId)}
          households={households}
          isHouseholdModalOpen={isHouseholdModalOpen}
          setIsHouseholdModalOpen={setIsHouseholdModalOpen}
          onRefresh={fetchData}
        />
      ) : (
        <SeatingChartTab
          weddingId={Number(weddingId)}
          tables={tables}
          allGuests={allGuests}
          isTableModalOpen={isTableModalOpen}
          setIsTableModalOpen={setIsTableModalOpen}
          onRefresh={fetchData}
        />
      )}
    </main>
  );
}