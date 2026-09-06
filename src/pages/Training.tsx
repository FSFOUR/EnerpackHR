import React, { useState } from 'react';
import { BookOpen, Award, PlayCircle, Search, CheckCircle2, Clock, Filter, Download, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface Course {
  id: string;
  title: string;
  category: 'Compliance' | 'Technical' | 'Leadership' | 'Security';
  duration: string;
  progress: number;
  students: number;
  instructor: string;
  certificateEarned?: boolean;
}

const initialCourses: Course[] = [
  {
    id: 'CRS-001',
    title: 'Code of Conduct & Workplace Ethics 2026',
    category: 'Compliance',
    duration: '45 mins',
    progress: 100,
    students: 172,
    instructor: 'Legal & HR Team',
    certificateEarned: true
  },
  {
    id: 'CRS-002',
    title: 'Information Security & Data Privacy (SOC2)',
    category: 'Security',
    duration: '1 hr 15 mins',
    progress: 85,
    students: 142,
    instructor: 'CyberSec Operations',
    certificateEarned: false
  },
  {
    id: 'CRS-003',
    title: 'Advanced React 19 & State Architecture',
    category: 'Technical',
    duration: '3 hrs 30 mins',
    progress: 40,
    students: 48,
    instructor: 'Engineering Guild',
    certificateEarned: false
  },
  {
    id: 'CRS-004',
    title: 'Empathetic Leadership & Team Mentorship',
    category: 'Leadership',
    duration: '2 hrs',
    progress: 60,
    students: 24,
    instructor: 'People Strategy',
    certificateEarned: false
  },
  {
    id: 'CRS-005',
    title: 'Cloud Infrastructure Best Practices & IAM',
    category: 'Technical',
    duration: '2 hrs 45 mins',
    progress: 0,
    students: 65,
    instructor: 'DevOps Guild',
    certificateEarned: false
  },
];

const CATEGORIES = ['All', 'Compliance', 'Security', 'Technical', 'Leadership'] as const;

export function Training() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStartOrContinue = (course: Course) => {
    if (course.progress === 100) {
      showToast(`Reviewing course material for: ${course.title}`);
    } else {
      const nextProgress = Math.min(100, course.progress + 20);
      setCourses(prev => prev.map(c => c.id === course.id ? { 
        ...c, 
        progress: nextProgress,
        certificateEarned: nextProgress === 100 ? true : c.certificateEarned
      } : c));
      if (nextProgress === 100) {
        showToast(`Congratulations! You completed ${course.title} and earned a certificate!`);
      } else {
        showToast(`Resumed ${course.title}. Progress updated to ${nextProgress}%`);
      }
    }
  };

  const handleDownloadCertificate = (course: Course) => {
    showToast(`Downloading Certificate of Completion for "${course.title}"...`);
  };

  const filteredCourses = courses.filter(course => {
    if (selectedCategory !== 'All' && course.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return course.title.toLowerCase().includes(q) || course.instructor.toLowerCase().includes(q);
    }
    return true;
  });

  const completedCount = courses.filter(c => c.progress === 100).length;

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
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Training & Development</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Enroll in compliance modules, sharpen skills, and download certifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>{completedCount} Certificates Earned</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Category horizontal scrolling chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'All' ? courses.length : courses.filter(c => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer min-h-[40px]",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                <span>{cat}</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  isSelected ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search course title or instructor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 min-h-[40px]"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            <p className="font-bold text-slate-700">No courses match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try switching categories or clearing search filters.</p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isCompleted = course.progress === 100;
            const isNotStarted = course.progress === 0;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Category badge & duration */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {course.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {course.duration}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">{course.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Instructor: {course.instructor}</p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">{course.students} Learners enrolled</span>
                </div>

                {/* Progress Bar & Actions */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Completion</span>
                    <span className={cn(
                      "font-bold font-mono text-xs",
                      isCompleted ? "text-emerald-600" : "text-blue-600"
                    )}>
                      {course.progress}%
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-500",
                        isCompleted ? "bg-emerald-500" : "bg-blue-600"
                      )}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleStartOrContinue(course)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer",
                        isCompleted
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs shadow-blue-200"
                      )}
                    >
                      {isCompleted ? (
                        <>Review Course</>
                      ) : isNotStarted ? (
                        <><PlayCircle className="w-4 h-4" /> Start Course</>
                      ) : (
                        <><PlayCircle className="w-4 h-4" /> Continue</>
                      )}
                    </button>

                    {isCompleted && (
                      <button
                        onClick={() => handleDownloadCertificate(course)}
                        title="Download Certificate"
                        className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 min-h-[44px] cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">Certificate</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
