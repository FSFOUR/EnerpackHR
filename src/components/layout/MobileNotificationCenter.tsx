import React, { useState } from 'react';
import { Bell, CheckCheck, Clock, FileText, Calendar, AlertCircle, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  group: 'Today' | 'Yesterday' | 'Earlier';
  read: boolean;
  type: 'leave' | 'attendance' | 'document' | 'contract' | 'task';
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'New Leave Request',
    message: 'Ananya Desai applied for 2 days Casual Leave starting tomorrow.',
    time: '10:45 AM',
    group: 'Today',
    read: false,
    type: 'leave',
    link: '/leave'
  },
  {
    id: 'n-2',
    title: 'Attendance Shift Alert',
    message: 'Standard shift check-in recorded. 168 employees logged on time.',
    time: '08:15 AM',
    group: 'Today',
    read: false,
    type: 'attendance',
    link: '/attendance'
  },
  {
    id: 'n-3',
    title: 'Contract Pending Signature',
    message: 'Employment contract for Senior Developer awaits digital signing.',
    time: 'Yesterday 04:30 PM',
    group: 'Yesterday',
    read: true,
    type: 'contract',
    link: '/contracts'
  },
  {
    id: 'n-4',
    title: 'Document Uploaded',
    message: 'Aadhaar and PAN verification uploaded for EMP-005 Rohan Mehta.',
    time: 'Yesterday 11:20 AM',
    group: 'Yesterday',
    read: true,
    type: 'document',
    link: '/documents'
  },
  {
    id: 'n-5',
    title: 'Task Assigned',
    message: 'You have been assigned to Q3 Performance Evaluation audit.',
    time: '3 days ago',
    group: 'Earlier',
    read: true,
    type: 'task',
    link: '/tasks'
  }
];

interface MobileNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNotificationCenter: React.FC<MobileNotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClickItem = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.link) {
      navigate(item.link);
      onClose();
    }
  };

  const groups: ('Today' | 'Yesterday' | 'Earlier')[] = ['Today', 'Yesterday', 'Earlier'];

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'leave': return Calendar;
      case 'attendance': return Clock;
      case 'document': return FileText;
      case 'contract': return FileText;
      default: return AlertCircle;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
        {/* Handle for mobile touch affordance */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Real-time alerts and activity updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 flex items-center gap-1 transition-colors min-h-[36px]"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close notifications"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Groups */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {groups.map(group => {
            const items = notifications.filter(n => n.group === group);
            if (items.length === 0) return null;

            return (
              <div key={group} className="space-y-2">
                <div className="px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {group}
                </div>

                <div className="space-y-1.5">
                  {items.map(item => {
                    const Icon = getIcon(item.type);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleClickItem(item)}
                        className={cn(
                          "p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 min-h-[56px]",
                          item.read 
                            ? "bg-slate-50/70 border-slate-200/70 text-slate-700 hover:bg-slate-100/80" 
                            : "bg-blue-50/50 border-blue-200 text-slate-900 shadow-2xs hover:bg-blue-50"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                          item.read ? "bg-white text-slate-500 border border-slate-200" : "bg-blue-600 text-white shadow-xs"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={cn("text-xs font-bold truncate", !item.read && "text-blue-950")}>
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                            {item.message}
                          </p>
                        </div>

                        {!item.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl sm:rounded-b-2xl text-center">
          <p className="text-[11px] text-slate-400">Notifications auto-expire after 30 days.</p>
        </div>
      </div>
    </div>
  );
};
