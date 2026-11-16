'use client';

import { useEffect, useState } from 'react';
import { Calendar, MapPin, Plus, ArrowRight, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Wedding {
  id: number;
  plannerId: number;
  coupleNames: string;
  weddingDate: string;
  venueName?: string;
}

export default function DashboardPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state for creating a new wedding workspace
  const [isOpen, setIsOpen] = useState(false);
  const [coupleNames, setCoupleNames] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [venueName, setVenueName] = useState('');
  const router = useRouter();

  const fetchWeddings = async () => {
    try {
      const res = await fetch('http://localhost:5251/api/weddings');
      if (!res.ok) throw new Error('Failed to fetch weddings from backend');
      const data = await res.json();
      setWeddings(data);
    } catch (err: any) {
      setError(err.message || 'Is your ASP.NET backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeddings();
  }, []);

  const handleCreateWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5251/api/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plannerId: 1, // Default mock planner ID for now
          coupleNames,
          weddingDate,
          venueName,
        }),
      });

      if (!res.ok) throw new Error('Failed to create wedding');
      
      setCoupleNames('');
      setWeddingDate('');
      setVenueName('');
      setIsOpen(false);
      fetchWeddings(); // Refresh list
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#D4AF37]/20 pb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2 block">
            Atelier Management Portal
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-[#1C1C1E]">
            Wedding Workspaces
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="mt-6 md:mt-0 inline-flex items-center gap-2 bg-[#1C1C1E] text-white px-6 py-3 rounded-full text-sm tracking-wide font-medium hover:bg-[#D4AF37] transition-all duration-300 shadow-lg shadow-black/5"
        >
          <Plus className="w-4 h-4" /> Create New Wedding
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="text-center py-20 text-neutral-400 font-serif italic text-lg">
          Curating your workspaces...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm mb-8">
          <span className="font-semibold">Connection Notice:</span> {error}. Ensure your ASP.NET backend is running on port 5251 with CORS enabled.
        </div>
      )}

      {!loading && !error && weddings.length === 0 && (
        <div className="text-center py-24 glass-card rounded-2xl max-w-xl mx-auto">
          <Heart className="w-10 h-10 mx-auto text-[#D4AF37] mb-4 stroke-1" />
          <h3 className="font-serif text-2xl mb-2">No Active Workspaces</h3>
          <p className="text-neutral-500 text-sm mb-6">Begin by creating your first wedding project workspace.</p>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#c29e2f] transition"
          >
            Create Workspace
          </button>
        </div>
      )}

      {/* Wedding Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {weddings.map((wedding) => (
          <div
            key={wedding.id}
            className="glass-card rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-3">
                <span>Workspace #{wedding.id}</span>
              </div>
              <h2 className="font-serif text-3xl font-normal text-[#1C1C1E] mb-6 group-hover:text-[#D4AF37] transition-colors">
                {wedding.coupleNames}
              </h2>

              <div className="space-y-3 text-sm text-neutral-600 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>{wedding.weddingDate}</span>
                </div>
                {wedding.venueName && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    <span>{wedding.venueName}</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => router.push(`/wedding/${wedding.id}`)}
              className="inline-flex items-center justify-between w-full pt-4 border-t border-neutral-100 text-sm font-medium text-[#1C1C1E] group-hover:text-[#D4AF37] transition-colors"
            >
              <span>Open Atelier Workspace</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Simple Modal for Creation */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-neutral-100 animate-in fade-in zoom-in duration-200">
            <h2 className="font-serif text-3xl mb-2 text-[#1C1C1E]">New Wedding Workspace</h2>
            <p className="text-neutral-500 text-sm mb-6">Enter the primary details for the couple's event.</p>

            <form onSubmit={handleCreateWedding} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">Couple Names</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor & Julian"
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">Wedding Date</label>
                <input
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">Venue Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. The Glasshouse, Santorini"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D4AF37] transition"
                >
                  Save Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}