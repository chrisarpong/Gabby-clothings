import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/react';
import { TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Button } from "../components/ui/Button";
import { FileUpload } from "../components/ui/FileUpload";

interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  fileObject: File;
}

// 1. New Smart Toast Type
interface ToastData {
  message: string;
  type: 'success' | 'error';
}

const Profile = () => {
  const { user: clerkUser } = useUser();
  const profiles = useQuery(api.users.getMeasurementProfiles);
  const updateMeasurements = useMutation(api.users.updateMeasurements);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  
  const [isSaving, setIsSaving] = useState(false);
  
  // 2. Updated Toast State
  const [toast, setToast] = useState<ToastData | null>(null);
  
  const [activeProfileName, setActiveProfileName] = useState("Primary Profile");
  const [profileName, setProfileName] = useState("Primary Profile");

  const [measurements, setMeasurements] = useState({
    height: '', chest: '', waist: '', hips: '', shoulders: '', sleeveLength: '', inseam: '', neck: '', thigh: ''
  });

  const [fullBodyFiles, setFullBodyFiles] = useState<FileData[]>([]);
  const [inspoFiles, setInspoFiles] = useState<FileData[]>([]);

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      const selectedProfile = profiles.find(p => p.profileName === activeProfileName) || profiles[0];
      
      setProfileName(selectedProfile.profileName);
      setMeasurements({
        height: selectedProfile.height?.toString() || '',
        chest: selectedProfile.chest?.toString() || '',
        waist: selectedProfile.waist?.toString() || '',
        hips: selectedProfile.hips?.toString() || '',
        shoulders: selectedProfile.shoulders?.toString() || '',
        sleeveLength: selectedProfile.sleeveLength?.toString() || '',
        inseam: selectedProfile.inseam?.toString() || '',
        neck: selectedProfile.neck?.toString() || '',
        thigh: selectedProfile.thigh?.toString() || '',
      });
    } else {
      setProfileName("Primary Profile");
      setMeasurements({ height: '', chest: '', waist: '', hips: '', shoulders: '', sleeveLength: '', inseam: '', neck: '', thigh: '' });
    }
  }, [profiles, activeProfileName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeasurements({ ...measurements, [e.target.name]: e.target.value });
  };

  const handleProfileSelect = (e: any) => {
    const selected = e.target.value;
    if (selected === "CREATE_NEW") {
      setActiveProfileName("");
      setProfileName("");
      setMeasurements({ height: '', chest: '', waist: '', hips: '', shoulders: '', sleeveLength: '', inseam: '', neck: '', thigh: '' });
      setFullBodyFiles([]);
      setInspoFiles([]);
    } else {
      setActiveProfileName(selected);
    }
  };

  const handleDropFullBody = (files: FileList) => {
    const file = files[0];
    if (file) setFullBodyFiles([{ id: 'fullbody-1', name: file.name, size: file.size, type: file.type, progress: 100, fileObject: file }]);
  };

  const handleDropInspo = (files: FileList) => {
    const file = files[0];
    if (file) setInspoFiles([{ id: 'inspo-1', name: file.name, size: file.size, type: file.type, progress: 100, fileObject: file }]);
  };

  // 3. Smart Toast Helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast(null); // Clear previous if rapid clicking
    setTimeout(() => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    }, 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast("Please provide a name for this profile.", "error");
      return;
    }

    setIsSaving(true);
    
    try {
      let fullBodyImageId = undefined;
      let inspoImageId = undefined;

      if (fullBodyFiles.length > 0 && fullBodyFiles[0].fileObject) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": fullBodyFiles[0].fileObject.type },
          body: fullBodyFiles[0].fileObject,
        });
        const { storageId } = await result.json();
        fullBodyImageId = storageId;
      }

      if (inspoFiles.length > 0 && inspoFiles[0].fileObject) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": inspoFiles[0].fileObject.type },
          body: inspoFiles[0].fileObject,
        });
        const { storageId } = await result.json();
        inspoImageId = storageId;
      }

      await updateMeasurements({
        profileName: profileName.trim(),
        height: measurements.height ? parseFloat(measurements.height) : undefined,
        chest: measurements.chest ? parseFloat(measurements.chest) : undefined,
        waist: measurements.waist ? parseFloat(measurements.waist) : undefined,
        hips: measurements.hips ? parseFloat(measurements.hips) : undefined,
        shoulders: measurements.shoulders ? parseFloat(measurements.shoulders) : undefined,
        sleeveLength: measurements.sleeveLength ? parseFloat(measurements.sleeveLength) : undefined,
        inseam: measurements.inseam ? parseFloat(measurements.inseam) : undefined,
        neck: measurements.neck ? parseFloat(measurements.neck) : undefined,
        thigh: measurements.thigh ? parseFloat(measurements.thigh) : undefined,
        fullBodyImageId,
        inspoImageId,
      });

      setActiveProfileName(profileName.trim());
      showToast("Profile successfully saved to your catalogue.", "success");
    } catch (error) {
      console.error("Failed to save:", error);
      showToast("Failed to save profile. Please check your connection.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!clerkUser) return <div className="p-20 text-center uppercase tracking-widest text-sm">Please log in.</div>;

  const muiBrandStyles = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': { borderColor: '#3a1f1d' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3a1f1d' },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-16 px-6 relative">
      
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl italic font-medium text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome back, {clerkUser.firstName}
        </h1>
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
                    {profiles.map((p: any) => (
                      <MenuItem key={p._id} value={p.profileName}>{p.profileName}</MenuItem>
                    ))}
                    <MenuItem value="CREATE_NEW" sx={{ fontStyle: 'italic', opacity: 0.7 }}>+ Create New Profile</MenuItem>
                  </Select>
                </FormControl>
              </div>
            )}

            <h2 className="text-[13px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d] mb-10 text-center">
              Menswear Measurements <span className="opacity-50 text-[10px]">(INCHES)</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="sm:col-span-2 md:col-span-3">
                <TextField fullWidth variant="outlined" label="PROFILE NAME (e.g. Primary Profile, Wedding Suit)" name="profileName" value={profileName} onChange={(e) => setProfileName(e.target.value)} sx={muiBrandStyles} required />
              </div>
              {Object.keys(measurements).map((key) => (
                <TextField key={key} fullWidth variant="outlined" label={key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()} type="number" name={key} value={measurements[key as keyof typeof measurements]} onChange={handleChange} slotProps={{ htmlInput: { step: "0.5" } }} sx={muiBrandStyles} />
              ))}
            </div>
          </div>

          <div className="pt-6">
            <h2 className="text-[13px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d] mb-10 text-center">Reference Photography</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-3">
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d] text-center">Full Body Scale <span className="text-red-600">*</span></span>
                <div className="w-full">
                  <FileUpload.Root>
                    <FileUpload.DropZone accept="image/*" hint="Mandatory for tailored fit reference (PNG/JPG)" onDropFiles={handleDropFullBody} />
                    {fullBodyFiles.length > 0 && (
                      <div className="mt-4 flex items-center justify-between border border-[#3a1f1d]/20 bg-[#F9F8F6] p-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3a1f1d" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          <div className="flex flex-col truncate">
                            <span className="text-[12px] uppercase tracking-widest font-medium text-[#3a1f1d] truncate">{fullBodyFiles[0].name}</span>
                            <span className="text-[10px] opacity-60 uppercase tracking-widest">{(fullBodyFiles[0].size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => setFullBodyFiles([])} className="text-[#3a1f1d]/50 hover:text-[#3a1f1d] p-1 transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                    )}
                  </FileUpload.Root>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d] text-center">Design Inspiration</span>
                <div className="w-full">
                  <FileUpload.Root>
                    <FileUpload.DropZone accept="image/*" hint="Optional: What do you want us to sew? (PNG/JPG)" onDropFiles={handleDropInspo} />
                    {inspoFiles.length > 0 && (
                      <div className="mt-4 flex items-center justify-between border border-[#3a1f1d]/20 bg-[#F9F8F6] p-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3a1f1d" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          <div className="flex flex-col truncate">
                            <span className="text-[12px] uppercase tracking-widest font-medium text-[#3a1f1d] truncate">{inspoFiles[0].name}</span>
                            <span className="text-[10px] opacity-60 uppercase tracking-widest">{(inspoFiles[0].size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => setInspoFiles([])} className="text-[#3a1f1d]/50 hover:text-[#3a1f1d] p-1 transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                    )}
                  </FileUpload.Root>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button color="primary" size="xl" type="submit" disabled={isSaving} style={{ backgroundColor: '#3a1f1d', borderColor: '#3a1f1d', color: '#ffffff', padding: '1rem 4rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              {isSaving ? 'Saving...' : 'Save Measurements'}
            </Button>
          </div>
        </form>
      </div>

      {/* 4. Top-Mounted Smart Notification */}
      {toast && (
        <div 
          className={`fixed top-10 left-1/2 transform -translate-x-1/2 px-8 py-4 shadow-2xl flex items-center gap-4 z-[200] animate-[fade-in-down_0.3s_ease-out] border border-white/10
            ${toast.type === 'success' ? 'bg-[#3a1f1d] text-white' : 'bg-red-800 text-white'}
          `}
        >
          {toast.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          )}
          <span className="text-xs uppercase tracking-widest font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Profile;