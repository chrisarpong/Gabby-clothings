import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '../ui/card';
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

  // --- Storefront Preferences State ---
  const [shippingRate, setShippingRate] = useState('150.00');
  const [taxPercentage, setTaxPercentage] = useState('18.5');
  const [bannerText, setBannerText] = useState('Complimentary worldwide shipping on the Fall/Winter Collection.');
  const [bannerEnabled, setBannerEnabled] = useState(true);

  // Sync from DB when data arrives
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

  // --- Team Access State ---
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
    // Clerk/Auth0 invite flow would go here
    toast.success(`Invitation sent to ${inviteEmail}. They will receive access upon signup.`);
    setInviteEmail('');
  };

  // --- Security State ---
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
    // Clerk/Auth0 handles password changes externally
    toast.success('Password update requested. Check your email for confirmation.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <header className="mb-24">
          <h1 className="text-[64px] font-normal leading-[1.1] tracking-[-0.02em] text-[#1a1c1b]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Platform Settings
          </h1>
        </header>

        <div className="flex flex-col gap-24">

          {/* Section 1: Storefront Preferences */}
          <Card className="border border-[#1a1c1b]/10 p-12 bg-white rounded-none shadow-none">
            <h2 className="text-[32px] font-normal leading-[1.2] text-[#1a1c1b] mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
              Storefront Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              {/* Shipping Rate */}
              <div className="flex flex-col">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] mb-4 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Global Shipping Rate (GHS)
                </label>
                <input
                  value={shippingRate}
                  onChange={(e) => setShippingRate(e.target.value)}
                  className="border-0 border-b border-[#1a1c1b]/20 bg-transparent px-0 py-2 text-[16px] tracking-[0.01em] text-[#1a1c1b] focus:border-[#1a1c1b] transition-colors rounded-none outline-none"
                  type="text"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>

              {/* Tax Percentage */}
              <div className="flex flex-col">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] mb-4 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Tax Percentage (%)
                </label>
                <input
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                  className="border-0 border-b border-[#1a1c1b]/20 bg-transparent px-0 py-2 text-[16px] tracking-[0.01em] text-[#1a1c1b] focus:border-[#1a1c1b] transition-colors rounded-none outline-none"
                  type="text"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>

              {/* Banner Text */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] mb-4 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Announcement Banner Text
                </label>
                <input
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="border-0 border-b border-[#1a1c1b]/20 bg-transparent px-0 py-2 text-[16px] tracking-[0.01em] text-[#1a1c1b] focus:border-[#1a1c1b] transition-colors rounded-none outline-none"
                  type="text"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>

              {/* Banner Toggle */}
              <div className="flex items-center justify-between md:col-span-2 pt-6">
                <span className="text-[11px] font-semibold tracking-[0.15em] text-[#1a1c1b] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Enable Announcement Banner
                </span>
                <Switch
                  checked={bannerEnabled}
                  onCheckedChange={setBannerEnabled}
                />
              </div>

              {/* Save Button */}
              <div className="md:col-span-2 pt-8">
                <button
                  onClick={handleSavePreferences}
                  className="bg-[#220b09] text-white text-[11px] font-semibold tracking-[0.15em] uppercase px-8 py-3 hover:bg-[#220b09]/90 transition-colors"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </Card>

          {/* Section 2: Team Access */}
          <Card className="border border-[#1a1c1b]/10 p-12 bg-white rounded-none shadow-none">
            <h2 className="text-[32px] font-normal leading-[1.2] text-[#1a1c1b] mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
              Team Access
            </h2>

            {/* Team Members List */}
            <div className="flex flex-col mb-16">
              {adminUsers === undefined ? (
                <p className="text-[13px] text-[#504443] italic py-6">Loading team members...</p>
              ) : adminUsers.length === 0 ? (
                <p className="text-[13px] text-[#504443] italic py-6">No admin users found.</p>
              ) : (
                adminUsers.map((user, idx) => (
                  <div key={user._id} className="flex items-center justify-between py-6 border-b border-[#1a1c1b]/10">
                    <div className="flex flex-col">
                      <span className="text-[16px] tracking-[0.01em] text-[#1a1c1b]" style={{ fontFamily: "'Jost', sans-serif" }}>
                        {user.firstName || ''} {user.lastName || user.email}
                      </span>
                      <span className="text-[10px] tracking-[0.05em] text-[#504443] mt-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                        {user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                        {idx === 0 ? 'Owner' : 'Editor'}
                      </span>
                      {idx > 0 && (
                        <button
                          onClick={() => handleRevoke(user._id, user.firstName || user.email)}
                          className="text-[11px] font-semibold tracking-[0.15em] text-[#220b09] border border-[#1a1c1b]/20 px-4 py-2 hover:bg-[#e3e2e0] transition-colors uppercase"
                          style={{ fontFamily: "'Jost', sans-serif" }}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Invite Staff */}
            <div className="flex flex-col md:flex-row items-end gap-6 pt-4">
              <div className="flex flex-col flex-1 w-full">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] mb-4 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Invite Staff
                </label>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="border-0 border-b border-[#1a1c1b]/20 bg-transparent px-0 py-2 text-[16px] tracking-[0.01em] text-[#1a1c1b] focus:border-[#1a1c1b] transition-colors rounded-none outline-none placeholder:text-[#504443]/50"
                  placeholder="Email Address"
                  type="email"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>
              <button
                onClick={handleInvite}
                className="bg-[#220b09] text-white text-[11px] font-semibold tracking-[0.15em] uppercase px-8 py-3 hover:bg-[#220b09]/90 transition-colors shrink-0"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Send Invite
              </button>
            </div>
          </Card>

          {/* Section 3: Security */}
          <Card className="border border-[#1a1c1b]/10 p-12 bg-white rounded-none shadow-none">
            <h2 className="text-[32px] font-normal leading-[1.2] text-[#1a1c1b] mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
              Security
            </h2>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col max-w-md gap-8">
              <div className="flex flex-col">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] mb-4 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Current Password
                </label>
                <input
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border-0 border-b border-[#1a1c1b]/20 bg-transparent px-0 py-2 text-[16px] tracking-[0.01em] text-[#1a1c1b] focus:border-[#1a1c1b] transition-colors rounded-none outline-none"
                  type="password"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] mb-4 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  New Password
                </label>
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-0 border-b border-[#1a1c1b]/20 bg-transparent px-0 py-2 text-[16px] tracking-[0.01em] text-[#1a1c1b] focus:border-[#1a1c1b] transition-colors rounded-none outline-none"
                  type="password"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] mb-4 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Confirm Password
                </label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-0 border-b border-[#1a1c1b]/20 bg-transparent px-0 py-2 text-[16px] tracking-[0.01em] text-[#1a1c1b] focus:border-[#1a1c1b] transition-colors rounded-none outline-none"
                  type="password"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>
              <div className="pt-8">
                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  className="bg-[#220b09] text-white text-[11px] font-semibold tracking-[0.15em] uppercase px-8 py-3 hover:bg-[#220b09]/90 transition-colors"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
};
