import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  QrCode, 
  Printer, 
  Copy, 
  CheckCircle2, 
  Smartphone, 
  Sparkles, 
  UtensilsCrossed, 
  Wifi, 
  ChefHat,
  ArrowRight,
  RefreshCw,
  Layers,
  Volume2,
  ExternalLink,
  Search,
  Check,
  Filter
} from 'lucide-react';
import QRCode from 'qrcode';
import { RestaurantTable, Language } from '../../types';
import { JBBQLogo } from '../common/JBBQLogo';
import { playLaoOrderVoiceAlert } from '../../utils/audioAlert';

interface TableQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: RestaurantTable[];
  initialTableCode?: string;
  language: Language;
  onOpenMobileSimulator: (tableCode: string) => void;
}

export const TableQrModal: React.FC<TableQrModalProps> = ({
  isOpen,
  onClose,
  tables,
  initialTableCode,
  language,
  onOpenMobileSimulator
}) => {
  const isLao = language === 'la';
  const [selectedTableCode, setSelectedTableCode] = useState<string>(
    initialTableCode || tables[0]?.code || 'A-01'
  );
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Sync initialTableCode if updated
  useEffect(() => {
    if (initialTableCode) {
      setSelectedTableCode(initialTableCode);
    }
  }, [initialTableCode]);

  const currentTable = tables.find(t => t.code === selectedTableCode) || tables[0];
  
  // Real URL that any smartphone camera can scan and open
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const scanUrl = `${currentOrigin}${currentPath}?mode=customer&table=${selectedTableCode}`;

  // Unique Zones
  const zones = useMemo(() => {
    const list = Array.from(new Set(tables.map(t => t.zone)));
    return ['ALL', ...list];
  }, [tables]);

  // Filtered tables list
  const filteredTables = useMemo(() => {
    return tables.filter(t => {
      const matchZone = selectedZone === 'ALL' || t.zone === selectedZone;
      const matchSearch = searchQuery.trim() === '' || 
        t.code.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        t.zone.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchZone && matchSearch;
    });
  }, [tables, selectedZone, searchQuery]);

  // Generate crisp real scannable QR Code PNG Data URL
  useEffect(() => {
    QRCode.toDataURL(scanUrl, {
      width: 380,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [scanUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenDirect = () => {
    window.open(scanUrl, '_blank');
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 text-white w-full max-w-2xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden relative my-6"
      >
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isLao ? 'ປ້າຍ QR Code ສັ່ງອາຫານປະຈຳໂຕະ' : 'Table QR Code Ordering Stand'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                  {isLao ? 'ປົດລັອກທຸກເມນູ' : 'All Menus Unlocked'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isLao ? 'ລູກຄ້າສະແກນຜ່ານມືຖື ເພື່ອເລືອກເມນູ ແລະ ສົ່ງເຂົ້າໜ້າຈໍຄົວ KDS ທັນທີ' : 'Customer scans with phone camera to view prices and order directly to Kitchen KDS'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Table Selector Section - Select ANY table in the restaurant */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{isLao ? 'ເລືອກໂຕະພາຍໃນຮ້ານ (ເລືອກໄດ້ທຸກໂຕະ):' : 'Select Any Table in Restaurant:'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-extrabold border border-amber-500/30">
                  {selectedTableCode}
                </span>
              </label>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isLao ? 'ຄົ້ນຫາໂຕະ... (ເຊັ່ນ: A-01, VIP)' : 'Search table...'}
                  className="pl-8 pr-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44"
                />
              </div>
            </div>

            {/* Zone Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {zones.map(zone => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedZone === zone
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {zone === 'ALL' ? (isLao ? 'ທຸກໂຊນ (ທັງໝົດ)' : 'All Zones') : zone}
                </button>
              ))}
            </div>

            {/* Grid of ALL Tables in Restaurant */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
              {filteredTables.map(table => {
                const isSelected = selectedTableCode === table.code;
                const isOccupied = table.status !== 'VACANT';
                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTableCode(table.code)}
                    className={`p-2 rounded-xl text-xs font-black transition flex flex-col items-center justify-center relative border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 scale-105 z-10'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{table.code}</span>
                      {isOccupied && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <span className={`text-[9px] font-medium mt-0.5 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                      {table.defaultCapacity}p
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredTables.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-2">
                {isLao ? 'ບໍ່ພົບໂຕະທີ່ຄົ້ນຫາ' : 'No tables found'}
              </p>
            )}
          </div>

          {/* PRINTABLE TABLE TENT CARD / STAND */}
          <div className="bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 p-1 rounded-3xl shadow-xl">
            <div className="bg-white text-slate-950 rounded-[22px] p-6 text-center space-y-4 relative overflow-hidden">
              
              {/* Subtle BBQ grill watermark background pattern */}
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-100 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-orange-100 rounded-full opacity-50 blur-2xl pointer-events-none"></div>

              {/* Brand Header with Mascot Logo */}
              <div className="flex flex-col items-center justify-center gap-1.5">
                <JBBQLogo size="md" showText={false} />
                <h4 className="text-sm font-black tracking-wider text-slate-900 uppercase">
                  BUFFET MASTER BBQ
                </h4>
                <p className="text-[11px] text-slate-600 font-semibold">
                  {isLao ? 'ບຸບເຟ່ປິ້ງຍ່າງ & ຊາບູ ພຣີມຽມ • ວຽງຈັນ' : 'Premium All-You-Can-Eat Buffet & Grill'}
                </p>
              </div>

              {/* Table Number Callout */}
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-slate-950 text-white shadow-lg">
                <ChefHat className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {isLao ? 'ເລກໂຕະ / TABLE' : 'TABLE'}
                </span>
                <span className="text-lg font-black text-amber-400">
                  {selectedTableCode}
                </span>
                <span className="text-[10px] text-slate-400 font-medium border-l border-slate-700 pl-2">
                  {currentTable?.zone}
                </span>
              </div>

              {/* High-Contrast Crisp Real Scannable QR Code Container */}
              <div className="flex flex-col items-center justify-center my-2">
                <div 
                  onClick={() => {
                    onOpenMobileSimulator(selectedTableCode);
                    onClose();
                  }}
                  className="p-3 bg-white rounded-3xl border-4 border-slate-950 shadow-xl inline-block relative group cursor-pointer hover:border-amber-500 transition transform hover:scale-[1.02]"
                  title={isLao ? 'ຄລິກທີ່ QR Code ເພື່ອທົດລອງສັ່ງອາຫານທັນທີ' : 'Click to test self-ordering now'}
                >
                  {qrDataUrl ? (
                    <div className="relative">
                      <img 
                        src={qrDataUrl} 
                        alt={`Scannable QR Code Table ${selectedTableCode}`}
                        className="w-48 h-48 rounded-xl object-contain"
                      />
                      {/* Center Brand Badge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-lg text-slate-950 font-black text-xs">
                          BBQ
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-xl">
                      <QrCode className="w-12 h-12 text-slate-400 animate-spin" />
                    </div>
                  )}

                  <div className="mt-1 text-[10px] font-bold text-slate-500 group-hover:text-amber-600 transition flex items-center justify-center gap-1">
                    <span>⚡ {isLao ? 'ກົດທີ່ QR ເພື່ອເປີດເມນູສັ່ງອາຫານ' : 'Click QR to open menu'}</span>
                  </div>
                </div>

                {/* Test Lao Voice Alert Button */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playLaoOrderVoiceAlert(selectedTableCode)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                    title={isLao ? 'ທົດສອບສຽງເຕືອນພາສາລາວ "ອໍເດີເຂົ້າແລ້ວ!"' : 'Test Lao voice alert'}
                  >
                    <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>{isLao ? '🔊 ທົດສອບສຽງເຕືອນ: "ອໍເດີເຂົ້າແລ້ວ"' : '🔊 Test Lao Voice: "Order Arrived!"'}</span>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1">
                <div className="text-sm font-black text-slate-900 flex items-center justify-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>{isLao ? 'ສະແກນ QR ດ້ວຍກ້ອງມືຖືເພື່ອເລືອກເມນູ & ສັ່ງອາຫານ' : 'Scan with Phone Camera to Order Menu'}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {isLao 
                    ? 'ກ້ອງມືຖືທຸກລຸ້ນສາມາດສະແກນ QR ນີ້ໄດ້ທັນທີ! ເມື່ອສັ່ງອາຫານ ລະບົບຈະມີສຽງເຕືອນພະນັກງານວ່າ "ອໍເດີເຂົ້າແລ້ວ"' 
                    : 'Any mobile camera can scan this code! Orders trigger Lao voice alert "Order Arrived!"'}
                </p>
              </div>

              {/* Free Restaurant Wi-Fi Footnote */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-amber-600" />
                  <span>Wi-Fi: <strong>LaoBuffet_Free</strong></span>
                </span>
                <span>•</span>
                <span>Pass: <strong>buffet888</strong></span>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            
            {/* 1. Simulate Mobile Order */}
            <button
              onClick={() => {
                onOpenMobileSimulator(selectedTableCode);
                onClose();
              }}
              className="py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>{isLao ? 'ທົດລອງສັ່ງອາຫານ' : 'Open Menu'}</span>
            </button>

            {/* 2. Open in New Tab */}
            <button
              onClick={handleOpenDirect}
              className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title={isLao ? 'ເປີດລິ້ງສັ່ງອາຫານໃນແທັບໃໝ່ຂອງບຣາວເຊີ' : 'Open in new tab'}
            >
              <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{isLao ? 'ເປີດໃນແທັບໃໝ່' : 'New Tab'}</span>
            </button>

            {/* 3. Copy Order Link */}
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400">{isLao ? 'ກັອບປີ້ແລ້ວ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{isLao ? 'ກັອບປີ້ລິ້ງ' : 'Copy URL'}</span>
                </>
              )}
            </button>

            {/* 4. Print Stand */}
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{isLao ? 'ພິມປ້າຍ QR' : 'Print Stand'}</span>
            </button>

          </div>

          {/* Bottom Exit Window Small Button / Icon */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-2 transition border border-slate-700/60 cursor-pointer shadow-sm hover:border-slate-500"
              title={isLao ? 'ອອກຈາກໜ້າຕ່າງນີ້' : 'Exit this window'}
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>{isLao ? 'ອອກຈາກໜ້າຕ່າງນີ້' : 'Close this window'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
