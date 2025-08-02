'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { meetingsAPI, groupsAPI } from '@/lib/api';
import { Meeting, Group } from '@/lib/api';
import { Plus, Users, Clock, MapPin, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDate, formatTime } from '@/lib/utils';

const meetingSchema = z.object({
  group_id: z.number().min(1, 'Please select a group'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  location: z.string().optional(),
});

type MeetingForm = z.infer<typeof meetingSchema>;

export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeetingForm>({
    resolver: zodResolver(meetingSchema),
  });

  useEffect(() => {
    fetchData();
    
    // Check for prefill data from calendar
    const prefillData = sessionStorage.getItem('prefillMeeting');
    if (prefillData) {
      try {
        const meetingData = JSON.parse(prefillData);
        
        // Convert ISO strings to datetime-local format
        const formattedData = {
          ...meetingData,
          start_time: new Date(meetingData.start_time).toISOString().slice(0, 16),
          end_time: new Date(meetingData.end_time).toISOString().slice(0, 16),
        };
        
        reset(formattedData);
        setShowCreateModal(true);
        sessionStorage.removeItem('prefillMeeting');
      } catch (error) {
        console.error('Error parsing prefill data:', error);
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      const [meetingsResponse, groupsResponse] = await Promise.all([
        meetingsAPI.getAllUserMeetings(),
        groupsAPI.getGroups(),
      ]);
      
      const meetingsData = meetingsResponse.data.meetings;
      const groupsData = groupsResponse.data.groups;
      
      setMeetings(meetingsData);
      setGroups(groupsData);
      
      console.log('Meetings page data loaded:', {
        meetings: meetingsData.length,
        groups: groupsData.length,
        groupsData: groupsData.map((g: any) => ({ id: g.id, name: g.name, role: g.role })),
        meetingsData: meetingsData.map((m: any) => ({ id: m.id, title: m.title, group_name: m.group_name }))
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const onCreateMeeting = async (data: MeetingForm) => {
    try {
      await meetingsAPI.createMeeting(data);
      toast.success('Meeting created successfully!');
      setShowCreateModal(false);
      reset();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create meeting');
    }
  };

  const onUpdateParticipantStatus = async (meetingId: number, status: string) => {
    try {
      await meetingsAPI.updateParticipantStatus(meetingId, status);
      toast.success(`Meeting ${status} successfully!`);
      
      // Force refresh the data
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const onDeleteMeeting = async (meetingId: number) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    
    try {
      await meetingsAPI.deleteMeeting(meetingId);
      toast.success('Meeting deleted successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete meeting');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Schedule and manage group meetings</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Meetings</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.participation_status)}`}>
                      {meeting.participation_status}
                    </span>
                    {meeting.participation_status === 'declined' && (
                      <span className="text-xs text-gray-500">(Click accept to join)</span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{meeting.description}</p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{meeting.group_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatDate(meeting.start_time)} at {formatTime(meeting.start_time)}</span>
                    </div>
                    {meeting.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Created by {meeting.creator_name}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {/* Show accept/decline buttons for pending and declined status */}
                  {(meeting.participation_status === 'pending' || meeting.participation_status === 'declined') && (
                    <>
                      <button
                        onClick={() => onUpdateParticipantStatus(meeting.id, 'accepted')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                        title="Accept meeting"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onUpdateParticipantStatus(meeting.id, 'declined')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Decline meeting"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  
                  {/* Show status indicator for accepted meetings only */}
                  {meeting.participation_status === 'accepted' && (
                    <span className="p-2 text-green-600" title="Meeting accepted">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                  )}
                  
                  {/* Edit and delete buttons */}
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    title="Edit meeting"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteMeeting(meeting.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete meeting"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {meetings.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No meetings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by scheduling your first meeting.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>
      )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Meeting</h3>
              <form onSubmit={handleSubmit(onCreateMeeting)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group</label>
                  <select
                    {...register('group_id', { valueAsNumber: true })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.role})
                      </option>
                    ))}
                  </select>
                  {groups.length === 0 ? (
                    <p className="mt-1 text-sm text-amber-600">
                      You need to join a group first to schedule meetings.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Only groups you're a member of are shown.
                    </p>
                  )}
                  {errors.group_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.group_id.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    {...register('title')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter meeting title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter meeting description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      {...register('start_time')}
                      type="datetime-local"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                    {errors.start_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      {...register('end_time')}
                      type="datetime-local"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    />
                    {errors.end_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
                  <input
                    {...register('location')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter location"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Schedule Meeting</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 