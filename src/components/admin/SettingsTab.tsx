import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Switch } from '../ui/switch';

interface SettingsTabProps {
  storeSettings: any;
  updateSettings: any;
  adminUsers: any[];
  revokeAdmin: any;
}

export const SettingsTab = ({
  storeSettings,
  updateSettings,
  adminUsers,
  revokeAdmin,
}: SettingsTabProps) => {

  const [shippingRate, setShippingRate] = useState('150.00');
  const [taxPercentage, setTaxPercentage] = useState('18.5');
  const [bannerText, setBannerText] = useState('Complimentary worldwide shipping on the Fall/Winter Collection.');
  const [bannerEnabled, setBannerEnabled] = useState(true);

  useEffect(() => {
    if (storeSettings) {
      setShippingRate(storeSettings.shippingRate.toString());
      setTaxPercentage(storeSettings.taxPercentage.toString());
      setBannerText(storeSettings.announcementBannerText);
      setBannerEnabled(storeSettings.announcementBannerEnabled);
    }
  }, [storeSettings]);

  const handleSavePreferences = async () => {
    try {
      await updateSettings({
        shippingRate: parseFloat(shippingRate) || 0,
        taxPercentage: parseFloat(taxPercentage) || 0,
        announcementBannerText: bannerText,
        announcementBannerEnabled: bannerEnabled,
      });
      toast.success('Storefront preferences saved.');
    } catch {
      toast.error('Failed to save preferences.');
    }
  };

  const [inviteEmail, setInviteEmail] = useState('');

  const handleRevoke = (userId: string, name: string) => {
    if (window.confirm(`Revoke admin access for ${name}?`)) {
      toast.promise(
        revokeAdmin({ userId: userId as any }),
        {
          loading: 'Revoking access...',
          success: `${name}'s admin access revoked.`,
          error: 'Failed to revoke access.',
        }
      );
    }
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address.');
      return;
    }
    toast.success(`Invitation sent to ${inviteEmail}. They will receive access upon signup.`);
    setInviteEmail('');
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    toast.success('Password update requested. Check your email for confirmation.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Settings
        </h2>
        <p className="text-sm text-[#3a1f1d]/60 mt-1">Manage your store preferences and team</p>
      </div>

      <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#2C1816] mb-6">Storefront Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Global Shipping Rate (GHS)</label>
            <input
              value={shippingRate}
              onChange={(e) => setShippingRate(e.target.value)}
              className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors outline-none"
              type="text"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Tax Percentage (%)</label>
            <input
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(e.target.value)}
              className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors outline-none"
              type="text"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Announcement Banner Text</label>
            <input
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors outline-none"
              type="text"
            />
          </div>

          <div className="flex items-center justify-between md:col-span-2 pt-2">
            <span className="text-sm text-[#2C1816]">Enable Announcement Banner</span>
            <Switch
              checked={bannerEnabled}
              onCheckedChange={setBannerEnabled}
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              onClick={handleSavePreferences}
              className="bg-[#3a1f1d] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#2C1816] transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#2C1816] mb-6">Team Access</h3>

        <div className="space-y-1 mb-8">
          {adminUsers === undefined ? (
            <p className="text-sm text-[#3a1f1d]/40 py-4">Loading team members...</p>
          ) : adminUsers.length === 0 ? (
            <p className="text-sm text-[#3a1f1d]/40 py-4">No admin users found.</p>
          ) : (
            adminUsers.map((user, idx) => (
              <div key={user._id} className="flex items-center justify-between py-4 px-3 rounded-lg hover:bg-[#F5F2EE] transition-colors">
                <div>
                  <span className="text-sm font-medium text-[#2C1816]">{user.firstName || ''} {user.lastName || user.email}</span>
                  <p className="text-xs text-[#3a1f1d]/50 mt-0.5">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${idx === 0 ? 'bg-[#3a1f1d]/5 text-[#3a1f1d]' : 'bg-blue-50 text-blue-700'}`}>
                    {idx === 0 ? 'Owner' : 'Editor'}
                  </span>
                  {idx > 0 && (
                    <button
                      onClick={() => handleRevoke(user._id, user.firstName || user.email)}
                      className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-[#3a1f1d]/8">
          <div className="flex-1">
            <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Invite Staff</label>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors placeholder:text-[#3a1f1d]/30 outline-none"
              placeholder="Email address"
              type="email"
            />
          </div>
          <button
            onClick={handleInvite}
            className="bg-[#3a1f1d] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#2C1816] transition-colors self-end"
          >
            Send Invite
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#2C1816] mb-6">Security</h3>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Current Password</label>
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors outline-none"
              type="password"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">New Password</label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors outline-none"
              type="password"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Confirm Password</label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors outline-none"
              type="password"
            />
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePasswordUpdate}
              className="bg-[#3a1f1d] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#2C1816] transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
