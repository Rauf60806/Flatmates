import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ToggleLeft, ToggleRight, Key } from 'lucide-react';
import { api, ApiUser } from '../api/client';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getInitials, getAvatarColor } from '../utils/format';

interface AdminUser extends ApiUser {
  createdAt?: string;
}

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState<AdminUser | null>(null);

  // Create user form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Reset password form
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleActive = async (user: AdminUser) => {
    try {
      await api.patch(`/admin/${user.id}`, { active: !user.active });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u))
      );
    } catch {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setCreateError('All fields are required.');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      await api.post('/admin', {
        name: newName.trim(),
        email: newEmail.trim(),
        temporaryPassword: newPassword,
        role: 'member',
      });
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      fetchUsers();
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Failed to create user.');
    }
    setCreateLoading(false);
  };

  const handleResetPassword = async () => {
    if (!showResetModal) return;
    if (resetPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      await api.patch(`/admin/${showResetModal.id}`, { resetPassword });
      setShowResetModal(null);
      setResetPassword('');
    } catch (err: any) {
      setResetError(err?.response?.data?.message || 'Failed to reset password.');
    }
    setResetLoading(false);
  };

  const activeCount = users.filter((u) => u.active).length;

  return (
    <div className="px-4 md:px-0 pt-5 md:pt-0 pb-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-light tracking-tight">Admin Console</h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Manage flatmates, active accounts, and credentials • {activeCount} active flatmate{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          size="md"
          onClick={() => setShowAddModal(true)}
          className="gap-2 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Flatmate</span>
        </Button>
      </div>

      {/* Users Responsive Grid on Tablet / PC */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center max-w-md mx-auto">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-base font-semibold text-ink-light">No users registered</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => {
              const initials = getInitials(u.name);
              const avatarBg = getAvatarColor(u.name);

              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between ${
                    !u.active ? 'opacity-60 bg-gray-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-white text-xs font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-ink-light truncate">{u.name}</p>
                        {u.role === 'admin' ? (
                          <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 bg-teal/10 text-teal rounded">
                            Admin
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 bg-gray-100 text-ink-muted rounded">
                            Member
                          </span>
                        )}
                        {!u.active && (
                          <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 bg-danger/10 text-danger rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                    <div className="text-xs text-ink-muted">
                      Status: <span className={u.active ? 'text-success font-semibold' : 'text-danger font-semibold'}>{u.active ? 'Active' : 'Inactive'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Reset Password */}
                      <button
                        onClick={() => { setShowResetModal(u); setResetPassword(''); setResetError(''); }}
                        title="Reset password"
                        aria-label="Reset password"
                        className="p-2 text-ink-muted hover:text-teal rounded-xl hover:bg-teal/5 transition-colors"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      {/* Toggle Active */}
                      <button
                        onClick={() => toggleActive(u)}
                        title={u.active ? 'Deactivate user' : 'Activate user'}
                        aria-label={u.active ? 'Deactivate user' : 'Activate user'}
                        className={`p-2 rounded-xl transition-colors ${
                          u.active
                            ? 'text-success hover:bg-success/10'
                            : 'text-ink-muted hover:bg-gray-100'
                        }`}
                      >
                        {u.active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Flatmate Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setCreateError(''); }}
        title="Add Flatmate"
        description="Create a new account with a temporary password."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            autoComplete="off"
            placeholder="e.g. Alex Rivera"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            autoComplete="off"
            placeholder="flatmate@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Input
            label="Temporary Password"
            type="text"
            autoComplete="off"
            placeholder="Min. 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {createError && (
            <p className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-3 py-2.5">
              {createError}
            </p>
          )}
          <Button type="submit" fullWidth isLoading={createLoading}>
            Create Account
          </Button>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!showResetModal}
        onClose={() => { setShowResetModal(null); setResetError(''); }}
        title={`Reset Password`}
        description={showResetModal ? `for ${showResetModal.name}` : ''}
      >
        <div className="space-y-4">
          <Input
            label="New Temporary Password"
            type="text"
            autoComplete="off"
            placeholder="Min. 6 characters"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
          />
          {resetError && (
            <p className="text-sm text-danger">{resetError}</p>
          )}
          <Button fullWidth onClick={handleResetPassword} isLoading={resetLoading}>
            Set New Password
          </Button>
        </div>
      </Modal>
    </div>
  );
};
