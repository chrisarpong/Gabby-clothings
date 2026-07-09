import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { 
  Save, Store, DollarSign, Clock, Monitor, Bell, 
  ChevronRight, Check, AlertTriangle, Globe, Truck,
  Receipt, Shield, Megaphone, Search, Mail, Phone,
  MapPin, Instagram, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';

// ─── Sub-navigation tabs ───
type SettingsSection = 'general' | 'commerce' | 'currency' | 'appointments' | 'storefront' | 'notifications';

const SECTIONS: { key: SettingsSection; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'general', label: 'General', icon: Store, description: 'Store identity & contact info' },
  { key: 'commerce', label: 'Commerce', icon: DollarSign, description: 'Shipping, deposits & pricing' },
  { key: 'currency', label: 'Currency', icon: Globe, description: 'Exchange rates & overrides' },
  { key: 'appointments', label: 'Appointments', icon: Clock, description: 'Availability & scheduling' },
  { key: 'storefront', label: 'Storefront', icon: Monitor, description: 'Display, banners & SEO' },
  { key: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts & thresholds' },
];

// ─── Reusable field components ───
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">{children}</label>;
}

function FieldInput({ value, onChange, type = 'text', placeholder, step, disabled }: {
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      step={step}
      disabled={disabled}
      className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm text-primary focus:outline-none focus:border-surface-variant focus:ring-1 focus:ring-surface-variant transition-all placeholder:text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
    />
  );
}

function FieldTextarea({ value, onChange, placeholder, rows = 3 }: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm text-primary focus:outline-none focus:border-surface-variant focus:ring-1 focus:ring-surface-variant transition-all placeholder:text-on-surface-variant resize-none"
    />
  );
}

function Toggle({ enabled, onChange, dangerous }: { enabled: boolean; onChange: () => void; dangerous?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-12 h-6 rounded-full flex items-center transition-colors duration-300 shrink-0 ${
        enabled
          ? dangerous ? 'bg-red-600' : 'bg-emerald-600'
          : 'bg-surface-variant'
      }`}
    >
      <span className={`block w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm transform transition-transform duration-300 ${
        enabled ? 'translate-x-[26px]' : 'translate-x-[2px]'
      }`} />
    </button>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest border border-surface-variant p-6 sm:p-8 mb-6">
      <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-1">{title}</h3>
      {description && <p className="text-xs text-on-surface-variant mb-6">{description}</p>}
      {!description && <div className="mb-6" />}
      {children}
    </div>
  );
}

// ─── Main Component ───
export default function SettingsTab() {
  const settingsRecords = useQuery(api.settings.getAll);
  const dbRates = useQuery(api.currency.getRates);
  const setSetting = useMutation(api.settings.setSetting);

  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ─── Form State ───
  const [storeInfo, setStoreInfo] = useState({
    storeName: 'Gabby Newluk',
    contactEmail: '',
    phone: '',
    whatsapp: '',
    street: '',
    city: 'Accra',
    country: 'Ghana',
    instagram: '',
  });

  const [commerce, setCommerce] = useState({
    standardShippingRate: 50,
    bookingDepositAmount: 500,
    freeShippingThreshold: 0,
    taxRate: 0,
    returnWindowDays: 14,
  });

  const [currencySettings, setCurrencySettings] = useState({
    safetyBufferPercentage: 5,
    manualRates: {} as Record<string, string>,
  });

  const [availability, setAvailability] = useState({
    workingDays: [1, 2, 3, 4, 5],
    startHour: '09:00',
    endHour: '17:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    bufferTime: 30,
    maxAppointmentsPerDay: 8,
  });

  const [storefront, setStorefront] = useState({
    maintenanceMode: false,
    isBannerActive: true,
    announcementBannerText: 'Complimentary shipping on all custom suiting orders.',
    bannerStyle: 'default' as 'default' | 'promo' | 'urgent',
    seoTitle: 'Gabby Newluk — Premium African Fashion',
    seoDescription: 'Handcrafted kaftans, agbadas, and custom-fit suiting. Crafted in Accra, worn globally.',
  });

  const [notifications, setNotifications] = useState({
    lowStockThreshold: 5,
    orderConfirmationEmail: true,
    adminNotificationEmail: '',
  });

  // ─── Sync DB → Local State ───
  useEffect(() => {
    if (!settingsRecords) return;
    const db: Record<string, any> = {};
    settingsRecords.forEach((r: Doc<"settings">) => { db[r.key] = r.value; });

    // Store Info
    if (db.storeInfo) {
      setStoreInfo(prev => ({ ...prev, ...db.storeInfo }));
    } else {
      // Fallback: read legacy flat keys
      setStoreInfo(prev => ({
        ...prev,
        storeName: db.storeName ?? prev.storeName,
        contactEmail: db.contactEmail ?? prev.contactEmail,
      }));
    }

    // Commerce
    setCommerce(prev => ({
      ...prev,
      standardShippingRate: db.standardShippingRate ?? prev.standardShippingRate,
      bookingDepositAmount: db.bookingDepositAmount ?? prev.bookingDepositAmount,
      freeShippingThreshold: db.freeShippingThreshold ?? prev.freeShippingThreshold,
      taxRate: db.taxRate ?? prev.taxRate,
      returnWindowDays: db.returnWindowDays ?? prev.returnWindowDays,
    }));

    // Currency
    const manualRates: Record<string, string> = {};
    SUPPORTED_CURRENCIES.filter(c => c !== 'GHS').forEach(curr => {
      const key = `manualRate${curr}`;
      if (db[key] !== undefined && db[key] !== null && db[key] !== '') {
        manualRates[curr] = String(db[key]);
      }
    });
    setCurrencySettings(prev => ({
      ...prev,
      safetyBufferPercentage: db.safetyBufferPercentage ?? prev.safetyBufferPercentage,
      manualRates,
    }));

    // Availability
    if (db.availability) {
      setAvailability(prev => ({ ...prev, ...db.availability }));
    }

    // Storefront
    setStorefront(prev => ({
      ...prev,
      maintenanceMode: db.maintenanceMode ?? prev.maintenanceMode,
      isBannerActive: db.isBannerActive ?? prev.isBannerActive,
      announcementBannerText: db.announcementBannerText ?? prev.announcementBannerText,
      bannerStyle: db.bannerStyle ?? prev.bannerStyle,
      seoTitle: db.seoDefaults?.title ?? prev.seoTitle,
      seoDescription: db.seoDefaults?.description ?? prev.seoDescription,
    }));

    // Notifications
    setNotifications(prev => ({
      ...prev,
      lowStockThreshold: db.lowStockThreshold ?? prev.lowStockThreshold,
      orderConfirmationEmail: db.orderConfirmationEmail ?? prev.orderConfirmationEmail,
      adminNotificationEmail: db.adminNotificationEmail ?? prev.adminNotificationEmail,
    }));
  }, [settingsRecords]);

  // Track unsaved changes
  const markChanged = () => setHasUnsavedChanges(true);

  // ─── Save per section ───
  const saveSection = async (section: SettingsSection) => {
    setIsSaving(true);
    try {
      const updates: { key: string; value: any }[] = [];

      switch (section) {
        case 'general':
          updates.push({ key: 'storeInfo', value: storeInfo });
          // Also save flat keys for backward compat
          updates.push({ key: 'storeName', value: storeInfo.storeName });
          updates.push({ key: 'contactEmail', value: storeInfo.contactEmail });
          break;
        case 'commerce':
          updates.push({ key: 'standardShippingRate', value: commerce.standardShippingRate });
          updates.push({ key: 'bookingDepositAmount', value: commerce.bookingDepositAmount });
          updates.push({ key: 'freeShippingThreshold', value: commerce.freeShippingThreshold });
          updates.push({ key: 'taxRate', value: commerce.taxRate });
          updates.push({ key: 'returnWindowDays', value: commerce.returnWindowDays });
          break;
        case 'currency':
          updates.push({ key: 'safetyBufferPercentage', value: currencySettings.safetyBufferPercentage });
          SUPPORTED_CURRENCIES.filter(c => c !== 'GHS').forEach(curr => {
            const val = currencySettings.manualRates[curr];
            updates.push({ key: `manualRate${curr}`, value: val && val !== '' ? val : '' });
          });
          break;
        case 'appointments':
          updates.push({ key: 'availability', value: availability });
          break;
        case 'storefront':
          updates.push({ key: 'maintenanceMode', value: storefront.maintenanceMode });
          updates.push({ key: 'isBannerActive', value: storefront.isBannerActive });
          updates.push({ key: 'announcementBannerText', value: storefront.announcementBannerText });
          updates.push({ key: 'bannerStyle', value: storefront.bannerStyle });
          updates.push({ key: 'seoDefaults', value: { title: storefront.seoTitle, description: storefront.seoDescription } });
          break;
        case 'notifications':
          updates.push({ key: 'lowStockThreshold', value: notifications.lowStockThreshold });
          updates.push({ key: 'orderConfirmationEmail', value: notifications.orderConfirmationEmail });
          updates.push({ key: 'adminNotificationEmail', value: notifications.adminNotificationEmail });
          break;
      }

      await Promise.all(updates.map(u => setSetting(u)));
      toast.success(`${SECTIONS.find(s => s.key === section)?.label} settings saved.`);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Loading State ───
  if (settingsRecords === undefined) {
    return (
      <div className="flex flex-col h-full bg-surface">
        <div className="flex justify-center items-center py-20 text-on-surface-variant text-sm">
          Loading settings...
        </div>
      </div>
    );
  }

  // ─── Render Sections ───
  const renderGeneral = () => (
    <>
      <SectionCard title="Store Identity" description="Your brand name and primary business information.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FieldLabel>Store Name</FieldLabel>
            <FieldInput value={storeInfo.storeName} onChange={v => { setStoreInfo(p => ({...p, storeName: v})); markChanged(); }} placeholder="Gabby Newluk" />
          </div>
          <div>
            <FieldLabel>Contact Email</FieldLabel>
            <FieldInput value={storeInfo.contactEmail} onChange={v => { setStoreInfo(p => ({...p, contactEmail: v})); markChanged(); }} type="email" placeholder="hello@gabbynewluk.com" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contact Details" description="Displayed on your storefront footer, invoice, and contact page.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FieldLabel><Phone className="w-3 h-3 inline mr-1" />Phone Number</FieldLabel>
            <FieldInput value={storeInfo.phone} onChange={v => { setStoreInfo(p => ({...p, phone: v})); markChanged(); }} placeholder="+233 (0) 55 123 4567" />
          </div>
          <div>
            <FieldLabel><MessageCircle className="w-3 h-3 inline mr-1" />WhatsApp Number</FieldLabel>
            <FieldInput value={storeInfo.whatsapp} onChange={v => { setStoreInfo(p => ({...p, whatsapp: v})); markChanged(); }} placeholder="+233551234567" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Store Address" description="Used in your invoice, footer, and shipping correspondence.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <FieldLabel><MapPin className="w-3 h-3 inline mr-1" />Street Address</FieldLabel>
            <FieldInput value={storeInfo.street} onChange={v => { setStoreInfo(p => ({...p, street: v})); markChanged(); }} placeholder="123 Fashion Avenue, East Legon" />
          </div>
          <div>
            <FieldLabel>City</FieldLabel>
            <FieldInput value={storeInfo.city} onChange={v => { setStoreInfo(p => ({...p, city: v})); markChanged(); }} placeholder="Accra" />
          </div>
          <div>
            <FieldLabel>Country</FieldLabel>
            <FieldInput value={storeInfo.country} onChange={v => { setStoreInfo(p => ({...p, country: v})); markChanged(); }} placeholder="Ghana" />
          </div>
          <div>
            <FieldLabel><Instagram className="w-3 h-3 inline mr-1" />Instagram URL</FieldLabel>
            <FieldInput value={storeInfo.instagram} onChange={v => { setStoreInfo(p => ({...p, instagram: v})); markChanged(); }} placeholder="https://instagram.com/gabbynewluk" />
          </div>
        </div>
      </SectionCard>
    </>
  );

  const renderCommerce = () => (
    <>
      <SectionCard title="Shipping" description="Control shipping fees across the storefront.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FieldLabel><Truck className="w-3 h-3 inline mr-1" />Standard Shipping Rate (GH₵)</FieldLabel>
            <FieldInput type="number" value={commerce.standardShippingRate} onChange={v => { setCommerce(p => ({...p, standardShippingRate: parseFloat(v) || 0})); markChanged(); }} />
            <p className="text-[10px] text-on-surface-variant mt-1.5">Applied to all orders at checkout.</p>
          </div>
          <div>
            <FieldLabel>Free Shipping Threshold (GH₵)</FieldLabel>
            <FieldInput type="number" value={commerce.freeShippingThreshold} onChange={v => { setCommerce(p => ({...p, freeShippingThreshold: parseFloat(v) || 0})); markChanged(); }} placeholder="0 = disabled" />
            <p className="text-[10px] text-on-surface-variant mt-1.5">Orders above this amount get free shipping. Set to 0 to disable.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Pricing & Deposits" description="Booking deposits and tax configuration.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <FieldLabel><Receipt className="w-3 h-3 inline mr-1" />Booking Deposit (GH₵)</FieldLabel>
            <FieldInput type="number" value={commerce.bookingDepositAmount} onChange={v => { setCommerce(p => ({...p, bookingDepositAmount: parseFloat(v) || 0})); markChanged(); }} />
            <p className="text-[10px] text-on-surface-variant mt-1.5">Required deposit for appointments & custom tailoring.</p>
          </div>
          <div>
            <FieldLabel>Tax Rate (%)</FieldLabel>
            <FieldInput type="number" value={commerce.taxRate} onChange={v => { setCommerce(p => ({...p, taxRate: parseFloat(v) || 0})); markChanged(); }} placeholder="0" step="0.5" />
            <p className="text-[10px] text-on-surface-variant mt-1.5">Set to 0 if no tax is charged.</p>
          </div>
          <div>
            <FieldLabel><Shield className="w-3 h-3 inline mr-1" />Return Window (Days)</FieldLabel>
            <FieldInput type="number" value={commerce.returnWindowDays} onChange={v => { setCommerce(p => ({...p, returnWindowDays: parseInt(v) || 0})); markChanged(); }} />
            <p className="text-[10px] text-on-surface-variant mt-1.5">Displayed on product pages and policies.</p>
          </div>
        </div>
      </SectionCard>
    </>
  );

  const renderCurrency = () => {
    const currencies = SUPPORTED_CURRENCIES.filter(c => c !== 'GHS');
    return (
      <>
        <SectionCard title="Exchange Rate Buffer" description="A percentage added to live rates to protect against rapid fluctuations.">
          <div className="max-w-xs">
            <FieldLabel>Safety Buffer (%)</FieldLabel>
            <FieldInput type="number" value={currencySettings.safetyBufferPercentage} onChange={v => { setCurrencySettings(p => ({...p, safetyBufferPercentage: parseFloat(v) || 0})); markChanged(); }} step="0.5" />
            <p className="text-[10px] text-on-surface-variant mt-1.5">Applied to all live-fetched rates. Set to 0 to use raw live rates.</p>
          </div>
        </SectionCard>

        <SectionCard title="Manual Rate Overrides" description="Override live rates with fixed values. Leave blank to use live rates. Values represent GHS → Currency rate.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            {currencies.map(curr => {
              const liveRate = dbRates?.[curr];
              return (
                <div key={curr}>
                  <FieldLabel>{curr} Rate</FieldLabel>
                  <FieldInput
                    type="number"
                    step="0.000001"
                    value={currencySettings.manualRates[curr] ?? ''}
                    onChange={v => {
                      setCurrencySettings(p => ({
                        ...p,
                        manualRates: { ...p.manualRates, [curr]: v },
                      }));
                      markChanged();
                    }}
                    placeholder={liveRate ? `Live: ${liveRate.toFixed(6)}` : 'Not fetched'}
                  />
                  {liveRate !== undefined && (
                    <p className="text-[10px] text-on-surface-variant mt-1">
                      Live rate: <span className="font-mono font-medium text-on-surface-variant">{liveRate.toFixed(6)}</span>
                      {currencySettings.manualRates[curr] && (
                        <span className="ml-2 text-amber-600 font-bold">• Override active</span>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      </>
    );
  };

  const renderAppointments = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <>
        <SectionCard title="Working Days" description="Select which days your studio accepts appointments.">
          <div className="flex flex-wrap gap-3">
            {[0, 1, 2, 3, 4, 5, 6].map(day => {
              const isActive = availability.workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const newDays = isActive
                      ? availability.workingDays.filter(d => d !== day)
                      : [...availability.workingDays, day];
                    setAvailability(p => ({ ...p, workingDays: newDays }));
                    markChanged();
                  }}
                  className={`px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all border ${
                    isActive
                      ? 'bg-primary text-surface border-primary'
                      : 'bg-surface-container-lowest text-on-surface-variant border-surface-variant hover:border-outline-variant'
                  }`}
                >
                  {dayNames[day]}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Operating Hours" description="Set your daily start and end times, and optional lunch break.">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <FieldLabel>Start Time</FieldLabel>
              <FieldInput type="time" value={availability.startHour} onChange={v => { setAvailability(p => ({...p, startHour: v})); markChanged(); }} />
            </div>
            <div>
              <FieldLabel>End Time</FieldLabel>
              <FieldInput type="time" value={availability.endHour} onChange={v => { setAvailability(p => ({...p, endHour: v})); markChanged(); }} />
            </div>
            <div>
              <FieldLabel>Lunch Start</FieldLabel>
              <FieldInput type="time" value={availability.lunchStart} onChange={v => { setAvailability(p => ({...p, lunchStart: v})); markChanged(); }} />
            </div>
            <div>
              <FieldLabel>Lunch End</FieldLabel>
              <FieldInput type="time" value={availability.lunchEnd} onChange={v => { setAvailability(p => ({...p, lunchEnd: v})); markChanged(); }} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Scheduling Rules" description="Fine-tune your booking capacity.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FieldLabel>Buffer Between Appointments (Minutes)</FieldLabel>
              <div className="flex gap-2">
                {[0, 15, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => { setAvailability(p => ({...p, bufferTime: mins})); markChanged(); }}
                    className={`flex-1 py-2.5 text-xs font-bold tracking-wider transition-all border ${
                      availability.bufferTime === mins
                        ? 'bg-primary text-surface border-primary'
                        : 'bg-surface-container-lowest text-on-surface-variant border-surface-variant hover:border-outline-variant'
                    }`}
                  >
                    {mins === 0 ? 'None' : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Max Appointments Per Day</FieldLabel>
              <FieldInput type="number" value={availability.maxAppointmentsPerDay} onChange={v => { setAvailability(p => ({...p, maxAppointmentsPerDay: parseInt(v) || 1})); markChanged(); }} />
              <p className="text-[10px] text-on-surface-variant mt-1.5">Prevents overbooking beyond this limit.</p>
            </div>
          </div>
        </SectionCard>
      </>
    );
  };

  const renderStorefront = () => (
    <>
      <SectionCard title="Maintenance Mode" description="Take your storefront offline. Only admins can bypass this.">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${storefront.maintenanceMode ? 'text-red-500' : 'text-on-surface-variant'}`} />
            <div>
              <p className="text-sm font-medium text-primary">
                {storefront.maintenanceMode ? 'Store is OFFLINE' : 'Store is live'}
              </p>
              <p className="text-[10px] text-on-surface-variant">
                {storefront.maintenanceMode ? 'Visitors see a maintenance page.' : 'Customers can browse and shop normally.'}
              </p>
            </div>
          </div>
          <Toggle
            enabled={storefront.maintenanceMode}
            onChange={() => { setStorefront(p => ({...p, maintenanceMode: !p.maintenanceMode})); markChanged(); }}
            dangerous
          />
        </div>
      </SectionCard>

      <SectionCard title="Announcement Banner" description="Display a global message at the top of the website.">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-primary">Banner {storefront.isBannerActive ? 'Active' : 'Hidden'}</p>
          </div>
          <Toggle
            enabled={storefront.isBannerActive}
            onChange={() => { setStorefront(p => ({...p, isBannerActive: !p.isBannerActive})); markChanged(); }}
          />
        </div>
        <div className={`space-y-4 transition-opacity ${storefront.isBannerActive ? '' : 'opacity-30 pointer-events-none'}`}>
          <div>
            <FieldLabel>Banner Text</FieldLabel>
            <FieldInput
              value={storefront.announcementBannerText}
              onChange={v => { setStorefront(p => ({...p, announcementBannerText: v})); markChanged(); }}
              placeholder="Enter your announcement..."
            />
          </div>
          <div>
            <FieldLabel>Banner Style</FieldLabel>
            <div className="flex gap-2">
              {(['default', 'promo', 'urgent'] as const).map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => { setStorefront(p => ({...p, bannerStyle: style})); markChanged(); }}
                  className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-all border ${
                    storefront.bannerStyle === style
                      ? style === 'urgent' ? 'bg-red-600 text-white border-red-600' : style === 'promo' ? 'bg-amber-600 text-white border-amber-600' : 'bg-primary text-surface border-primary'
                      : 'bg-surface-container-lowest text-on-surface-variant border-surface-variant hover:border-outline-variant'
                  }`}
                >
                  {style === 'default' ? 'Standard' : style === 'promo' ? 'Promo (Gold)' : 'Urgent (Red)'}
                </button>
              ))}
            </div>
          </div>
          {/* Live Preview */}
          <div>
            <FieldLabel>Preview</FieldLabel>
            <div className={`text-xs tracking-widest uppercase text-center py-2.5 px-4 font-bold ${
              storefront.bannerStyle === 'urgent' ? 'bg-red-700 text-white' : storefront.bannerStyle === 'promo' ? 'bg-amber-700 text-white' : 'bg-primary text-surface'
            }`}>
              {storefront.announcementBannerText || 'Your announcement text here...'}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="SEO Defaults" description="Fallback meta tags for pages without custom SEO settings.">
        <div className="space-y-5">
          <div>
            <FieldLabel><Search className="w-3 h-3 inline mr-1" />Default Page Title</FieldLabel>
            <FieldInput value={storefront.seoTitle} onChange={v => { setStorefront(p => ({...p, seoTitle: v})); markChanged(); }} placeholder="Gabby Newluk — Premium African Fashion" />
          </div>
          <div>
            <FieldLabel>Default Meta Description</FieldLabel>
            <FieldTextarea value={storefront.seoDescription} onChange={v => { setStorefront(p => ({...p, seoDescription: v})); markChanged(); }} placeholder="A modern translation of rich sartorial heritage..." rows={2} />
          </div>
        </div>
      </SectionCard>
    </>
  );

  const renderNotifications = () => (
    <>
      <SectionCard title="Inventory Alerts" description="Get notified when stock runs low.">
        <div className="max-w-xs">
          <FieldLabel>Low Stock Alert Threshold</FieldLabel>
          <FieldInput type="number" value={notifications.lowStockThreshold} onChange={v => { setNotifications(p => ({...p, lowStockThreshold: parseInt(v) || 0})); markChanged(); }} />
          <p className="text-[10px] text-on-surface-variant mt-1.5">Variants with stock below this number will be flagged in Inventory.</p>
        </div>
      </SectionCard>

      <SectionCard title="Email Notifications" description="Control automated email behavior.">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Order Confirmation Emails</p>
              <p className="text-[10px] text-on-surface-variant">Automatically send a confirmation email when an order is placed.</p>
            </div>
            <Toggle
              enabled={notifications.orderConfirmationEmail}
              onChange={() => { setNotifications(p => ({...p, orderConfirmationEmail: !p.orderConfirmationEmail})); markChanged(); }}
            />
          </div>
          <div>
            <FieldLabel><Mail className="w-3 h-3 inline mr-1" />Admin Notification Email</FieldLabel>
            <FieldInput type="email" value={notifications.adminNotificationEmail} onChange={v => { setNotifications(p => ({...p, adminNotificationEmail: v})); markChanged(); }} placeholder="admin@gabbynewluk.com" />
            <p className="text-[10px] text-on-surface-variant mt-1.5">Receives alerts for new orders, low stock, and new appointment bookings.</p>
          </div>
        </div>
      </SectionCard>
    </>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general': return renderGeneral();
      case 'commerce': return renderCommerce();
      case 'currency': return renderCurrency();
      case 'appointments': return renderAppointments();
      case 'storefront': return renderStorefront();
      case 'notifications': return renderNotifications();
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-surface-variant bg-surface-container-lowest sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-primary tracking-tight">Settings</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              {SECTIONS.find(s => s.key === activeSection)?.description}
            </p>
          </div>
          <button
            onClick={() => saveSection(activeSection)}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-all disabled:opacity-50 ${
              hasUnsavedChanges
                ? 'bg-primary text-surface hover:bg-surface-variant shadow-lg'
                : 'bg-surface-variant text-on-surface-variant'
            }`}
          >
            {isSaving ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : hasUnsavedChanges ? (
              <><Save className="w-3.5 h-3.5" /> Save Changes</>
            ) : (
              <><Check className="w-3.5 h-3.5" /> Saved</>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Sub-nav */}
        <div className="hidden md:flex flex-col w-56 shrink-0 border-r border-surface-variant bg-surface-container-lowest py-4 overflow-y-auto">
          {SECTIONS.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex items-center gap-3 px-5 py-3 text-left transition-all w-full ${
                  isActive
                    ? 'bg-surface-variant text-primary border-r-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-xs font-semibold tracking-wide">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto border-b border-surface-variant bg-surface-container-lowest shrink-0 no-scrollbar">
          {SECTIONS.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-3xl">
            {renderActiveSection()}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Bar */}
      {hasUnsavedChanges && (
        <div className="sticky bottom-0 z-20 bg-amber-50 border-t border-amber-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide">You have unsaved changes</span>
          </div>
          <button
            onClick={() => saveSection(activeSection)}
            disabled={isSaving}
            className="bg-amber-700 text-white px-5 py-2 text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-amber-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Now'}
          </button>
        </div>
      )}
    </div>
  );
}
