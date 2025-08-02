'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { eventsAPI, groupsAPI } from '@/lib/api';
import { Group, Event, Meeting } from '@/lib/api';
import { Users, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { format, addDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

interface GroupAvailabilityProps {
  group: Group;
  selectedDate: Date;
  onSlotSelect?: (startTime: Date, endTime: Date) => void;
}

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  conflicts: string[];
}

interface MemberAvailability {
  userId: number;
  name: string;
  email: string;
  busyTimes: Array<{ start: Date; end: Date; title: string }>;
}

const GroupAvailability: React.FC<GroupAvailabilityProps> = ({ 
  group, 
  selectedDate, 
  onSlotSelect 
}) => {
  const { user } = useAuth();
  const [memberAvailability, setMemberAvailability] = useState<MemberAvailability[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Generate time slots for the selected date (9 AM to 6 PM)
  const generateTimeSlots = (date: Date) => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 18;
    const slotDuration = 60; // 1 hour slots

    for (let hour = startHour; hour < endHour; hour++) {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);
      
      const end = new Date(date);
      end.setHours(hour + 1, 0, 0, 0);

      slots.push({
        start,
        end,
        available: true,
        conflicts: [],
      });
    }

    return slots;
  };

  // Check availability for each time slot
  const checkAvailability = (slots: TimeSlot[], members: MemberAvailability[]) => {
    return slots.map(slot => {
      const conflicts: string[] = [];
      let available = true;

      members.forEach(member => {
        member.busyTimes.forEach(busyTime => {
          if (isWithinInterval(slot.start, { start: busyTime.start, end: busyTime.end }) ||
              isWithinInterval(slot.end, { start: busyTime.start, end: busyTime.end }) ||
              isWithinInterval(busyTime.start, { start: slot.start, end: slot.end })) {
            conflicts.push(`${member.name}: ${busyTime.title}`);
            available = false;
          }
        });
      });

      return {
        ...slot,
        available,
        conflicts,
      };
    });
  };

  useEffect(() => {
    fetchMemberAvailability();
  }, [group, selectedDate]);

  const fetchMemberAvailability = async () => {
    setLoading(true);
    try {
      // Get group members
      const membersResponse = await groupsAPI.getGroupMembers(group.id);
      
      // Check if members exist and is an array
      const members = membersResponse.data?.members || [];
      
      if (!Array.isArray(members)) {
        console.error('Members is not an array:', members);
        toast.error('Invalid members data received');
        return;
      }

      // Get events for all group members for the selected date
      const startDate = startOfDay(selectedDate).toISOString();
      const endDate = endOfDay(selectedDate).toISOString();
      
      const eventsResponse = await eventsAPI.getGroupEvents(group.id, {
        start_date: startDate,
        end_date: endDate
      });
      
      const events = eventsResponse.data?.events || [];

      // Transform events into member availability
      const memberAvailabilityData: MemberAvailability[] = members.map((member: any) => {
        const memberEvents = events.filter((event: Event) => event.user_id === member.id);
        const busyTimes = memberEvents
          .filter((event: Event) => event.is_busy)
          .map((event: Event) => ({
            start: new Date(event.start_time),
            end: new Date(event.end_time),
            title: event.title
          }));

        return {
          userId: member.id,
          name: `${member.first_name} ${member.last_name}`,
          email: member.email,
          busyTimes
        };
      });

      setMemberAvailability(memberAvailabilityData);

      // Generate and check time slots
      const slots = generateTimeSlots(selectedDate);
      const availableSlots = checkAvailability(slots, memberAvailabilityData);
      setTimeSlots(availableSlots);

    } catch (error: any) {
      console.error('Error fetching member availability:', error);
      if (error.response?.status === 404) {
        toast.error('Group not found or you are not a member');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view this group');
      } else {
        toast.error('Failed to fetch member availability');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    if (onSlotSelect) {
      onSlotSelect(slot.start, slot.end);
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
      {/* Group Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
            <p className="text-gray-600">{group.description}</p>
            <p className="text-sm text-gray-500">{memberAvailability.length} members</p>
          </div>
        </div>
      </div>

      {/* Selected Date */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Availability for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>

        {/* Time Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeSlots.map((slot, index) => (
            <div
              key={index}
              onClick={() => handleSlotSelect(slot)}
              className={`
                p-4 border rounded-lg cursor-pointer transition-colors
                ${slot.available 
                  ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                  : 'border-red-200 bg-red-50 hover:bg-red-100'
                }
                ${selectedSlot === slot ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
                </span>
                {slot.available ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              
              <div className="text-sm">
                {slot.available ? (
                  <span className="text-green-700">All members available</span>
                ) : (
                  <div>
                    <span className="text-red-700 font-medium">Conflicts:</span>
                    <ul className="mt-1 space-y-1">
                      {slot.conflicts.slice(0, 2).map((conflict, idx) => (
                        <li key={idx} className="text-red-600 text-xs">
                          • {conflict}
                        </li>
                      ))}
                      {slot.conflicts.length > 2 && (
                        <li className="text-red-600 text-xs">
                          • +{slot.conflicts.length - 2} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Schedules</h3>
        <div className="space-y-4">
          {memberAvailability.map((member) => (
            <div key={member.userId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <span className="text-sm text-gray-500">{member.email}</span>
              </div>
              <div className="space-y-2">
                {member.busyTimes.length > 0 ? (
                  member.busyTimes.map((busyTime, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span className="text-gray-600">
                        {format(busyTime.start, 'h:mm a')} - {format(busyTime.end, 'h:mm a')}
                      </span>
                      <span className="text-gray-900 font-medium">• {busyTime.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Available all day</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Slot Actions */}
      {selectedSlot && selectedSlot.available && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Schedule Meeting for {format(selectedSlot.start, 'h:mm a')} - {format(selectedSlot.end, 'h:mm a')}
          </h3>
          <div className="flex space-x-3">
            <Button onClick={() => handleSlotSelect(selectedSlot)}>
              Schedule Meeting
            </Button>
            <Button variant="outline" onClick={() => setSelectedSlot(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupAvailability; 