import { useState, useEffect } from "react";
import { BrainCircuit, Settings as SettingsIcon, Layout, Database, Info, LogOut, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getSettings, updateSettings } from "../services/api";

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleToggle = async (key: string) => {
    if (!settings) return;
    setSaving(true);
    const newVal = settings[key] ? 0 : 1;
    const updated = { ...settings, [key]: newVal };
    setSettings(updated);
    await updateSettings({ [key]: newVal });
    setSaving(false);
  };

  if (!settings) return <div className="text-center p-12 text-[#A18A68]">Loading settings...</div>;

  const Toggle = ({ label, desc, settingKey }: { label: string, desc: string, settingKey: string }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="font-bold text-[#201D19] text-sm">{label}</div>
        <div className="text-xs text-[#A18A68] font-medium">{desc}</div>
      </div>
      <div 
        onClick={() => handleToggle(settingKey)}
        className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${settings[settingKey] ? 'bg-[#2C2A28]' : 'bg-gray-300'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings[settingKey] ? 'right-1' : 'left-1'}`}></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="border-b border-[#D0BF9F] pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#201D19] mb-1">Settings</h1>
          <p className="text-sm text-[#A18A68] font-medium">Manage your institution's memory preferences.</p>
        </div>
        {saving && <Loader2 className="animate-spin text-[#8C7A5E]" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold bg-[#EADBB9] text-[#2C2A28] rounded-lg transition-colors border border-[#D0BF9F]">
               <SettingsIcon size={16} /> Preferences
            </button>
         </div>

         <div className="md:col-span-3 space-y-8">
            {/* AI Assistant */}
            <div className="bg-white border border-[#D0BF9F] rounded-xl shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-[#201D19] text-sm uppercase tracking-wider">AI Assistant</h3>
               </div>
               <div className="p-6 space-y-4">
                  <Toggle label="Voice Input" desc="Allow speaking questions via microphone" settingKey="voice_input" />
                  <div className="h-px bg-gray-100 w-full"></div>
                  <Toggle label="Voice Output" desc="Allow AI to speak answers out loud" settingKey="voice_output" />
                  <div className="h-px bg-gray-100 w-full"></div>
                  <Toggle label="Show Confidence" desc="Display confidence percentages on answers" settingKey="show_confidence" />
                  <div className="h-px bg-gray-100 w-full"></div>
                  <Toggle label="Show Evidence" desc="Show exact document snippets" settingKey="show_evidence" />
               </div>
            </div>

            {/* Notifications */}
            <div className="bg-white border border-[#D0BF9F] rounded-xl shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-[#201D19] text-sm uppercase tracking-wider">Notifications</h3>
               </div>
               <div className="p-6 space-y-4">
                  <Toggle label="Processing Completed" desc="Notify when document processing finishes" settingKey="notify_processing" />
                  <div className="h-px bg-gray-100 w-full"></div>
                  <Toggle label="Processing Failed" desc="Notify if a document fails to parse" settingKey="notify_failure" />
               </div>
            </div>

            <div className="pt-6 border-t border-[#D0BF9F]">
               <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors">
                  <LogOut size={16} /> Logout / Return to Home
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
}
