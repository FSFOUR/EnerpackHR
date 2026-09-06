import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, Plus, Search, Filter, Clock, User, 
  Calendar, AlertCircle, CheckCircle2, MoreVertical, 
  Edit3, Trash2, ArrowRight, Sparkles, Tag, Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  category: 'HR' | 'Compliance' | 'Operations' | 'Payroll' | 'Audit';
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'TSK-101',
    title: 'Review Q3 Performance Appraisals',
    description: 'Complete manager reviews for Engineering and Sales departments.',
    assignedTo: 'EMP-001',
    assignedToName: 'Arjun Sharma',
    dueDate: '2026-09-12',
    priority: 'High',
    status: 'In Progress',
    category: 'HR'
  },
  {
    id: 'TSK-102',
    title: 'Audit Aadhaar & PAN KYC Compliance',
    description: 'Verify all documents uploaded in folder 02 HR & Employee Records.',
    assignedTo: 'EMP-002',
    assignedToName: 'Priya Patel',
    dueDate: '2026-09-15',
    priority: 'High',
    status: 'Pending',
    category: 'Compliance'
  },
  {
    id: 'TSK-103',
    title: 'Verify Monthly Shift Attendance Overtime',
    description: 'Check 10-hour standard shifts and compute ₹50 OT night bonuses.',
    assignedTo: 'EMP-005',
    assignedToName: 'Rohan Mehta',
    dueDate: '2026-09-10',
    priority: 'Medium',
    status: 'Pending',
    category: 'Payroll'
  },
  {
    id: 'TSK-104',
    title: 'Schedule Vehicle Fleet Routine Maintenance',
    description: 'Coordinate oil change and brake pad check for Delivery Van KL-07-CD-5678.',
    assignedTo: 'EMP-006',
    assignedToName: 'Sneha Reddy',
    dueDate: '2026-09-18',
    priority: 'Medium',
    status: 'In Progress',
    category: 'Operations'
  },
  {
    id: 'TSK-105',
    title: 'Distribute Corporate Code of Conduct Policy',
    description: 'Send digital acknowledgment request to all newly onboarded staff.',
    assignedTo: 'EMP-002',
    assignedToName: 'Priya Patel',
    dueDate: '2026-09-08',
    priority: 'Low',
    status: 'Completed',
    category: 'Compliance'
  }
];

export const Tasks: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<'All' | 'My Tasks' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Form State for new task
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('Priya Patel');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newCategory, setNewCategory] = useState<TaskItem['category']>('HR');

  const currentEmpId = userProfile?.employeeId || 'EMP-001';

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                          task.assignedToName.toLowerCase().includes(search.toLowerCase()) ||
                          task.description.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filter === 'All') return true;
      if (filter === 'My Tasks') return task.assignedTo === currentEmpId || task.assignedToName.includes('Arjun') || task.assignedToName.includes(userProfile?.displayName || 'Shafi');
      return task.status === filter;
    });
  }, [tasks, filter, search, currentEmpId, userProfile]);

  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Completed' ? 'Pending' : t.status === 'Pending' ? 'In Progress' : 'Completed';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Completed' } : t));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `TSK-${Date.now().toString().slice(-3)}`,
      title: newTitle,
      description: newDesc,
      assignedTo: 'EMP-002',
      assignedToName: newAssignee,
      dueDate: newDueDate || '2026-09-20',
      priority: newPriority,
      status: 'Pending',
      category: newCategory
    };

    setTasks(prev => [newTask, ...prev]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Task Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">Track operations, onboarding checklists, and HR compliance action items.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs shadow-blue-200 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>New Task</span>
        </button>
      </div>

      {/* KPI Stats Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Tasks</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.total}</span>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider block">Pending</span>
          <span className="text-xl sm:text-2xl font-extrabold text-amber-600">{stats.pending}</span>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider block">In Progress</span>
          <span className="text-xl sm:text-2xl font-extrabold text-blue-600">{stats.inProgress}</span>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider block">Completed</span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">{stats.completed}</span>
        </div>
      </div>

      {/* Search & Filter Tabs */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task title, description, or assigned staff..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400 min-h-[44px]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {(['All', 'My Tasks', 'Pending', 'In Progress', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[38px] flex items-center gap-1.5 cursor-pointer",
                filter === tab 
                  ? "bg-slate-900 text-white shadow-xs" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <CheckSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h3 className="font-bold text-slate-800 text-base">No tasks found</h3>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting a different filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "bg-white p-4 sm:p-5 rounded-2xl border transition-all space-y-3 shadow-2xs hover:shadow-xs",
                task.status === 'Completed' ? "border-slate-200/60 opacity-80" : "border-slate-200"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(task.id)}
                    aria-label={`Mark task ${task.title}`}
                    className={cn(
                      "w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer min-h-[32px] min-w-[32px]",
                      task.status === 'Completed' 
                        ? "bg-emerald-600 border-emerald-600 text-white" 
                        : "border-slate-300 hover:border-blue-500 bg-slate-50"
                    )}
                  >
                    {task.status === 'Completed' && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <h3 className={cn(
                      "text-sm sm:text-base font-bold text-slate-900 leading-snug",
                      task.status === 'Completed' && "line-through text-slate-400"
                    )}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>

                {/* Status Pill */}
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shrink-0 border",
                  task.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  task.status === 'In Progress' ? "bg-blue-50 text-blue-700 border-blue-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                )}>
                  {task.status}
                </span>
              </div>

              {/* Meta information row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {task.assignedToName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Due {task.dueDate}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    task.priority === 'High' ? "bg-rose-50 text-rose-700 font-extrabold" :
                    task.priority === 'Medium' ? "bg-amber-50 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {task.priority}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 ml-auto">
                  {task.status !== 'Completed' && (
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors min-h-[36px] flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const newAssign = prompt('Enter employee name to reassign:', task.assignedToName);
                      if (newAssign) {
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, assignedToName: newAssign } : t));
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors min-h-[36px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Reassign</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Task Bottom Sheet / Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowCreateModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Create New Task</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Verify employee contract renewals"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Enter details and requirements for this task..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                  >
                    <option value="Arjun Sharma">Arjun Sharma (Engineering)</option>
                    <option value="Priya Patel">Priya Patel (HR Manager)</option>
                    <option value="Rohan Mehta">Rohan Mehta (Finance)</option>
                    <option value="Vikram Singh">Vikram Singh (Sales)</option>
                    <option value="Sneha Reddy">Sneha Reddy (Operations)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[44px]"
                  >
                    <option value="HR">HR</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Operations">Operations</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Audit">Audit</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs uppercase min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase min-h-[44px] shadow-xs shadow-blue-200"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
