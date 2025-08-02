'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { groupsAPI, eventsAPI, meetingsAPI } from '@/lib/api';
import { Group, Event, Meeting } from '@/lib/api';
import Calendar from '@/components/ui/Calendar';
import GroupAvailability from '@/components/ui/GroupAvailability';
import { Users, Calendar as CalendarIcon, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupEvents();
    } else {
      fetchPersonalEvents();
    }
  }, [selectedGroup, selectedDate]);

  const fetchData = async () => {
    try {
      const [groupsData, meetingsData] = await Promise.all([
        groupsAPI.getGroups(),
        meetingsAPI.getUserMeetings(),
      ]);

      const groups = groupsData.data.groups;
      const meetings = meetingsData.data.meetings;

      setGroups(groups);
      setMeetings(meetings);
      
      console.log('Calendar page data loaded:', {
        groups: groups.length,
        meetings: meetings.length,
        groupsData: groups.map((g: any) => ({ id: g.id, name: g.name, role: g.role }))
      });
    } catch (error) {
      toast.error('Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching personal events:', error);
    }
  };

  const fetchGroupEvents = async () => {
    if (!selectedGroup) return;
    
    try {
      // Get events for the current month
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const response = await eventsAPI.getGroupEvents(selectedGroup.id, {
        start_date: startOfMonth.toISOString(),
        end_date: endOfMonth.toISOString()
      });
      
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching group events:', error);
      toast.error('Failed to fetch group events');
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSlotSelect = (startTime: Date, endTime: Date) => {
    if (selectedGroup) {
      // Navigate to meetings page with pre-filled data
      const meetingData = {
        group_id: selectedGroup.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      };
      
      // Store in sessionStorage for the meetings page to pick up
      sessionStorage.setItem('prefillMeeting', JSON.stringify(meetingData));
      
      // Navigate to meetings page
      router.push('/dashboard/meetings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">
            {selectedGroup 
              ? `Viewing ${selectedGroup.name} group schedule` 
              : 'View your schedule and group availability'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setSelectedGroup(null)}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            My Calendar
          </Button>
        </div>
      </div>

      {/* Group Selection */}
      {groups.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Group for Availability</h2>
          <p className="text-sm text-gray-600 mb-4">Only groups you're a member of are shown below.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedGroup?.id === group.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                <p className="text-xs text-gray-400 mt-2">Role: {group.role}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Groups Available</h2>
            <p className="text-gray-500 mb-4">You need to join a group to view group availability and schedule meetings.</p>
            <button 
              onClick={() => router.push('/dashboard/groups')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Groups
            </button>
          </div>
        </div>
      )}

      {/* Main Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Calendar
            events={events}
            meetings={meetings}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {/* Events for selected date */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                {selectedGroup ? 'Group Events' : 'My Events'}
              </h4>
              {events
                .filter(event => new Date(event.start_time).toDateString() === selectedDate.toDateString())
                .map((event) => (
                  <div key={event.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900">{event.title}</div>
                    <div className="text-sm text-blue-700">
                      {new Date(event.start_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()}
                    </div>
                    {selectedGroup && event.first_name && (
                      <div className="text-sm text-blue-600">
                        {event.first_name} {event.last_name}
                      </div>
                    )}
                    {event.location && (
                      <div className="text-sm text-blue-600">{event.location}</div>
                    )}
                  </div>
                ))}
              
              {events.filter(event => new Date(event.start_time).toDateString() === selectedDate.toDateString()).length === 0 && (
                <p className="text-gray-500 text-sm">
                  {selectedGroup ? 'No group events scheduled' : 'No events scheduled'}
                </p>
              )}
            </div>

            {/* Meetings for selected date */}
            <div className="space-y-3 mt-6">
              <h4 className="font-medium text-gray-900">Meetings</h4>
              {meetings
                .filter(meeting => new Date(meeting.start_time).toDateString() === selectedDate.toDateString())
                .map((meeting) => (
                  <div key={meeting.id} className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-900">{meeting.title}</div>
                    <div className="text-sm text-purple-700">
                      {new Date(meeting.start_time).toLocaleTimeString()} - {new Date(meeting.end_time).toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-purple-600">Group: {meeting.group_name}</div>
                    {meeting.location && (
                      <div className="text-sm text-purple-600">{meeting.location}</div>
                    )}
                  </div>
                ))}
              
              {meetings.filter(meeting => new Date(meeting.start_time).toDateString() === selectedDate.toDateString()).length === 0 && (
                <p className="text-gray-500 text-sm">No meetings scheduled</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/dashboard/events')}
                className="w-full"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/meetings')}
                className="w-full"
                variant="outline"
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Availability */}
      {selectedGroup && (
        <div className="mt-8">
          <GroupAvailability
            group={selectedGroup}
            selectedDate={selectedDate}
            onSlotSelect={handleSlotSelect}
          />
        </div>
      )}
    </div>
  );
} 