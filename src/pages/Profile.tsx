import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/react';
import { TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Button } from "../components/ui/Button";
import { ImageUpload } from "../components/ui/image-upload";
import { toast } from "sonner";

const Profile = () => {
  const { user: clerkUser } = useUser();
  const profiles = useQuery(api.users.getMeasurementProfiles);
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
    if (!profileName.trim()) { toast.error("Please provide a name for this profile."); return; }
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
      toast.success("Profile successfully saved to your catalogue.");
    } catch (error) {
      console.error("Failed to save:", error); toast.error("Failed to save profile. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!clerkUser) return <div className="p-20 text-center uppercase tracking-widest text-sm">Please log in.</div>;

  const muiBrandStyles = { '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#3a1f1d' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#3a1f1d' } };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-16 px-6 relative">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl italic font-medium text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome back, {clerkUser.firstName}</h1>
      </div>
      <div className="h-8 md:h-12 w-full shrink-0"></div>
      
      <div className="w-full max-w-[800px] bg-white">
        <form onSubmit={handleSave} className="flex flex-col gap-10">
          <div>
            {profiles && profiles.length > 0 && (
              <div className="mb-10 max-w-[300px] mx-auto">
                <FormControl fullWidth variant="outlined" sx={muiBrandStyles}>
                  <InputLabel id="profile-select-label">LOAD SAVED PROFILE</InputLabel>
                  <Select labelId="profile-select-label" value={activeProfileName || "CREATE_NEW"} onChange={handleProfileSelect} label="LOAD SAVED PROFILE">
                    {profiles.map((p: any) => <MenuItem key={p._id} value={p.profileName}>{p.profileName}</MenuItem>)}
                    <MenuItem value="CREATE_NEW" sx={{ fontStyle: 'italic', opacity: 0.7 }}>+ Create New Profile</MenuItem>
                  </Select>
                </FormControl>
              </div>
            )}
            <h2 className="text-[13px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d] mb-10 text-center">Menswear Measurements <span className="opacity-50 text-[10px]">(INCHES)</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="sm:col-span-2 md:col-span-3">
                <TextField fullWidth variant="outlined" label="PROFILE NAME (e.g. Primary Profile, Wedding Suit)" name="profileName" value={profileName} onChange={(e) => setProfileName(e.target.value)} sx={muiBrandStyles} required />
              </div>
              {Object.keys(measurements).map((key) => (
                <TextField {...({ inputProps: { step: "0.5" } } as any)} key={key} fullWidth variant="outlined" label={key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()} type="number" name={key} value={measurements[key as keyof typeof measurements]} onChange={handleChange} sx={muiBrandStyles} />
              ))}
            </div>
          </div>

          <div className="pt-6">
            <h2 className="text-[13px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d] mb-10 text-center">Reference Photography</h2>
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

          <div className="mt-6 flex justify-center">
            <Button color="primary" size="xl" type="submit" disabled={isSaving} style={{ backgroundColor: '#3a1f1d', borderColor: '#3a1f1d', color: '#ffffff', padding: '1rem 4rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              {isSaving ? 'Saving...' : 'Save Measurements'}
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Profile;