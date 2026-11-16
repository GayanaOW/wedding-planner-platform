'use client';

import { useState } from 'react';
import {
  Users,
  Utensils,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Household } from '@/types/wedding';
import { weddingApi } from '@/services/weddingApi';

interface GuestRosterTabProps {
  weddingId: number;
  households: Household[];
  isHouseholdModalOpen: boolean;
  setIsHouseholdModalOpen: (open: boolean) => void;
  onRefresh: () => void;
}

export default function GuestRosterTab({
  weddingId,
  households,
  isHouseholdModalOpen,
  setIsHouseholdModalOpen,
  onRefresh,
}: GuestRosterTabProps) {
  const [expandedHousehold, setExpandedHousehold] = useState<number | null>(null);
  const [newHouseholdName, setNewHouseholdName] = useState('');

  // Guest modal local state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mealPreference, setMealPreference] = useState('chicken');
  const [dietaryNotes, setDietaryNotes] = useState('');

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await weddingApi.createHousehold(weddingId, newHouseholdName);
      setNewHouseholdName('');
      setIsHouseholdModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouseholdId) return;

    try {
      await weddingApi.addGuest({
        householdId: selectedHouseholdId,
        firstName,
        lastName,
        mealPreference,
        dietaryNotes,
      });
      setFirstName('');
      setLastName('');
      setMealPreference('chicken');
      setDietaryNotes('');
      setIsGuestModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-[#1C1C1E]">Guest Roster & Households</h2>
        <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
          {households.length} Households Registered
        </span>
      </div>

      {households.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <Users className="w-10 h-10 mx-auto text-[#D4AF37] mb-3 stroke-1" />
          <h3 className="font-serif text-xl mb-1">No Households Added Yet</h3>
          <p className="text-neutral-500 text-sm mb-4">
            Start building your guest list by adding family groups.
          </p>
          <button
            onClick={() => setIsHouseholdModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-[#c29e2f] transition"
          >
            Add First Household
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {households.map((household) => {
            const isExpanded = expandedHousehold === household.id;
            return (
              <div key={household.id} className="glass-card rounded-2xl p-6 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-xl font-medium text-[#1C1C1E]">
                        {household.householdName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                          household.rsvpStatus === 'attending'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : household.rsvpStatus === 'declined'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {household.rsvpStatus === 'attending' && <CheckCircle2 className="w-3 h-3" />}
                        {household.rsvpStatus === 'pending' && <Clock className="w-3 h-3" />}
                        {household.rsvpStatus === 'declined' && <XCircle className="w-3 h-3" />}
                        {household.rsvpStatus}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {household.guests.length} guest{household.guests.length === 1 ? '' : 's'} in household
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedHouseholdId(household.id);
                        setIsGuestModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 bg-white border border-neutral-200 text-neutral-700 px-3.5 py-1.5 rounded-full text-xs font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Guest
                    </button>
                    <button
                      onClick={() => setExpandedHousehold(isExpanded ? null : household.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-[#1C1C1E] px-2 py-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span>{isExpanded ? 'Hide Guests' : 'View Guests'}</span>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-neutral-100 space-y-3 animate-in fade-in duration-200">
                    {household.guests.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic">
                        No individual guests added to this household yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {household.guests.map((guest) => (
                          <div
                            key={guest.id}
                            className="bg-white/80 border border-neutral-100 rounded-xl p-3.5 shadow-sm"
                          >
                            <div className="font-medium text-sm text-[#1C1C1E]">
                              {guest.firstName} {guest.lastName}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                              <Utensils className="w-3 h-3 text-[#D4AF37]" />
                              <span className="capitalize">{guest.mealPreference}</span>
                              {guest.dietaryNotes && (
                                <span
                                  className="text-neutral-400 truncate max-w-[120px]"
                                  title={guest.dietaryNotes}
                                >
                                  • {guest.dietaryNotes}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Household Modal */}
      {isHouseholdModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-neutral-100">
            <h2 className="font-serif text-3xl mb-2 text-[#1C1C1E]">Add Household Group</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Group families or couples together for RSVPs and seating.
            </p>
            <form onSubmit={handleCreateHousehold} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                  Household Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Montgomery Family"
                  value={newHouseholdName}
                  onChange={(e) => setNewHouseholdName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsHouseholdModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D4AF37] transition"
                >
                  Save Household
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-neutral-100">
            <h2 className="font-serif text-3xl mb-2 text-[#1C1C1E]">Add Guest</h2>
            <p className="text-neutral-500 text-sm mb-6">Add an attendee and their meal preferences.</p>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victoria"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sterling"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                  Meal Preference
                </label>
                <select
                  value={mealPreference}
                  onChange={(e) => setMealPreference(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm bg-white"
                >
                  <option value="chicken">Pan-Roasted Chicken</option>
                  <option value="beef">Filet Mignon (Beef)</option>
                  <option value="fish">Seared Sea Bass (Fish)</option>
                  <option value="vegetarian">Wild Mushroom Risotto (Vegetarian)</option>
                  <option value="vegan">Roasted Squash & Quinoa (Vegan)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-500 mb-1">
                  Dietary Notes / Allergies
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gluten-free, nut allergy"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1C1C1E] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D4AF37] transition"
                >
                  Add Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}