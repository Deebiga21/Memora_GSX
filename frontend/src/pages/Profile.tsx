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
          <h1 className="text-3xl font-bold text-[#201D19]">Your Profile</h1>
          <p className="text-[#A18A68] mt-2">Manage your institutional identity</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="px-4 py-2 bg-[#EADBB9] text-[#2C2A28] border border-[#D0BF9F] rounded-lg font-semibold hover:bg-[#D4C4A8] transition-colors">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setFormData(profile); }} className="px-4 py-2 bg-white text-[#2C2A28] border border-[#D0BF9F] rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-50">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#2C2A28] text-[#D0BF9F] border border-[#5A544A] rounded-lg font-semibold flex items-center gap-2 hover:bg-[#38342B]">
              <Save size={16} /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#D0BF9F] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          <div className="relative">
            <div className={`w-24 h-24 bg-[#EADBB9] rounded-full flex items-center justify-center text-[#2C2A28] border-4 border-white shadow-sm overflow-hidden ${editing ? 'cursor-pointer hover:opacity-80' : ''}`}>
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
            {editing && <div className="absolute -bottom-1 -right-1 bg-white border border-[#D0BF9F] rounded-full p-1 shadow-sm text-xs text-gray-500 pointer-events-none">Edit</div>}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#201D19]">{profile.name}</h2>
            <p className="text-[#A18A68] flex items-center gap-2 mt-1"><Briefcase size={16}/> {profile.role} at {profile.department}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#8C7A5E] uppercase tracking-widest flex items-center gap-2"><User size={14}/> Full Name</label>
              {editing ? 
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#A18A68]" /> 
                : <div className="p-3 text-[#201D19] font-medium">{profile.name}</div>
              }
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#8C7A5E] uppercase tracking-widest flex items-center gap-2"><Mail size={14}/> Email Address</label>
              {editing ? 
                <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#A18A68]" /> 
                : <div className="p-3 text-[#201D19] font-medium">{profile.email}</div>
              }
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#8C7A5E] uppercase tracking-widest flex items-center gap-2"><Briefcase size={14}/> Role</label>
              {editing ? 
                <input type="text" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#A18A68]" /> 
                : <div className="p-3 text-[#201D19] font-medium">{profile.role}</div>
              }
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#8C7A5E] uppercase tracking-widest flex items-center gap-2"><Building size={14}/> Department</label>
              {editing ? 
                <input type="text" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#A18A68]" /> 
                : <div className="p-3 text-[#201D19] font-medium">{profile.department}</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
