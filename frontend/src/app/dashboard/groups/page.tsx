'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { groupsAPI } from '@/lib/api';
import { Group } from '@/lib/api';
import { Plus, Users, Edit, Trash2, UserPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const groupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
});

const memberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
});

type GroupForm = z.infer<typeof groupSchema>;
type MemberForm = z.infer<typeof memberSchema>;

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const {
    register: registerGroup,
    handleSubmit: handleGroupSubmit,
    reset: resetGroup,
    formState: { errors: groupErrors },
  } = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
  });

  const {
    register: registerMember,
    handleSubmit: handleMemberSubmit,
    reset: resetMember,
    formState: { errors: memberErrors },
  } = useForm<MemberForm>({
    resolver: zodResolver(memberSchema),
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getGroups();
      setGroups(response.data.groups);
    } catch (error) {
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const onCreateGroup = async (data: GroupForm) => {
    try {
      await groupsAPI.createGroup(data);
      toast.success('Group created successfully!');
      setShowCreateModal(false);
      resetGroup();
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  };

  const onEditGroup = async (data: GroupForm) => {
    if (!selectedGroup) return;
    
    try {
      await groupsAPI.updateGroup(selectedGroup.id, data);
      toast.success('Group updated successfully!');
      setShowEditModal(false);
      setSelectedGroup(null);
      resetGroup();
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update group');
    }
  };

  const onDeleteGroup = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    try {
      await groupsAPI.deleteGroup(groupId);
      toast.success('Group deleted successfully!');
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete group');
    }
  };

  const onAddMember = async (data: MemberForm) => {
    if (!selectedGroup) return;
    
    try {
      await groupsAPI.addMember(selectedGroup.id, data);
      toast.success('Member added successfully!');
      setShowAddMemberModal(false);
      setSelectedGroup(null);
      resetMember();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    resetGroup({
      name: group.name,
      description: group.description
    });
    setShowEditModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600">Manage your teams and groups</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                <p className="text-gray-600 mt-1">{group.description}</p>
                <div className="flex items-center mt-3 text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Role: {group.role}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Created by {group.creator_name}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowAddMemberModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Add member"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditGroup(group)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                  title="Edit group"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteGroup(group.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete group"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No groups</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first group.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Group</h3>
              <form onSubmit={handleGroupSubmit(onCreateGroup)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    {...registerGroup('name')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter group name"
                  />
                  {groupErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{groupErrors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    {...registerGroup('description')}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter group description"
                  />
                  {groupErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{groupErrors.description.message}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetGroup();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Group</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditModal && selectedGroup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Group</h3>
              <form onSubmit={handleGroupSubmit(onEditGroup)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    {...registerGroup('name')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter group name"
                  />
                  {groupErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{groupErrors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    {...registerGroup('description')}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter group description"
                  />
                  {groupErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{groupErrors.description.message}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedGroup(null);
                      resetGroup();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Group</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedGroup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Member to {selectedGroup.name}
              </h3>
              <form onSubmit={handleMemberSubmit(onAddMember)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    {...registerMember('email')}
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter member email"
                  />
                  {memberErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{memberErrors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    {...registerMember('role')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select role</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  {memberErrors.role && (
                    <p className="mt-1 text-sm text-red-600">{memberErrors.role.message}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddMemberModal(false);
                      setSelectedGroup(null);
                      resetMember();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Member</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 