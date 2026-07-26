'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';
import { AdminService } from '@/services/admin-service';
import { sanitizeDigits } from '@/lib/input-utils';
import { FiUserPlus, FiKey, FiSlash, FiCheck, FiShield, FiUser } from 'react-icons/fi';

interface Props {
  users: User[];
  onRefresh: () => void;
  currentUserRole: string;
}

export default function UserManagementTable({ users, onRefresh, currentUserRole }: Props) {
  const [resetCodeModal, setResetCodeModal] = useState<{ user: User; code: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Create Staff Form state
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+44',
    mobileNumber: '',
    password: '',
    role: 'STAFF',
  });

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await AdminService.updateUser(userId, { role });
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to update role');
    }
  };

  const handleToggleSuspend = async (userId: string) => {
    try {
      await AdminService.toggleSuspend(userId);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to toggle suspension');
    }
  };

  const handleGenerateResetCode = async (user: User) => {
    try {
      const res = await AdminService.generateResetCode(user.id);
      setResetCodeModal({ user, code: res.resetCode });
    } catch (e: any) {
      alert(e.message || 'Failed to generate code');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await AdminService.createUser(newStaff);
      setShowCreateModal(false);
      setNewStaff({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+44',
        mobileNumber: '',
        password: '',
        role: 'STAFF',
      });
      onRefresh();
    } catch (err: any) {
      setMsg(err.message || 'Failed to create staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <FiShield className="text-brand-red" /> User & Staff Management
          </h3>
          <p className="text-xs text-muted-foreground">Manage user roles, permissions, suspensions, and reset passcodes</p>
        </div>

        {currentUserRole === 'SUPER_ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow transition"
          >
            <FiUserPlus />
            <span>Create Staff / Admin</span>
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-muted-foreground">
          <thead className="bg-muted text-muted-foreground font-semibold uppercase text-[11px] border-b border-border">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Phone Number</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/60 transition">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-card-foreground">{user.firstName} {user.lastName}</div>
                  <div className="text-[11px] text-muted-foreground">{user.email}</div>
                </td>
                <td className="py-3.5 px-4 font-mono">
                  {user.countryCode} {user.mobileNumber}
                </td>
                <td className="py-3.5 px-4">
                  {currentUserRole === 'SUPER_ADMIN' ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-muted border border-border text-foreground text-xs rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    >
                      <option value="USER">USER</option>
                      <option value="STAFF">STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  ) : (
                    <span className="font-bold text-brand-red">{user.role}</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {user.isSuspended ? (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded">
                      Suspended
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleGenerateResetCode(user)}
                    className="bg-muted hover:bg-border text-brand-red px-2.5 py-1 rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                    title="Generate Password Reset Code"
                  >
                    <FiKey /> Code
                  </button>
                  {currentUserRole === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => handleToggleSuspend(user.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition inline-flex items-center gap-1 ${
                        user.isSuspended
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {user.isSuspended ? <FiCheck /> : <FiSlash />}
                      {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reset Code Modal */}
      {resetCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full shadow-2xl text-center">
            <FiKey className="text-3xl text-brand-red mx-auto mb-3" />
            <h4 className="font-bold text-card-foreground text-lg">Instant Password Reset Code</h4>
            <p className="text-xs text-muted-foreground my-2">
              Share this one-time code with <strong>{resetCodeModal.user.email}</strong> to reset their password:
            </p>
            <div className="bg-muted border border-brand-red/40 p-4 rounded-xl font-mono text-3xl font-black text-brand-red tracking-widest my-4">
              {resetCodeModal.code}
            </div>
            <button
              onClick={() => setResetCodeModal(null)}
              className="bg-primary text-primary-foreground font-bold px-6 py-2 rounded-xl text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h4 className="font-bold text-card-foreground text-base mb-4">Create New Staff / Admin Account</h4>
            {msg && <div className="p-2 mb-3 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">{msg}</div>}
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  value={newStaff.firstName}
                  onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                  className="bg-muted border border-border p-2 rounded text-foreground"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  value={newStaff.lastName}
                  onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                  className="bg-muted border border-border p-2 rounded text-foreground"
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                required
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                className="w-full bg-muted border border-border p-2 rounded text-foreground"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="+44"
                  value={newStaff.countryCode}
                  onChange={(e) => setNewStaff({ ...newStaff, countryCode: e.target.value })}
                  className="w-20 bg-muted border border-border p-2 rounded text-foreground"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Mobile Number"
                  required
                  value={newStaff.mobileNumber}
                  onChange={(e) => setNewStaff({ ...newStaff, mobileNumber: sanitizeDigits(e.target.value) })}
                  className="flex-1 bg-muted border border-border p-2 rounded text-foreground"
                />
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                className="w-full bg-muted border border-border p-2 rounded text-foreground"
              />
              <select
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                className="w-full bg-muted border border-border p-2 rounded text-foreground"
              >
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-muted text-muted-foreground px-4 py-2 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
