import React from 'react';
import { BookOpen, Award, PlayCircle, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export function Training() {
  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Training & Development</h1>
          <p className="text-slate-500 text-sm mt-1">Assign courses, track compliance, and manage certifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
         {[
           { title: 'Information Security Basic', progress: 85, students: 142 },
           { title: 'Code of Conduct 2026', progress: 100, students: 172 },
           { title: 'Advanced React Patterns', progress: 30, students: 12 },
           { title: 'Leadership Essentials', progress: 60, students: 8 },
         ].map((course, idx) => (
           <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-blue-200 transition-colors group cursor-pointer">
              <div>
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mb-4 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{course.title}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{course.students} Enrolled</p>
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-end mb-2">
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Completion</span>
                   <span className="text-xs font-bold text-slate-700">{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className={cn("h-1.5 rounded-full transition-all", course.progress === 100 ? "bg-green-500" : "bg-blue-600")} style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
