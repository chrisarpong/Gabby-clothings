import React, { useState } from 'react';
import { useQuery, useMutation, useAction } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Users, Shield, Plus, Key, Power, RefreshCw, XCircle, Activity, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { useStaffQuery, useStaffMutation, useStaffAction } from "../../hooks/useStaffAuth";
import { useConfirm } from '../../hooks/useConfirm';

export default function TeamManagementTab() {
  const { token } = useStaffAuth();
  const staff = useStaffQuery(api.staffAuth.listStaff, {}) || [];
  
  const createStaff = useStaffAction(api.staffAuthNode.createStaffUser);
  const resetPassword = useStaffAction(api.staffAuthNode.resetStaffPassword);
  
  const toggleActive = useStaffMutation(api.staffAuth.toggleStaffActive);
  const updateRole = useStaffMutation(api.staffAuth.updateStaffRole);
  const revokeSessions = useStaffMutation(api.staffAuth.revokeStaffSessions);
  const reset2FA = useStaffMutation(api.staffAuth.resetStaff2FA);

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('designer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [generatedPassword, setGeneratedPassword] = useState<{email: string, password: string} | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [selectedStaffLogins, setSelectedStaffLogins] = useState<any[] | null>(null);
  const [isViewingLogins, setIsViewingLogins] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  const getLogins = useStaffQuery(api.staffAuth.getStaffLogins, 
    isViewingLogins ? {  targetStaffId: isViewingLogins as any } : "skip"
  );

  const handleAddStaff = async () => {
    if (!newStaffName || !newStaffEmail || !newStaffRole) {
      return toast.error("All fields are required");
    }
    setIsSubmitting(true);
    try {
      const otp = await createStaff({
        
        name: newStaffName,
        email: newStaffEmail,
        role: newStaffRole
      });
      setGeneratedPassword({ email: newStaffEmail, password: otp });
      setNewStaffName('');
      setNewStaffEmail('');
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
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-surface border-b border-surface-variant">
            <tr>
              <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Status</th>
              <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Name & Email</th>
              <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Role</th>
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setIsViewingLogins(isViewingLogins === member._id ? null : member._id)}
                        title="View Login Activity"
                        className="p-2 text-outline hover:text-primary hover:bg-surface-variant transition-colors"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleResetPassword(member._id, member.name)}
                        disabled={!member.isActive}
                        title="Reset Password"
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
                    </div>
                  </td>
                </tr>
                {isViewingLogins === member._id && (
                  <tr className="bg-surface-container-high/50">
                    <td colSpan={4} className="p-4 sm:p-6 border-b border-surface-variant">
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
              <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">No staff found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
