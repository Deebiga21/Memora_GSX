import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { Globe, Search, Settings, Mail, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ShapeMosaic from "../components/ShapeMosaic";
import { searchMemory, getProfile } from "../services/api";

export function DashboardLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Extraction Lab", path: "/documents" },
    { name: "Memory", path: "/memory" },
    { name: "Decisions", path: "/decisions" },
    { name: "Timeline", path: "/timeline" },
    { name: "Foresight", path: "/foresight" },
    { name: "Ask Memory", path: "/ask" },
  ];

  const location = window.location.pathname;

  useEffect(() => {
    getProfile().then(setUserProfile).catch(console.error);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        searchMemory(searchQuery).then(res => {
          setSearchResults(res);
          setIsSearching(false);
        }).catch(() => setIsSearching(false));
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (result: any) => {
    setShowSearch(false);
    setSearchQuery("");
    if (result.type === 'Decision') navigate(`/decisions/${result.id}/trace`);
    else if (result.type === 'Document') navigate(`/documents`);
    else navigate(`/memory`);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="h-screen w-screen font-sans overflow-hidden relative flex flex-col" style={{ backgroundColor: "#2C2A28", color: "#F4EFE6" }}>
      
      {/* Background Mosaic */}
      <div className="absolute inset-0 z-0 pointer-events-auto opacity-40">
        <ShapeMosaic ink="#3D3A35" lit="#DFCEB6" />
      </div>

      {/* Top Navigation */}
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-[#3D3A35] relative z-20 bg-[#2C2A28]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[#E8DCC4] flex-1">
              <Globe size={20} strokeWidth={1.5} />
              <span className="text-lg font-bold tracking-widest uppercase" style={{ fontFamily: "Georgia, serif" }}>MEMORA</span>
          </div>
          
          <div className="hidden md:flex items-center bg-transparent border border-[#A18A68] rounded-full p-1 shadow-inner">
              {navItems.map(item => (
                <NavLink key={item.name} to={item.path} className={({isActive}) => 
                    `px-5 py-1.5 text-xs font-semibold rounded-full transition-all tracking-wide ${isActive ? "bg-[#DFCEB6] text-[#2C2A28] shadow-sm" : "text-[#DFCEB6] hover:bg-[#3D3A35]"}`
                }>{item.name}</NavLink>
              ))}
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="relative" ref={searchRef}>
                  <div className={`flex items-center bg-[#3D3A35] border border-[#A18A68] rounded-full overflow-hidden transition-all duration-300 ${showSearch ? 'w-64' : 'w-9 h-9 justify-center cursor-pointer'}`}
                       onClick={() => !showSearch && setShowSearch(true)}>
                    <Search size={15} className={`text-[#DFCEB6] ${showSearch ? 'ml-3' : ''}`} />
                    {showSearch && (
                      <input 
                        type="text" 
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search institutional memory..." 
                        className="w-full bg-transparent border-none text-xs text-white px-2 py-2 outline-none"
                      />
                    )}
                  </div>
                  
                  {showSearch && (searchQuery.trim().length > 2 || searchResults.length > 0) && (
                    <div className="absolute right-0 top-12 w-80 bg-[#2C2A28] border border-[#A18A68] rounded-xl shadow-2xl max-h-96 overflow-y-auto">
                       <div className="p-2 border-b border-[#3D3A35] text-xs font-bold text-[#A18A68] uppercase tracking-wider bg-[#201D19]">Search Results</div>
                       {isSearching ? (
                         <div className="p-6 text-center text-[#DFCEB6] flex flex-col items-center gap-2">
                           <Loader2 size={16} className="animate-spin" />
                           <span className="text-xs">Searching...</span>
                         </div>
                       ) : searchResults.length === 0 ? (
                         <div className="p-4 text-center text-xs text-[#A18A68]">No results found.</div>
                       ) : (
                         <div className="p-2 flex flex-col gap-1">
                           {searchResults.map((res, i) => (
                             <button key={i} onClick={() => handleResultClick(res)} className="text-left w-full p-2 hover:bg-[#3D3A35] rounded-lg transition-colors flex flex-col">
                               <span className="text-sm font-semibold text-[#EADBB9]">{res.title}</span>
                               <span className="text-[10px] uppercase font-bold tracking-wider text-[#A18A68]">{res.type}</span>
                             </button>
                           ))}
                         </div>
                       )}
                    </div>
                  )}
              </div>
              
              <a href="mailto:admin@novatech.edu" className="w-9 h-9 rounded-full border border-[#A18A68] text-[#DFCEB6] flex items-center justify-center hover:bg-[#3D3A35] transition-colors" title="Contact Admin">
                <Mail size={15}/>
              </a>
              <NavLink to="/settings" className="w-9 h-9 rounded-full border border-[#A18A68] text-[#DFCEB6] flex items-center justify-center hover:bg-[#3D3A35] transition-colors" title="Settings">
                <Settings size={15}/>
              </NavLink>
              <NavLink to="/profile" className="w-9 h-9 rounded-full bg-[#DFCEB6] border border-[#A18A68] overflow-hidden flex items-center justify-center text-[#2C2A28] font-bold text-xs hover:opacity-90" title="Profile">
                {userProfile?.profile_image ? (
                  <img src={userProfile.profile_image} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  getInitials(userProfile?.name)
                )}
              </NavLink>
          </div>
      </header>
      
      {/* Main Outlet */}
      <main className="flex-1 overflow-auto p-4 md:p-8 relative z-10 scrollbar-thin scrollbar-thumb-[#A18A68] scrollbar-track-transparent">
          <Outlet />
      </main>
    </div>
  );
}
