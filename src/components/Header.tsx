import React from 'react';
import { 
  UtensilsCrossed, 
  Layers, 
  FileText, 
  MapPin, 
  Globe, 
  Moon, 
  Sun,
  CheckCircle2, 
  ChevronDown 
} from 'lucide-react';
import { Branch, Language, SystemMode, User } from '../types';

interface HeaderProps {
  currentBranch: Branch;
  branches: Branch[];
  onSelectBranch: (branchId: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  systemMode: SystemMode;
  onToggleSystemMode: (mode: SystemMode) => void;
  currentUser: User;
  onOpenUserModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBranch,
  branches,
  onSelectBranch,
  language,
  onToggleLanguage,
  isDarkMode,
  onToggleDarkMode,
  systemMode,
  onToggleSystemMode,
  currentUser,
  onOpenUserModal,
}) => {
  const isLao = language === 'la';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-md shadow-red-500/20">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-amber-400">LAO BUFFET POS</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {isLao ? 'ລະບົບຈັດການຮ້ານອາຫານບຸບເຟ່ & ສະຖາປັດຕະຍະກຳ' : 'Buffet POS Architecture & Live System'}
              </p>
            </div>
          </div>

          {/* Mode Switcher: POS System vs Architecture Spec */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <button
              id="btn-mode-pos"
              onClick={() => onToggleSystemMode('POS_OPERATIONAL')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                systemMode === 'POS_OPERATIONAL'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isLao ? '🖥️ ລະບົບ POS ປະຕິບັດການ' : '🖥️ Live POS System'}</span>
            </button>
            <button
              id="btn-mode-spec"
              onClick={() => onToggleSystemMode('SPEC_DOCS')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                systemMode === 'SPEC_DOCS'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isLao ? '📑 ເອກະສານສະຖາປັດຕະຍະກຳ (Specs)' : '📑 Architecture Specs'}</span>
            </button>
          </div>

          {/* Right Controls: Branch Switcher, Language, Dark Mode, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Branch Switcher */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700 text-xs cursor-pointer transition">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <div className="text-left hidden md:block">
                  <div className="text-[10px] text-slate-400 leading-none">
                    {isLao ? 'ສາຂາປັດຈຸບັນ' : 'Current Branch'}
                  </div>
                  <div className="font-semibold text-slate-200 truncate max-w-[130px]">
                    {isLao ? currentBranch.nameLao.split(':')[1]?.trim() || currentBranch.nameLao : currentBranch.nameEn.split(':')[1]?.trim() || currentBranch.nameEn}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  {isLao ? 'ເລືອກສາຂາ (Multi-Branch Selector)' : 'Switch Branch'}
                </div>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onSelectBranch(b.id)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                      b.id === currentBranch.id ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{isLao ? b.nameLao : b.nameEn}</div>
                      <div className="text-[10px] text-slate-500">{b.phone} • {b.tableCount} {isLao ? 'ໂຕະ' : 'Tables'}</div>
                    </div>
                    {b.id === currentBranch.id && <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Toggle */}
            <button
              id="btn-language-toggle"
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Toggle Language (ພາສາລາວ / English)"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'la' ? '🇱🇦 ລາວ' : '🇬🇧 EN'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="btn-dark-mode"
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Toggle Dark / Light Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Current User & Role Profile */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-left">
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
                referrerPolicy="no-referrer"
              />
              <div className="hidden sm:block">
                <div className="font-semibold text-slate-200 text-[11px] leading-tight truncate max-w-[110px]">
                  {currentUser.fullName.split('(')[0]}
                </div>
                <div className="text-[9px] text-amber-400 font-medium leading-none">
                  {currentUser.role}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
