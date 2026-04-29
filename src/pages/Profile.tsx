import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/react';
import { Input } from '../components/ui/input';
import { Button } from "../components/ui/button";
import { ImageUpload } from "../components/ui/image-upload";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user: clerkUser } = useUser();
  const profiles = useQuery(api.users.getMeasurementProfiles);
  const orders = useQuery(api.orders.getMyOrders);
  const navigate = useNavigate();
  const updateMeasurements = useMutation(api.users.updateMeasurements);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeProfileName, setActiveProfileName] = useState("Primary Profile");
  const [profileName, setProfileName] = useState("Primary Profile");

  const [measurements, setMeasurements] = useState({
    height: '', chest: '', waist: '', hips: '', shoulders: '', sleeveLength: '', inseam: '', neck: '', thigh: ''
  });

  // MASSIVELY SIMPLIFIED STATE
  const [fullBodyFile, setFullBodyFile] = useState<File | null>(null);
  const [inspoFile, setInspoFile] = useState<File | null>(null);

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      const selectedProfile = profiles.find(p => p.profileName === activeProfileName) || profiles[0];
      setProfileName(selectedProfile.profileName);
      setMeasurements({
        height: selectedProfile.height?.toString() || '', chest: selectedProfile.chest?.toString() || '', waist: selectedProfile.waist?.toString() || '',
        hips: selectedProfile.hips?.toString() || '', shoulders: selectedProfile.shoulders?.toString() || '', sleeveLength: selectedProfile.sleeveLength?.toString() || '',
        inseam: selectedProfile.inseam?.toString() || '', neck: selectedProfile.neck?.toString() || '', thigh: selectedProfile.thigh?.toString() || '',
      });
    } else {
      setProfileName("Primary Profile");
      setMeasurements({ height: '', chest: '', waist: '', hips: '', shoulders: '', sleeveLength: '', inseam: '', neck: '', thigh: '' });
    }
  }, [profiles, activeProfileName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setMeasurements({ ...measurements, [e.target.name]: e.target.value });

  const handleProfileSelect = (e: any) => {
    const selected = e.target.value;
    if (selected === "CREATE_NEW") {
      setActiveProfileName(""); setProfileName("");
      setMeasurements({ height: '', chest: '', waist: '', hips: '', shoulders: '', sleeveLength: '', inseam: '', neck: '', thigh: '' });
      setFullBodyFile(null); setInspoFile(null);
    } else setActiveProfileName(selected);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) { toast.error('Please provide a name for this profile.'); return; }
    setIsSaving(true);
    
    try {
      let fullBodyImageId = undefined; let inspoImageId = undefined;

      // CLEANED UP UPLOAD LOGIC
      if (fullBodyFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, { method: "POST", headers: { "Content-Type": fullBodyFile.type }, body: fullBodyFile });
        const { storageId } = await result.json();
        fullBodyImageId = storageId;
      }

      if (inspoFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, { method: "POST", headers: { "Content-Type": inspoFile.type }, body: inspoFile });
        const { storageId } = await result.json();
        inspoImageId = storageId;
      }

      await updateMeasurements({
        profileName: profileName.trim(),
        height: measurements.height ? parseFloat(measurements.height) : undefined, chest: measurements.chest ? parseFloat(measurements.chest) : undefined, waist: measurements.waist ? parseFloat(measurements.waist) : undefined,
        hips: measurements.hips ? parseFloat(measurements.hips) : undefined, shoulders: measurements.shoulders ? parseFloat(measurements.shoulders) : undefined, sleeveLength: measurements.sleeveLength ? parseFloat(measurements.sleeveLength) : undefined,
        inseam: measurements.inseam ? parseFloat(measurements.inseam) : undefined, neck: measurements.neck ? parseFloat(measurements.neck) : undefined, thigh: measurements.thigh ? parseFloat(measurements.thigh) : undefined,
        fullBodyImageId, inspoImageId,
      });

      setActiveProfileName(profileName.trim());
      toast.success('Measurements saved successfully.');
    } catch (error) {
      console.error("Failed to save:", error); toast.error('Failed to save. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!clerkUser) return <div className="p-20 text-center uppercase tracking-widest text-sm">Please log in.</div>;



  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center pt-32 pb-24 px-6 relative" style={{ fontFamily: "'Jost', sans-serif" }}>
      <div className="text-center mb-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#3a1f1d]/40 mb-3">Your Atelier</p>
        <h1 className="text-4xl md:text-5xl italic font-normal text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome back, {clerkUser.firstName}</h1>
      </div>
      <div className="h-10 md:h-14 w-full shrink-0" />
      
      <div className="w-full max-w-[860px] bg-white p-8 md:p-14 border border-[#3a1f1d]/8">
        <form onSubmit={handleSave} className="flex flex-col gap-10">
          <div>
            {profiles && profiles.length > 0 && (
              <div className="mb-12 max-w-[340px] mx-auto flex flex-col gap-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d]/40">Load Saved Profile</label>
                  <select value={activeProfileName || "CREATE_NEW"} onChange={handleProfileSelect} className="border border-[#3a1f1d]/12 px-5 py-3 h-[48px] rounded-none text-[14px] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#3a1f1d] w-full">
                    {profiles.map((p: any) => <option key={p._id} value={p.profileName}>{p.profileName}</option>)}
                    <option value="CREATE_NEW">+ Create New Profile</option>
                  </select>
                </div>
            )}
            
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-[#3a1f1d]/8" />
              <h2 className="text-[18px] italic text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>Body Measurements</h2>
              <div className="h-px flex-1 bg-[#3a1f1d]/8" />
            </div>
            <p className="text-[12px] text-[#3a1f1d]/40 text-center mb-10 uppercase tracking-[0.15em]">All measurements in inches</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-7">
              <div className="sm:col-span-2 md:col-span-3 flex flex-col gap-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d]/40 ml-1">Profile Name</label>
                <Input required name="profileName" value={profileName} onChange={(e: any) => setProfileName(e.target.value)} className="border border-[#3a1f1d]/12 h-[56px] px-5 rounded-none text-[14px] bg-transparent focus-visible:ring-1 focus-visible:ring-[#3a1f1d] w-full" />
              </div>
              {Object.keys(measurements).map((key) => (
                <div key={key} className="flex flex-col gap-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d]/40 ml-1">{key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</label>
                  <Input step="0.5" type="number" name={key} value={measurements[key as keyof typeof measurements]} onChange={handleChange as any} className="border border-[#3a1f1d]/12 h-[56px] px-5 rounded-none text-[14px] bg-transparent focus-visible:ring-1 focus-visible:ring-[#3a1f1d] w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 mt-8 border-t border-[#3a1f1d]/8">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-[#3a1f1d]/8" />
              <h2 className="text-[18px] italic text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>Reference Photography</h2>
              <div className="h-px flex-1 bg-[#3a1f1d]/8" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* BRAND NEW IMAGE UPLOADERS INSTALLED */}
              <ImageUpload 
                title={<>Full Body Scale <span className="text-red-600">*</span></>}
                hint="Mandatory for tailored fit reference (PNG/JPG)"
                onChange={setFullBodyFile}
              />
              <ImageUpload 
                title="Design Inspiration"
                hint="Optional: What do you want us to sew? (PNG/JPG)"
                onChange={setInspoFile}
              />
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Button type="submit" disabled={isSaving} className="h-[58px] px-16 bg-[#3a1f1d] hover:bg-black text-[#F9F8F6] text-[12px] uppercase tracking-[0.25em] rounded-none shadow-none transition-colors" style={{ fontWeight: 'normal' }}>
              {isSaving ? 'Saving...' : 'Save Measurements'}
            </Button>
          </div>
        </form>
      </div>

      <div className="w-full max-w-[860px] mt-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-[#3a1f1d]/8" />
          <h2 className="text-[18px] italic text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>Order History</h2>
          <div className="h-px flex-1 bg-[#3a1f1d]/8" />
        </div>

        {orders === undefined ? (
          <div className="py-16 text-center text-[12px] opacity-40 uppercase tracking-[0.2em]">Loading your orders…</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center bg-white border border-[#3a1f1d]/8">
            <p className="text-[14px] text-[#3a1f1d]/50 mb-8" style={{ fontFamily: "'Jost', sans-serif" }}>You haven’t placed any orders yet.</p>
            <Button onClick={() => navigate("/shop")} variant="outline" className="border-[#3a1f1d] text-[#3a1f1d] rounded-none hover:bg-[#3a1f1d] hover:text-white h-[50px] px-10 uppercase tracking-[0.2em] text-[11px] shadow-none">
              Shop Collection
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const statusColors: Record<string, string> = {
                pending: 'bg-amber-50 text-amber-700 border-amber-200',
                processing: 'bg-blue-50 text-blue-700 border-blue-200',
                shipped: 'bg-violet-50 text-violet-700 border-violet-200',
                completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                cancelled: 'bg-red-50 text-red-600 border-red-200',
              };
              const badgeClass = statusColors[order.status] || 'bg-gray-50 text-gray-600 border-gray-200';
              
              return (
                <div key={order._id} className="bg-white border border-[#3a1f1d]/8 p-7 md:p-8 group hover:border-[#3a1f1d]/20 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-[13px] font-mono text-[#3a1f1d]/60">#{order.paystackReference.slice(-8).toUpperCase()}</span>
                        <span className={`text-[10px] uppercase tracking-[0.15em] px-3 py-1 border ${badgeClass}`}>{order.status}</span>
                      </div>
                      <p className="text-[13px] text-[#3a1f1d]/50">
                        {new Date(order._creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col md:items-end gap-1">
                      <span className="text-[20px] font-normal text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>GH₵ {order.totalAmount.toFixed(2)}</span>
                      <span className="text-[11px] text-[#3a1f1d]/40 uppercase tracking-[0.15em]">{order.items.length} {order.items.length === 1 ? 'piece' : 'pieces'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
