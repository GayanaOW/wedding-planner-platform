'use client';

import { useEffect, useState } from 'react';
import { Calendar, MapPin, Heart, CheckCircle2, XCircle, Utensils, Sparkles } from 'lucide-react';
import { PublicRsvpDetails, Guest } from '@/types/wedding';
import { weddingApi } from '@/services/weddingApi';

export default function RsvpClient({ token }: { token: string }) {
  const [data, setData] = useState<PublicRsvpDetails | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined'>('attending');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRsvp = async () => {
      try {
        const res = await weddingApi.getRsvpByToken(token);
        setData(res);
        setGuests(res.guests);
        if (res.rsvpStatus === 'declined') {
          setRsvpStatus('declined');
        } else {
          setRsvpStatus('attending');
        }
      } catch (err: any) {
        setError('This invitation link is invalid or could not be found.');
      } finally {
        setLoading(false);
      }
    };

    if (token) loadRsvp();
  }, [token]);

  const updateGuestField = (guestId: number, field: 'mealPreference' | 'dietaryNotes', value: string) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, [field]: value } : g))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await weddingApi.submitRsvp(token, {
        rsvpStatus,
        guests: guests.map((g) => ({
          id: g.id,
          mealPreference: g.mealPreference,
          dietaryNotes: g.dietaryNotes,
        })),
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Could not submit RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-serif italic text-neutral-400 text-lg">
        Preparing your invitation...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card rounded-3xl p-10 max-w-md w-full text-center">
          <Heart className="w-10 h-10 mx-auto text-neutral-300 mb-4 stroke-1" />
          <h1 className="font-serif text-3xl text-[#1C1C1E] mb-2">Invitation Not Found</h1>
          <p className="text-sm text-neutral-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full glass-card rounded-3xl p-8 sm:p-14 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        {/* Invitation Header */}
        <div className="text-center border-b border-[#D4AF37]/20 pb-8 mb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold block mb-3">
            You Are Cordially Invited
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#1C1C1E] mb-4">
            {data.wedding?.coupleNames || 'Wedding Celebration'}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-600">
            {data.wedding?.weddingDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                {data.wedding.weddingDate}
              </span>
            )}
            {data.wedding?.venueName && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                {data.wedding.venueName}
              </span>
            )}
          </div>
        </div>

        {/* Household Greeting */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1">Prepared For</p>
          <h2 className="font-serif text-2xl text-[#1C1C1E]">{data.householdName}</h2>
        </div>

        {submitted ? (
          <div className="text-center py-10 space-y-4 animate-in fade-in duration-300">
            <Sparkles className="w-10 h-10 mx-auto text-[#D4AF37] stroke-1" />
            <h3 className="font-serif text-3xl text-[#1C1C1E]">
              {rsvpStatus === 'attending' ? 'We Look Forward to Celebrating With You' : 'Thank You for Letting Us Know'}
            </h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              Your response for <span className="font-medium text-[#1C1C1E]">{data.householdName}</span> has been recorded.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] hover:text-[#1C1C1E] font-medium transition"
            >
              Modify Response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Attendance Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRsvpStatus('attending')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  rsvpStatus === 'attending'
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#1C1C1E] shadow-xs'
                    : 'border-neutral-200 bg-white/60 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 ${
                    rsvpStatus === 'attending' ? 'text-[#D4AF37]' : 'text-neutral-300'
                  }`}
                />
                <div>
                  <div className="font-serif text-lg font-medium">Joyfully Accepts</div>
                  <div className="text-xs opacity-75">We will attend the celebration</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRsvpStatus('declined')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  rsvpStatus === 'declined'
                    ? 'border-neutral-800 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white/60 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                <XCircle
                  className={`w-5 h-5 shrink-0 ${
                    rsvpStatus === 'declined' ? 'text-[#D4AF37]' : 'text-neutral-300'
                  }`}
                />
                <div>
                  <div className="font-serif text-lg font-medium">Regretfully Declines</div>
                  <div className="text-xs opacity-75">Unable to attend in person</div>
                </div>
              </button>
            </div>

            {/* Guest Meal Preferences (Shown when Attending) */}
            {rsvpStatus === 'attending' && guests.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-neutral-500">
                  <Utensils className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Guest Entrée & Dietary Preferences</span>
                </div>

                <div className="space-y-4">
                  {guests.map((guest) => (
                    <div
                      key={guest.id}
                      className="bg-white/90 border border-neutral-200/80 rounded-2xl p-5 space-y-3"
                    >
                      <div className="font-serif text-xl text-[#1C1C1E]">
                        {guest.firstName} {guest.lastName}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                            Entrée Selection
                          </label>
                          <select
                            value={guest.mealPreference || 'chicken'}
                            onChange={(e) => updateGuestField(guest.id, 'mealPreference', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm bg-white"
                          >
                            <option value="chicken">Pan-Roasted Chicken</option>
                            <option value="beef">Filet Mignon (Beef)</option>
                            <option value="fish">Seared Sea Bass (Fish)</option>
                            <option value="vegetarian">Wild Mushroom Risotto (Vegetarian)</option>
                            <option value="vegan">Roasted Squash & Quinoa (Vegan)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                            Allergies / Dietary Notes
                          </label>
                          <input
                            type="text"
                            placeholder="Optional (e.g. Gluten-free)"
                            value={guest.dietaryNotes || ''}
                            onChange={(e) => updateGuestField(guest.id, 'dietaryNotes', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1C1C1E] text-white py-4 rounded-full text-sm uppercase tracking-widest font-medium hover:bg-[#D4AF37] transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Recording Response...' : 'Confirm RSVP'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}