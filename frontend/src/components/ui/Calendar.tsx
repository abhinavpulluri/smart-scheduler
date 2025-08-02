'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { Event, Meeting } from '@/lib/api';

interface CalendarProps {
  events: Event[];
  meetings: Meeting[];
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({ events, meetings, onDateClick, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_time), date));
  };

  // Get meetings for a specific date
  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => isSameDay(new Date(meeting.start_time), date));
  };

  // Check if date has any events or meetings
  const hasActivities = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const dayMeetings = getMeetingsForDate(date);
    return dayEvents.length > 0 || dayMeetings.length > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDate(day);
            const dayMeetings = getMeetingsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const hasActivity = hasActivities(day);

            return (
              <div
                key={day.toString()}
                onClick={() => onDateClick?.(day)}
                className={`
                  min-h-[80px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50
                  ${isCurrentDay ? 'bg-blue-50 border-blue-300' : ''}
                  ${isSelected ? 'bg-blue-100 border-blue-400' : ''}
                  ${!isSameMonth(day, currentMonth) ? 'text-gray-400 bg-gray-50' : ''}
                `}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                
                {/* Activity Indicators */}
                <div className="space-y-1">
                  {dayEvents.map((event, index) => (
                    <div
                      key={`event-${index}`}
                      className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayMeetings.map((meeting, index) => (
                    <div
                      key={`meeting-${index}`}
                      className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded truncate"
                      title={meeting.title}
                    >
                      {meeting.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar; 