import React, { useState } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Users, Shield, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamManagementTab() {
  const staff = useQuery(api.users.listStaffUsers);
  const roles = useQuery(api.roles.listRoles);
  
  const createStaff = useMutation(api.users.createStaffUser);
  const updateUserRole = useMutation(api.users.updateUserRole);
  const createRole = useMutation(api.roles.createRole);
  const removeRole = useMutation(api.roles.removeRole);

  const [activeTab, setActiveTab] = useState<'staff' | 'roles'>('staff');
  
  // New Staff State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRoleId, setNewStaffRoleId] = useState('');
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // New Role State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  const availablePermissions = [
    { id: 'all', label: 'Full Admin Access' },
    { id: 'manage_inventory', label: 'Manage Inventory' },
    { id: 'manage_orders', label: 'Manage Orders' },
    { id: 'manage_appointments', label: 'Manage Appointments' },
    { id: 'manage_clients', label: 'Manage Clients' },
    { id: 'manage_team', label: 'Manage Team & Roles' },
    { id: 'manage_content', label: 'Manage Content & CMS' },
    { id: 'manage_settings', label: 'Manage Settings' },
    { id: 'sales_person', label: 'Sales Person (Walk-ins & Appointments)' },
  ];

  const handleAddStaff = async () => {
    if (!newStaffName || !newStaffEmail || !newStaffRoleId) {
      toast.error('Name, email, and role are required');
      return;
    }
    
    setIsSubmittingStaff(true);
    try {
      await createStaff({
        name: newStaffName,
        email: newStaffEmail,
        phone: newStaffPhone || undefined,
        roleId: newStaffRoleId as any,
      });
      toast.success('Staff user created (Clerk invite required manually for now)');
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPhone('');
      setNewStaffRoleId('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create staff');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRoleName || !newRoleLabel || newRolePermissions.length === 0) {
      toast.error('Role name, label, and at least 1 permission required');
      return;
    }
    
    setIsSubmittingRole(true);
    try {
      await createRole({
        name: newRoleName,
        label: newRoleLabel,
        permissions: newRolePermissions,
        isSystemRole: false,
      });
      toast.success('Role created successfully');
      setNewRoleName('');
      setNewRoleLabel('');
      setNewRolePermissions([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create role');
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const togglePermission = (id: string) => {
    if (newRolePermissions.includes(id)) {
      setNewRolePermissions(newRolePermissions.filter(p => p !== id));
    } else {
      setNewRolePermissions([...newRolePermissions, id]);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (confirm('Are you sure you want to delete this role? Users with this role may lose access.')) {
      try {
        await removeRole({ id: id as any });
        toast.success('Role deleted');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete role');
      }
    }
  };

  if (staff === undefined || roles === undefined) {
    return <div className="p-8 text-on-surface-variant text-xs uppercase tracking-widest animate-pulse">Loading team data...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Tabs */}
      <div className="flex border-b border-surface-variant">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'staff'
              ? 'border-b-2 border-primary text-primary'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface'
          }`}
        >
          Staff Members
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'roles'
              ? 'border-b-2 border-primary text-primary'
              : 'text-on-surface-variant hover:text-primary hover:bg-surface'
          }`}
        >
          Roles & Permissions
        </button>
      </div>

      {activeTab === 'staff' && (
        <div className="space-y-8">
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
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Phone</label>
                <input 
                  type="tel" 
                  value={newStaffPhone} onChange={e => setNewStaffPhone(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Role *</label>
                <div className="flex gap-2">
                  <select 
                    value={newStaffRoleId} onChange={e => setNewStaffRoleId(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                  >
                    <option value="">Select a role...</option>
                    {roles.map(r => (
                      <option key={r._id} value={r._id}>{r.label}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAddStaff} disabled={isSubmittingStaff}
                    className="bg-primary text-surface px-4 py-3 hover:bg-tertiary transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-surface-variant bg-surface-container-lowest">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-surface-variant">
                <tr>
                  <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Name</th>
                  <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Email</th>
                  <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {staff.map(user => (
                  <tr key={user._id} className="hover:bg-surface/50">
                    <td className="px-6 py-4 text-primary font-medium">{user.firstName} {user.lastName}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.roleId ? (
                        <select
                          value={user.roleId}
                          onChange={(e) => updateUserRole({ userId: user._id, roleId: e.target.value as any })}
                          className="bg-transparent border border-surface-variant px-2 py-1 text-sm focus:border-primary text-primary"
                        >
                          {roles.map(r => (
                            <option key={r._id} value={r._id}>{r.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-secondary">{user.role} (Legacy)</span>
                      )}
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr><td colSpan={3} className="p-8 text-center text-on-surface-variant">No staff found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-8">
          <div className="bg-surface border border-surface-variant p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-primary mb-2 flex items-center gap-3">
              <Shield className="w-5 h-5 text-on-surface-variant" />
              Create Custom Role
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Role ID (Internal) *</label>
                <input 
                  type="text" placeholder="e.g. quality_control"
                  value={newRoleName} onChange={e => setNewRoleName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Display Label *</label>
                <input 
                  type="text" placeholder="e.g. Quality Control"
                  value={newRoleLabel} onChange={e => setNewRoleLabel(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-4">Permissions *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availablePermissions.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-primary cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={newRolePermissions.includes(p.id)}
                        onChange={() => togglePermission(p.id)}
                        className="peer appearance-none w-4 h-4 border border-surface-variant rounded-sm checked:bg-primary checked:border-primary cursor-pointer transition-colors"
                      />
                      <div className="pointer-events-none absolute text-surface opacity-0 peer-checked:opacity-100 transition-opacity">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                    <span className="group-hover:text-primary/80 transition-colors">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <button 
                onClick={handleAddRole} disabled={isSubmittingRole}
                className="bg-primary text-surface px-6 py-3 hover:bg-tertiary transition-colors disabled:opacity-50"
              >
                Create Role
              </button>
            </div>
          </div>

          <div className="border border-surface-variant bg-surface-container-lowest">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface border-b border-surface-variant">
                <tr>
                  <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Role</th>
                  <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Internal ID</th>
                  <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider">Permissions</th>
                  <th className="px-6 py-4 font-medium text-on-surface-variant uppercase text-[10px] tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {roles.map(role => (
                  <tr key={role._id} className="hover:bg-surface/50">
                    <td className="px-6 py-4 text-primary font-medium">
                      {role.label}
                      {role.isSystemRole && <span className="ml-2 bg-surface-variant text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">System</span>}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">{role.name}</td>
                    <td className="px-6 py-4 text-on-surface-variant text-xs">
                      {role.permissions.includes('all') ? 'Full Access' : role.permissions.join(', ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!role.isSystemRole && (
                        <button onClick={() => handleDeleteRole(role._id)} className="text-error hover:text-error/80 transition-colors p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
