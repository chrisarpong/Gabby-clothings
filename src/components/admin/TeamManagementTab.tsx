import React, { useState } from 'react';
import { useQuery, useMutation, useAction } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Users, Shield, Plus, Key, Power, RefreshCw, XCircle, Activity, Copy, Check, Smartphone, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { useStaffQuery, useStaffMutation, useStaffAction } from "../../hooks/useStaffAuth";
import { useConfirm } from '../../hooks/useConfirm';

export default function TeamManagementTab() {
  const { profile } = useStaffAuth();
  const isCeo = profile?.role === "ceo";
  const staff = useStaffQuery(api.staffAuth.listStaff, {}) || [];
  
  const createStaff = useStaffAction(api.staffAuthNode.createStaffUser);
  const resetPassword = useStaffAction(api.staffAuthNode.resetStaffPassword);
  const sendCeoSms = useStaffAction(api.staffAuthNode.ceoSendStaffPasswordSms);
  
  const toggleActive = useStaffMutation(api.staffAuth.toggleStaffActive);
  const updateRole = useStaffMutation(api.staffAuth.updateStaffRole);
  const revokeSessions = useStaffMutation(api.staffAuth.revokeStaffSessions);
  const reset2FA = useStaffMutation(api.staffAuth.resetStaff2FA);
  const deleteStaff = useStaffAction(api.staffAuthNode.deleteStaffUser);
  const updateStaffPhone = useStaffMutation(api.staffAuth.updateStaffPhone);

  const smsSettings = useStaffQuery(api.staffSecurity.getSmsSettings, isCeo ? {} : "skip");
  const updateSmsSettings = useStaffMutation(api.staffSecurity.updateSmsSettings);

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('designer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [generatedPassword, setGeneratedPassword] = useState<{email: string, password: string} | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [isViewingLogins, setIsViewingLogins] = useState<string | null>(null);
  const [editingPhoneStaffId, setEditingPhoneStaffId] = useState<string | null>(null);
  const [editingPhoneValue, setEditingPhoneValue] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const { confirm, dialog } = useConfirm();

  const getLogins = useStaffQuery(api.staffAuth.getStaffLogins, 
    isViewingLogins ? {  targetStaffId: isViewingLogins as any } : "skip"
  );

  const handleAddStaff = async () => {
    if (!newStaffName || !newStaffEmail || !newStaffRole) {
      return toast.error("Name, email, and role are required");
    }
    setIsSubmitting(true);
    try {
      const otp = await createStaff({
        name: newStaffName,
        email: newStaffEmail,
        role: newStaffRole,
        phone: newStaffPhone.trim() ? newStaffPhone.trim() : undefined,
      });
      setGeneratedPassword({ email: newStaffEmail, password: otp });
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPhone('');
      setNewStaffRole('designer');
      toast.success("Staff member created successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!await confirm(`Reset ${name}'s password?`, 'This revokes all of their active sessions immediately.', 'Reset password')) return;
    
    try {
      const otp = await resetPassword({
        targetStaffId: id as any,
      });
      setGeneratedPassword({ email: name, password: otp });
      toast.success(`Password reset for ${name}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSendCeoSms = async (id: string, name: string, phone?: string) => {
    if (!phone) return;
    const ok = await confirm(
      `Send temporary password to ${name}?`,
      `A one-time temporary password will be sent via SMS to ${phone}. It will expire in 15 minutes.`,
      'Send SMS'
    );
    if (!ok) return;
    setIsSendingSms(id);
    try {
      const res = await sendCeoSms({ targetStaffId: id as any });
      toast.success(`Sent to ${res.maskedPhone}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send SMS reset");
    } finally {
      setIsSendingSms(null);
    }
  };

  const handleSavePhone = async (staffId: string) => {
    if (!editingPhoneValue.trim()) {
      return toast.error("Phone number is required");
    }
    setIsSavingPhone(true);
    try {
      const res = await updateStaffPhone({
        targetStaffId: staffId as any,
        phone: editingPhoneValue.trim(),
      });
      toast.success(`Phone updated to ${res.phone}`);
      setEditingPhoneStaffId(null);
      setEditingPhoneValue('');
    } catch (err: any) {
      toast.error(err.message || "Failed to update phone number");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleToggleSmsEnabled = async () => {
    if (!smsSettings) return;
    try {
      await updateSmsSettings({
        smsResetEnabled: !smsSettings.smsResetEnabled,
        smsResetAllowedRoles: smsSettings.smsResetAllowedRoles,
        smsDailyCap: smsSettings.smsDailyCap,
      });
      toast.success(smsSettings.smsResetEnabled ? "SMS reset disabled" : "SMS reset enabled");
    } catch (err: any) {
      toast.error(err.message || "Failed to update SMS settings");
    }
  };

  const handleToggleRole = async (role: string) => {
    if (!smsSettings) return;
    const currentRoles = smsSettings.smsResetAllowedRoles;
    const isEnabling = !currentRoles.includes(role);
    if (isEnabling && (role === "admin" || role === "ceo")) {
      const warning = role === "ceo"
        ? "CEO recovery normally uses the operator command. Are you sure you want to enable SMS reset for the CEO?"
        : "Are you sure you want to allow SMS reset for administrators?";
      const ok = await confirm(`Enable SMS reset for ${role.toUpperCase()}?`, warning, "Enable");
      if (!ok) return;
    }
    const newRoles = isEnabling
      ? [...currentRoles, role]
      : currentRoles.filter(r => r !== role);
    try {
      await updateSmsSettings({
        smsResetEnabled: smsSettings.smsResetEnabled,
        smsResetAllowedRoles: newRoles,
        smsDailyCap: smsSettings.smsDailyCap,
      });
      toast.success("Updated allowed roles");
    } catch (err: any) {
      toast.error(err.message || "Failed to update roles");
    }
  };

  const handleUpdateDailyCap = async (val: number) => {
    if (!smsSettings) return;
    const clamped = Math.min(200, Math.max(5, Math.round(val)));
    try {
      await updateSmsSettings({
        smsResetEnabled: smsSettings.smsResetEnabled,
        smsResetAllowedRoles: smsSettings.smsResetAllowedRoles,
        smsDailyCap: clamped,
      });
      toast.success(`Daily cap updated to ${clamped}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update daily cap");
    }
  };

  const handleReset2FA = async (id: string, name: string) => {
    if (!await confirm(`Reset ${name}'s 2FA?`, 'They will be forced to re-enroll on their next login.', 'Reset 2FA')) return;
    try {
      await reset2FA({
        targetStaffId: id as any,
      });
      toast.success(`2FA reset for ${name}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    if (currentlyActive && !await confirm('Deactivate staff member?', 'This immediately blocks login and revokes access to the staff account.', 'Deactivate')) return;
    try {
      await toggleActive({
        targetStaffId: id as any,
        isActive: !currentlyActive
      });
      toast.success(currentlyActive ? "Staff member deactivated" : "Staff member activated");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    if (!await confirm('Revoke all sessions?', 'This logs the staff member out of every device.', 'Revoke sessions')) return;
    try {
      await revokeSessions({
        targetStaffId: id as any,
      });
      toast.success("All sessions revoked");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget || !deletePassword || !deleteConfirmation) return;
    setIsDeleting(true);
    try {
      await deleteStaff({
        targetStaffId: deleteTarget._id as any,
        currentPassword: deletePassword,
        confirmation: deleteConfirmation,
      });
      toast.success(`${deleteTarget.name} was permanently deleted`);
      setDeleteTarget(null);
      setDeletePassword('');
      setDeleteConfirmation('');
    } catch (err: any) {
      toast.error(err.message || "Staff deletion failed");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateRole({
        targetStaffId: id as any,
        role: newRole,
      });
      toast.success("Role updated");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">{dialog}
      {deleteTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-staff-title">
          <div className="w-full max-w-lg border border-red-500/40 bg-surface p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <Trash2 className="mt-1 text-error" size={22} />
              <div>
                <h2 id="delete-staff-title" className="text-xl font-semibold text-primary">Permanently delete {deleteTarget.name}?</h2>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">This permanently removes the staff login, sessions, and pending password resets. It cannot be undone. Historical orders and audit records are retained, but this account will no longer be recoverable.</p>
              </div>
            </div>
            <label className="mt-5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Your current CEO password</label>
            <input type="password" autoFocus value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className="mt-2 w-full border border-surface-variant bg-surface-container-lowest px-3 py-3 text-primary" autoComplete="current-password" />
            <label className="mt-4 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Type DELETE {deleteTarget.email} to confirm</label>
            <input type="text" value={deleteConfirmation} onChange={e => setDeleteConfirmation(e.target.value)} className="mt-2 w-full border border-surface-variant bg-surface-container-lowest px-3 py-3 font-mono text-primary" />
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { setDeleteTarget(null); setDeletePassword(''); setDeleteConfirmation(''); }} className="border border-surface-variant px-4 py-3 text-sm text-primary">Cancel</button>
              <button type="button" onClick={handleDeleteStaff} disabled={isDeleting || !deletePassword || deleteConfirmation !== `DELETE ${deleteTarget.email}`} className="bg-error px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{isDeleting ? "Deleting…" : "Permanently delete"}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Generated Password Modal/Banner */}
      {generatedPassword && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-widest text-xs mb-2">Important: One-Time Password</h3>
            <p className="text-sm text-on-surface-variant max-w-lg">
              A temporary password has been generated for <strong>{generatedPassword.email}</strong>. 
              Please copy and securely share this password. <span className="font-bold text-error">It will NOT be shown again.</span> The user will be forced to change it on their first login.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-surface p-2 border border-surface-variant shrink-0">
            <code className="px-4 py-2 text-lg font-mono text-primary font-bold tracking-widest">
              {generatedPassword.password}
            </code>
            <button 
              onClick={copyPassword}
              className="p-3 bg-primary text-surface hover:bg-tertiary transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <button 
            onClick={() => setGeneratedPassword(null)}
            className="text-xs uppercase tracking-widest text-outline hover:text-primary transition-colors underline underline-offset-4 mt-4 md:mt-0"
          >
            I have saved this password
          </button>
        </div>
      )}

      {/* CEO Password Reset by SMS Settings Card */}
      {isCeo && (
        <div className="bg-surface border border-surface-variant p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl text-primary flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-on-surface-variant" />
                Password Reset by SMS
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Allow staff members to receive temporary one-time passwords via SMS.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                {smsSettings?.smsResetEnabled ? "Enabled" : "Disabled"}
              </span>
              <button
                onClick={handleToggleSmsEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  smsSettings?.smsResetEnabled ? 'bg-primary' : 'bg-surface-variant'
                }`}
                title="Toggle SMS password reset"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${
                    smsSettings?.smsResetEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-surface-variant">
            {/* Allowed Roles */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                Allowed Roles
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["designer", "sales", "admin", "ceo"] as const).map(role => {
                  const isChecked = smsSettings?.smsResetAllowedRoles?.includes(role) ?? false;
                  return (
                    <div key={role} className="flex flex-col p-3 bg-surface-container-lowest border border-surface-variant">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRole(role)}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm font-medium text-primary capitalize">{role}</span>
                      </label>
                      {role === "ceo" && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 pl-7">
                          CEO recovery normally uses the operator command
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Cap & Stats */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">
                  Daily Cap (5 - 200)
                </label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  defaultValue={smsSettings?.smsDailyCap ?? 30}
                  key={smsSettings?.smsDailyCap}
                  onBlur={e => handleUpdateDailyCap(Number(e.target.value))}
                  className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-primary text-primary"
                />
              </div>
              <div className="p-3 bg-surface-container-lowest border border-surface-variant space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Usage</div>
                <div className="text-xs text-primary font-mono">
                  Sent today: <span className="font-bold">{smsSettings?.sentToday ?? 0}</span> / {smsSettings?.smsDailyCap ?? 30}
                </div>
                <div className="text-xs text-primary font-mono">
                  Last 7 days: <span className="font-bold">{smsSettings?.last7Days ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff */}
      <div className="bg-surface border border-surface-variant p-6 sm:p-8">
        <h2 className="font-serif text-2xl text-primary mb-2 flex items-center gap-3">
          <Users className="w-5 h-5 text-on-surface-variant" />
          Add Staff Member
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Name *</label>
            <input 
              type="text" 
              value={newStaffName} onChange={e => setNewStaffName(e.target.value)}
              className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Email *</label>
            <input 
              type="email" 
              value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)}
              className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Phone (optional)</label>
            <input 
              type="tel" 
              placeholder="024 123 4567"
              value={newStaffPhone} onChange={e => setNewStaffPhone(e.target.value)}
              className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Role *</label>
            <div className="flex gap-2">
              <select 
                value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
              >
                <option value="designer">Designer</option>
                <option value="sales">Sales</option>
                <option value="admin">Admin</option>
                <option value="ceo">CEO</option>
              </select>
              <button 
                onClick={handleAddStaff} disabled={isSubmitting}
                className="bg-primary text-surface px-4 py-3 hover:bg-tertiary transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="border border-surface-variant bg-surface-container-lowest overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[850px]">
          <thead className="bg-surface border-b border-surface-variant">
            <tr>
              <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Status</th>
              <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Name & Email</th>
              <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Role</th>
              <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Phone</th>
              <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant">
            {staff.map((member: any) => (
              <React.Fragment key={member._id}>
                <tr className={`hover:bg-surface/50 ${!member.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[9px] uppercase tracking-widest font-bold ${member.isActive ? 'text-green-600 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-green-600' : 'bg-red-500'}`}></span>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-primary font-medium">{member.name}</div>
                    <div className="text-on-surface-variant text-xs mt-0.5">{member.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member._id, e.target.value)}
                      disabled={!member.isActive}
                      className="bg-transparent border border-surface-variant px-2 py-1 text-sm focus:border-primary text-primary disabled:opacity-50"
                    >
                      <option value="designer">Designer</option>
                      <option value="sales">Sales</option>
                      <option value="admin">Admin</option>
                      <option value="ceo">CEO</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {editingPhoneStaffId === member._id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="tel"
                          value={editingPhoneValue}
                          onChange={e => setEditingPhoneValue(e.target.value)}
                          placeholder="024 123 4567"
                          className="w-32 bg-surface border border-surface-variant px-2 py-1 text-xs font-mono text-primary focus:outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => handleSavePhone(member._id)}
                          disabled={isSavingPhone}
                          title="Save phone"
                          className="p-1 text-green-600 hover:bg-green-500/10 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPhoneStaffId(null);
                            setEditingPhoneValue('');
                          }}
                          title="Cancel"
                          className="p-1 text-outline hover:text-error"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={member.phone ? "font-mono text-xs text-primary" : "text-xs text-outline italic"}>
                          {member.phone || "No phone"}
                        </span>
                        {isCeo && (
                          <button
                            onClick={() => {
                              setEditingPhoneStaffId(member._id);
                              setEditingPhoneValue('');
                            }}
                            title={member.phone ? "Change phone number" : "Add phone number"}
                            className="text-[10px] uppercase tracking-wider text-outline hover:text-primary underline underline-offset-2 ml-1"
                          >
                            {member.phone ? "Edit" : "Add"}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setIsViewingLogins(isViewingLogins === member._id ? null : member._id)}
                        title="View Login Activity"
                        className="p-2 text-outline hover:text-primary hover:bg-surface-variant transition-colors"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                      {isCeo && (
                        <button
                          onClick={() => handleSendCeoSms(member._id, member.name, member.phone)}
                          disabled={
                            !smsSettings?.smsResetEnabled ||
                            !member.phone ||
                            !smsSettings?.smsResetAllowedRoles?.includes(member.role) ||
                            !member.isActive ||
                            isSendingSms === member._id
                          }
                          title={
                            !smsSettings?.smsResetEnabled
                              ? "SMS reset is disabled in security settings"
                              : !member.phone
                              ? "Staff member has no phone number"
                              : !smsSettings?.smsResetAllowedRoles?.includes(member.role)
                              ? `SMS reset is not enabled for role ${member.role}`
                              : !member.isActive
                              ? "Staff member is inactive"
                              : isSendingSms === member._id
                              ? "Sending SMS..."
                              : "Send temp password by SMS"
                          }
                          className="p-2 text-outline hover:text-primary hover:bg-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleResetPassword(member._id, member.name)}
                        disabled={!member.isActive}
                        title="Reset Password (show on screen)"
                        className="p-2 text-outline hover:text-primary hover:bg-surface-variant transition-colors disabled:opacity-50"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleReset2FA(member._id, member.name)}
                        disabled={!member.isActive || !member.totpEnabled}
                        title="Reset 2FA"
                        className="p-2 text-outline hover:text-primary hover:bg-surface-variant transition-colors disabled:opacity-50"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRevokeSessions(member._id)}
                        title="Revoke All Sessions"
                        className="p-2 text-outline hover:text-primary hover:bg-surface-variant transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleActive(member._id, member.isActive)}
                        title={member.isActive ? "Deactivate" : "Reactivate"}
                        className={`p-2 transition-colors ${member.isActive ? 'text-error hover:bg-error/10' : 'text-green-600 hover:bg-green-600/10'}`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      {isCeo && member.role !== 'ceo' && (
                        <button
                          onClick={() => setDeleteTarget(member)}
                          title="Permanently delete staff member"
                          className="p-2 text-error hover:bg-error/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {isViewingLogins === member._id && (
                  <tr className="bg-surface-container-high/50">
                    <td colSpan={5} className="p-4 sm:p-6 border-b border-surface-variant">
                      <h4 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-4">Recent Activity for {member.name}</h4>
                      {getLogins === undefined ? (
                        <div className="text-sm text-outline animate-pulse">Loading...</div>
                      ) : getLogins && getLogins.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getLogins.map((login: any) => (
                            <div key={login._id} className="bg-surface border border-surface-variant p-4 flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-bold tracking-wider uppercase ${login.revokedAt ? 'text-error' : 'text-green-600'}`}>
                                  {login.revokedAt ? 'Revoked' : 'Active'}
                                </span>
                                <span className="text-xs text-on-surface-variant">{new Date(login.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="text-xs text-on-surface-variant font-mono break-all">{login.userAgent || 'Unknown Device'}</div>
                              <div className="text-xs text-outline">{login.ip || 'Unknown IP'}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-outline">No recent logins.</div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {staff.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No staff found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
