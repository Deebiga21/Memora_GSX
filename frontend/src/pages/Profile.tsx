import { useState, useEffect } from "react";
import { User, Mail, Briefcase, Building, Save, X } from "lucide-react";
import { getProfile, updateProfile } from "../services/api";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(data => {
      setProfile(data);
      setFormData(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const updated = await updateProfile(formData);
    setProfile(updated);
    setEditing(false);
    setLoading(false);
  };

  if (loading && !profile) return <div className="text-center p-12 text-[#A18A68]">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F4EFE6]">Your Profile</h1>
          <p className="text-[#A18A68] mt-2">Manage your institutional identity</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="px-4 py-2 bg-[#DFCEB6] text-[#2C2A28] border border-[#83633F] rounded-lg font-semibold hover:bg-[#EADBB9] transition-colors">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setFormData(profile); }} className="px-4 py-2 bg-[#201D19] text-[#F4EFE6] border border-[#5A544A] rounded-lg font-semibold flex items-center gap-2 hover:bg-[#34322F]">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#DFCEB6] text-[#2C2A28] border border-[#83633F] rounded-lg font-semibold flex items-center gap-2 hover:bg-[#EADBB9]">
              <Save size={16} /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#201D19] border border-[#5A544A] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#3D3A35]">
          <div className="relative">
            <div className={`w-24 h-24 bg-[#EADBB9] rounded-full flex items-center justify-center text-[#2C2A28] border-4 border-[#201D19] shadow-sm overflow-hidden ${editing ? 'cursor-pointer hover:opacity-80' : ''}`}>
              <input type="file" id="profile-upload" className="hidden" accept="image/*" disabled={!editing} onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (ev.target?.result) {
                      setFormData({...formData, profile_image: ev.target.result as string});
                    }
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }
              }} />
              <label htmlFor="profile-upload" className="w-full h-full flex items-center justify-center cursor-pointer">
                {(formData.profile_image || profile.profile_image) ? <img src={formData.profile_image || profile.profile_image} className="w-full h-full object-cover" /> : <User size={40} />}
              </label>
            </div>
            {editing && <div className="absolute -bottom-1 -right-1 bg-[#2C2A28] border border-[#5A544A] rounded-full p-1 shadow-sm text-xs text-[#F4EFE6] pointer-events-none">Edit</div>}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#F4EFE6]">{profile.name}</h2>
            <p className="text-[#A18A68] flex items-center gap-2 mt-1"><Briefcase size={16}/> {profile.role} at {profile.department}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#8C7A5E] uppercase tracking-widest flex items-center gap-2"><User size={14}/> Full Name</label>
              {editing ? 
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-[#3D3A35] rounded-lg bg-[#2C2A28] text-[#F4EFE6] focus:outline-none focus:border-[#83633F]" /> 
                : <div className="p-3 text-[#F4EFE6] font-medium">{profile.name}</div>
              }
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#8C7A5E] uppercase tracking-widest flex items-center gap-2"><Mail size={14}/> Email Address</label>
              {editing ? 
                <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border border-[#3D3A35] rounded-lg bg-[#2C2A28] text-[#F4EFE6] focus:outline-none focus:border-[#83633F]" /> 
                : <div className="p-3 text-[#F4EFE6] font-medium">{profile.email}</div>
              }
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#8C7A5E] uppercase tracking-widest flex items-center gap-2"><Briefcase size={14}/> Role</label>
              {editing ? 
                <input type="text" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 border border-[#3D3A35] rounded-lg bg-[#2C2A28] text-[#F4EFE6] focus:outline-none focus:border-[#83633F]" /> 
                : <div className="p-3 text-[#F4EFE6] font-medium">{profile.role}</div>
              }
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#8C7A5E] uppercase tracking-widest flex items-center gap-2"><Building size={14}/> Department</label>
              {editing ? 
                <input type="text" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-3 border border-[#3D3A35] rounded-lg bg-[#2C2A28] text-[#F4EFE6] focus:outline-none focus:border-[#83633F]" /> 
                : <div className="p-3 text-[#F4EFE6] font-medium">{profile.department}</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
