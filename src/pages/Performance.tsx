import React, { useState } from 'react';
import { Target, TrendingUp, Star, Search, Plus, CheckCircle2, ChevronRight, MessageSquare, Award, Clock, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Goal {
  id: string;
  title: string;
  category: string;
  target: string;
  progress: number;
  deadline: string;
}

interface Review360 {
  id: string;
  reviewee: string;
  role: string;
  cycle: string;
  status: 'Completed' | 'Pending Review' | 'In Progress';
  rating: number;
  peerFeedbackCount: number;
}

const initialGoals: Goal[] = [
  { id: 'g1', title: 'Complete Cloud Infrastructure Migration', category: 'Engineering', target: '100% Zero-downtime cutover', progress: 85, deadline: 'Sep 30, 2026' },
  { id: 'g2', title: 'Achieve 99.9% Core API Uptime', category: 'Reliability', target: '< 43 mins downtime/yr', progress: 95, deadline: 'Dec 31, 2026' },
  { id: 'g3', title: 'Mentor 2 Junior Frontend Developers', category: 'People', target: 'Bi-weekly 1:1s & code pairing', progress: 60, deadline: 'Nov 15, 2026' },
];

const initialReviews: Review360[] = [
  { id: 'r1', reviewee: 'Arjun Sharma', role: 'Staff Software Engineer', cycle: 'Q3 2026 360 Cycle', status: 'In Progress', rating: 4.5, peerFeedbackCount: 4 },
  { id: 'r2', reviewee: 'Priya Patel', role: 'Lead HR Business Partner', cycle: 'Q3 2026 360 Cycle', status: 'Completed', rating: 4.8, peerFeedbackCount: 6 },
  { id: 'r3', reviewee: 'Rahul Verma', role: 'Frontend Engineer', cycle: 'Q3 2026 360 Cycle', status: 'Pending Review', rating: 4.0, peerFeedbackCount: 2 },
];

export function Performance() {
  const [activeTab, setActiveTab] = useState<'goals' | 'reviews' | 'submit'>('goals');
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [reviews] = useState<Review360[]>(initialReviews);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile review form state
  const [formEmployee, setFormEmployee] = useState('Arjun Sharma');
  const [formRating, setFormRating] = useState<number>(4);
  const [formFeedback, setFormFeedback] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGoalProgressChange = (id: string, newProgress: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: newProgress } : g));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFeedback.trim()) {
      showToast('Please enter your feedback comments before submitting');
      return;
    }
    setFormSubmitting(true);
    setTimeout(() => {
      setFormSubmitting(false);
      showToast(`Performance evaluation for ${formEmployee} submitted successfully!`);
      setFormFeedback('');
      setActiveTab('reviews');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Performance & Goals</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage OKRs, track progress meters, and complete 360 peer reviews.</p>
        </div>
        <button
          onClick={() => setActiveTab('submit')}
          className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
        >
          <Star className="w-4 h-4" /> Submit 360 Review
        </button>
      </div>

      {/* Overview Stat Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Avg Rating</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900">4.6</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-amber-500">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className="w-3 h-3 fill-amber-400" />
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Goals</span>
          <p className="text-2xl font-bold font-mono text-blue-600 mt-1">{goals.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">82% on track</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">360 Reviews</span>
          <p className="text-2xl font-bold font-mono text-purple-600 mt-1">{reviews.length}</p>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Q3 Cycle active</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Review Deadline</span>
          <p className="text-sm font-bold text-slate-900 mt-2">Sep 30, 2026</p>
          <span className="text-[10px] text-amber-600 font-semibold mt-1 block">14 days left</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('goals')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[40px] flex items-center gap-2",
            activeTab === 'goals'
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          )}
        >
          <Target className="w-3.5 h-3.5" /> Goal Cards & Sliders
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[40px] flex items-center gap-2",
            activeTab === 'reviews'
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" /> 360 Review Status
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer min-h-[40px] flex items-center gap-2",
            activeTab === 'submit'
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Mobile Review Form
        </button>
      </div>

      {/* SECTION 14: GOAL CARDS WITH PROGRESS SLIDERS / METERS */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Quarterly OKRs</h3>
            <span className="text-xs text-slate-400">Slide to update self-reported progress</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {g.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due {g.deadline}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{g.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{g.target}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Completion Meter</span>
                    <span className="font-bold font-mono text-blue-600 text-sm">{g.progress}%</span>
                  </div>

                  {/* Visual meter bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-2.5 rounded-full transition-all",
                        g.progress >= 90 ? "bg-emerald-500" : g.progress >= 50 ? "bg-blue-600" : "bg-amber-500"
                      )}
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>

                  {/* Interactive Slider */}
                  <div className="pt-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Adjust Progress:
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={g.progress}
                      onChange={(e) => handleGoalProgressChange(g.id, Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 14: 360 REVIEW STATUS CARDS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">360 Evaluation Feed</h3>
            <span className="text-xs text-slate-500">Cycle: Q3 2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{r.reviewee}</h4>
                    <p className="text-xs text-slate-500 font-medium">{r.role}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{r.cycle}</span>
                  </div>

                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    r.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    r.status === 'In Progress' ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {r.status}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Overall Rating</span>
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-800 text-sm mt-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      {r.rating} / 5.0
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Peer Reviews</span>
                    <span className="text-xs font-semibold text-slate-700 mt-0.5 block">{r.peerFeedbackCount} received</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFormEmployee(r.reviewee);
                    setActiveTab('submit');
                  }}
                  className="w-full py-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-slate-200 flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Give Peer Feedback
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 14: MOBILE REVIEW FORM WITH RATING STARS AND FEEDBACK TEXT */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 max-w-2xl mx-auto">
          <div className="mb-5 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">360 Review Submission Form</h3>
            <p className="text-xs text-slate-500 mt-0.5">Provide constructive feedback and performance rating for colleagues.</p>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-5">
            {/* Employee Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Select Colleague to Review
              </label>
              <select
                value={formEmployee}
                onChange={(e) => setFormEmployee(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              >
                <option value="Arjun Sharma">Arjun Sharma — Staff Software Engineer</option>
                <option value="Priya Patel">Priya Patel — Lead HRBP</option>
                <option value="Rahul Verma">Rahul Verma — Frontend Engineer</option>
                <option value="Aisha Khan">Aisha Khan — UI/UX Designer</option>
                <option value="Vikram Joshi">Vikram Joshi — DevOps Engineer</option>
              </select>
            </div>

            {/* Rating Stars */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Performance Rating: <span className="font-mono text-blue-600 font-bold">{formRating} of 5 Stars</span>
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    className="p-1.5 cursor-pointer hover:scale-110 transition-transform min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 transition-colors",
                        star <= formRating ? "text-amber-400 fill-amber-400" : "text-slate-300 hover:text-amber-200"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Textarea */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Constructive Feedback & Highlights
              </label>
              <textarea
                rows={4}
                value={formFeedback}
                onChange={(e) => setFormFeedback(e.target.value)}
                placeholder="Highlight achievements, collaboration skills, and areas of growth..."
                className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm shadow-blue-200 min-h-[44px] cursor-pointer font-semibold disabled:opacity-50"
              >
                {formSubmitting ? 'Submitting...' : 'Submit Evaluation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
