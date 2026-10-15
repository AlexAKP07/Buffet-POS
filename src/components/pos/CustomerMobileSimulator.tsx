import React, { useState, useMemo } from 'react';
import { 
  Smartphone, 
  QrCode, 
  Clock, 
  ShoppingCart, 
  Utensils, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Sparkles, 
  Flame, 
  AlertTriangle,
  History,
  Unlock,
  ChevronRight,
  ChevronDown,
  Printer,
  Camera,
  ChefHat,
  Search,
  Check,
  Send,
  Eye,
  ArrowRight,
  Layers,
  Filter,
  X,
  XCircle
} from 'lucide-react';
import { 
  RestaurantTable, 
  TableSession, 
  MenuItem, 
  Language, 
  BuffetPackageTier 
} from '../../types';
import { MOCK_MENU_ITEMS, BUFFET_PACKAGES } from '../../data/mockData';
import { TableQrModal } from './TableQrModal';
import { JBBQLogo } from '../common/JBBQLogo';

interface CustomerMobileSimulatorProps {
  tables: RestaurantTable[];
  sessions: Record<string, TableSession>;
  language: Language;
  initialTableCode?: string;
  menuItems?: MenuItem[];
  onSendMobileOrder: (tableCode: string, items: { menuItem: MenuItem; qty: number; note: string }[]) => void;
  onNavigateToKds?: () => void;
  onNavigateToBilling?: (tableCode: string) => void;
}

export const CustomerMobileSimulator: React.FC<CustomerMobileSimulatorProps> = ({
  tables,
  sessions,
  language,
  initialTableCode,
  menuItems,
  onSendMobileOrder,
  onNavigateToKds,
  onNavigateToBilling,
}) => {
  const isLao = language === 'la';

  // Selected table simulation
  const occupiedTables = tables.filter(t => t.status !== 'VACANT');
  const [selectedTableCode, setSelectedTableCode] = useState<string>(
    initialTableCode || occupiedTables[0]?.code || tables[0]?.code || 'A-01'
  );

  React.useEffect(() => {
    if (initialTableCode) {
      setSelectedTableCode(initialTableCode);
    }
  }, [initialTableCode]);
  
  const currentTable = tables.find(t => t.code === selectedTableCode) || tables[0];
  const currentSession = currentTable?.currentSessionId ? sessions[currentTable.currentSessionId] : undefined;
  const currentPkgTier: BuffetPackageTier = currentSession?.packageTier || 'STANDARD';
  const pkg = BUFFET_PACKAGES[currentPkgTier] || BUFFET_PACKAGES['STANDARD'];
  const durationTotal = currentSession?.durationMinutes || 90;
  const remainingMinutes = currentSession?.remainingMinutes !== undefined ? currentSession.remainingMinutes : 60;
  const elapsedMinutes = Math.max(0, durationTotal - remainingMinutes);
  const isTimeExpired = remainingMinutes <= 0;
  const startTimeFormatted = currentSession?.startTime 
    ? new Date(currentSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '18:30';

  // Mobile App View Tabs: Menu, Cart, Order History
  const [mobileTab, setMobileTab] = useState<'menu' | 'cart' | 'history'>('menu');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Cart state: Record<menuItemId, { item: MenuItem, qty: number, note: string }>
  const [cart, setCart] = useState<Record<string, { item: MenuItem; qty: number; note: string }>>({});
  const [orderSentSuccess, setOrderSentSuccess] = useState<boolean>(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>('');
  const [autoSwitchToKds, setAutoSwitchToKds] = useState<boolean>(true);

  // Table QR Stand Modal state
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isScannerSimOpen, setIsScannerSimOpen] = useState<boolean>(false);

  // Table Selector State (Inside phone and top bar)
  const [isTableSelectorOpen, setIsTableSelectorOpen] = useState<boolean>(false);
  const [pickerZone, setPickerZone] = useState<string>('ALL');
  const [pickerSearch, setPickerSearch] = useState<string>('');

  // Unique zones across all tables in restaurant
  const allZones = useMemo(() => {
    const set = Array.from(new Set(tables.map(t => t.zone)));
    return ['ALL', ...set];
  }, [tables]);

  // Tables filtered for picker
  const pickerFilteredTables = useMemo(() => {
    return tables.filter(t => {
      const matchZone = pickerZone === 'ALL' || t.zone === pickerZone;
      const matchSearch = pickerSearch.trim() === '' || 
        t.code.toLowerCase().includes(pickerSearch.toLowerCase().trim()) ||
        t.zone.toLowerCase().includes(pickerSearch.toLowerCase().trim());
      return matchZone && matchSearch;
    });
  }, [tables, pickerZone, pickerSearch]);

  // Categories
  const categories = [
    { id: 'ALL', nameLao: 'ທັງໝົດ (All)', nameEn: 'All' },
    { id: 'meat_pork', nameLao: 'ໝູ & ໄກ່', nameEn: 'Pork & Chicken' },
    { id: 'beef', nameLao: 'ຊີ້ນງົວ / ວາກິວ A5', nameEn: 'Beef & Wagyu' },
    { id: 'seafood', nameLao: 'ອາຫານທະເລ & ແຊວມອນ', nameEn: 'Seafood' },
    { id: 'vegetables', nameLao: 'ຜັກ & ເຫັດ', nameEn: 'Greens & Veggies' },
    { id: 'drinks_dessert', nameLao: 'ຂອງຫວານ & ເຄື່ອງດື່ມ', nameEn: 'Desserts & Drinks' },
    { id: 'soup_condiment', nameLao: 'ນ້ຳຈິ້ມ & ຊຸບ', nameEn: 'Sauces & Soup' },
  ];

  const baseMenuItems = menuItems || MOCK_MENU_ITEMS;

  const filteredMenuItems = baseMenuItems.filter(item => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      item.nameLao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItemsList = Object.values(cart) as { item: MenuItem; qty: number; note: string }[];
  const cartTotalItems: number = cartItemsList.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalDishValue: number = cartItemsList.reduce((sum, item) => sum + (item.item.priceLAK * item.qty), 0);

  // Unlocked ordering with live stock check!
  const addToCart = (item: MenuItem) => {
    // Check if item is out of stock
    if ((item.stockQty !== undefined && item.stockQty <= 0) || item.isAvailable === false) {
      alert(isLao ? `ຂໍອະໄພ: ເມນູ "${item.nameLao}" ໝົດສະຕັອກຊົ່ວຄາວ!` : `Sorry, "${item.nameEn}" is currently out of stock!`);
      return;
    }

    setCart(prev => {
      const current = prev[item.id];
      if (current) {
        // Guard against ordering more than available stock
        if (item.stockQty !== undefined && current.qty >= item.stockQty) {
          alert(isLao ? `ສະຕັອກຄົງເຫຼືອພຽງ ${item.stockQty} ${item.stockUnit || 'ຈານ'}` : `Only ${item.stockQty} available in stock!`);
          return prev;
        }
        return { ...prev, [item.id]: { ...current, qty: current.qty + 1 } };
      }
      return { ...prev, [item.id]: { item, qty: 1, note: '' } };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const current = prev[itemId];
      if (!current) return prev;
      if (current.qty > 1) {
        return { ...prev, [itemId]: { ...current, qty: current.qty - 1 } };
      }
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const updateItemNote = (itemId: string, note: string) => {
    setCart(prev => {
      if (!prev[itemId]) return prev;
      return { ...prev, [itemId]: { ...prev[itemId], note } };
    });
  };

  const handleSendOrder = () => {
    const itemsList = Object.values(cart) as { item: MenuItem; qty: number; note: string }[];
    if (itemsList.length === 0) return;

    const generatedOrderId = `#${Math.floor(1000 + Math.random() * 9000)}`;
    setLastPlacedOrderId(generatedOrderId);

    // Explicitly pass { menuItem, qty, note } format
    onSendMobileOrder(
      selectedTableCode, 
      itemsList.map(c => ({
        menuItem: c.item,
        qty: c.qty,
        note: c.note
      }))
    );
    setCart({});
    setOrderSentSuccess(true);
    setMobileTab('history');
    setTimeout(() => setOrderSentSuccess(false), 5000);

    // If autoSwitchToKds is enabled, navigate to Kitchen KDS immediately!
    if (autoSwitchToKds && onNavigateToKds) {
      setTimeout(() => {
        onNavigateToKds();
      }, 400);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: QR Code Stand & Unlocked Notification */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-4 rounded-3xl border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">
                {isLao ? 'ລະບົບສະແກນ QR Code ສັ່ງອາຫານດ້ວຍມືຖື' : 'Customer Mobile QR Self-Ordering System'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>{isLao ? 'ປົດລັອກທຸກເມນູແລ້ວ' : 'All Menus Unlocked'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isLao 
                ? 'ລູກຄ້າສະແກນ QR ຢູ່ໂຕະ ເພື່ອເບິ່ງເມນູ, ລາຄາ ແລະ ສັ່ງອາຫານກົງເຖິງໜ້າຈໍຄົວ KDS ແບບ Real-time'
                : 'Customers scan table QR stand to browse prices, order food directly into Kitchen KDS in real-time'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Direct Button to Select Any Table in Restaurant */}
          <button
            onClick={() => setIsTableSelectorOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
            title={isLao ? 'ຄລິກເພື່ອເລືອກໂຕະທຸກໂຕະພາຍໃນຮ້ານ' : 'Select any table in the restaurant'}
          >
            <Layers className="w-4 h-4 text-slate-950" />
            <span>{isLao ? `ເລືອກໂຕະທຸກໂຕະ (${tables.length} ໂຕະ)` : `Select Any Table (${tables.length})`}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Quick Dropdown Fallback */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-700">
            <span className="text-xs font-semibold text-slate-400">{isLao ? 'ໂຕະປັດຈຸບັນ:' : 'Current Table:'}</span>
            <select
              value={selectedTableCode}
              onChange={(e) => {
                setSelectedTableCode(e.target.value);
                setCart({});
              }}
              className="bg-transparent text-xs font-black text-amber-400 focus:outline-none cursor-pointer"
            >
              {tables.map(t => (
                <option key={t.id} value={t.code} className="bg-slate-900 text-white">
                  {t.code} ({t.zone} - {t.status === 'VACANT' ? (isLao ? 'ຫວ່າງ' : 'Vacant') : (isLao ? 'ກຳລັງກິນ' : 'Occupied')})
                </option>
              ))}
            </select>
          </div>

          {/* View QR Code Stand Button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 shadow-sm transition transform active:scale-95 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>{isLao ? 'ປ້າຍ QR Code ຕັ້ງໂຕະ' : 'Table QR Stand'}</span>
          </button>

          {/* Simulate Camera Scanner */}
          <button
            onClick={() => setIsScannerSimOpen(!isScannerSimOpen)}
            className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>{isLao ? 'ຈຳລອງກ້ອງສະແກນ' : 'Simulate Camera'}</span>
          </button>
        </div>
      </div>

      {/* Simulated Camera Scanner Drawer if toggled */}
      {isScannerSimOpen && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 text-white space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h4 className="text-xs font-black text-emerald-400">
                {isLao ? 'ຈຳລອງກ້ອງມືຖືລູກຄ້າສະແກນ QR ໂຕະ (Scan Table QR Simulator)' : 'Customer Camera Scanner Simulator'}
              </h4>
            </div>
            <button
              onClick={() => setIsScannerSimOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-300">
            {isLao 
              ? 'ເລືອກໂຕະທີ່ຕ້ອງການໃຫ້ກ້ອງມືຖືສະແກນ ເພື່ອເປີດໜ້າສັ່ງອາຫານຂອງໂຕະນັ້ນທັນທີ:' 
              : 'Tap a table to simulate camera scanning its QR stand code:'}
          </p>

          {/* Zone Selector for Camera Simulator */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {allZones.map(zone => (
              <button
                key={zone}
                onClick={() => setPickerZone(zone)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                  pickerZone === zone 
                    ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {zone === 'ALL' ? (isLao ? 'ທຸກໂຊນ (All Zones)' : 'All Zones') : zone}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {pickerFilteredTables.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTableCode(t.code);
                  setCart({});
                  setIsScannerSimOpen(false);
                }}
                className={`p-2.5 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                  selectedTableCode === t.code 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-105 shadow-md shadow-emerald-500/20' 
                    : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>ໂຕະ {t.code}</span>
                </div>
                <span className={`text-[10px] font-normal ${selectedTableCode === t.code ? 'text-slate-900' : 'text-slate-400'}`}>
                  {t.zone}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SMARTPHONE DEVICE FRAME SIMULATOR */}
      <div className="max-w-md mx-auto">
        <div className="bg-slate-950 rounded-[48px] p-4 shadow-2xl border-[7px] border-slate-850 ring-2 ring-slate-800 relative overflow-hidden">
          
          {/* Dynamic Island / Speaker Notch */}
          <div className="w-32 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2 border border-slate-800"></div>
            <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
          </div>

          {/* Phone Screen Container */}
          <div className="bg-slate-900 rounded-[36px] h-[680px] flex flex-col justify-between overflow-hidden text-white relative">
            
            {/* Screen Header: Table & Live Session Status */}
            <div className="bg-slate-850 p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTableSelectorOpen(true)}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs flex flex-col items-center justify-center shadow-md transition ring-2 ring-amber-400/50 cursor-pointer shrink-0"
                  title={isLao ? 'ກົດເພື່ອເລືອກໂຕະອື່ນພາຍໃນຮ້ານ' : 'Tap to switch table in restaurant'}
                >
                  <span className="text-[8px] uppercase tracking-wider leading-none text-slate-900 font-extrabold flex items-center">
                    ໂຕະ <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                  </span>
                  <span className="text-sm font-black leading-none">{selectedTableCode}</span>
                </button>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap">
                    <span>BUFFET MASTER</span>
                    <button
                      type="button"
                      onClick={() => setIsTableSelectorOpen(true)}
                      className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                      title={isLao ? 'ເລືອກໂຕະພາຍໃນຮ້ານ' : 'Select table'}
                    >
                      <Layers className="w-2.5 h-2.5 text-amber-400" />
                      <span>{isLao ? 'ປ່ຽນໂຕະ' : 'Change Table'}</span>
                    </button>
                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-bold">
                      {isLao ? 'ປົດລັອກ' : 'Unlocked'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>{currentTable?.zone || 'Zone A'}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{pkg?.nameLao || 'Standard'}</span>
                  </div>
                </div>
              </div>

              {/* Countdown Timer or Status */}
              <div className="text-right">
                <div className={`flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg border ${
                  isTimeExpired
                    ? 'text-red-400 bg-red-500/20 border-red-500/40 animate-pulse'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                }`}>
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>{isTimeExpired ? (isLao ? '00:00 (ໝົດເວລາ!)' : '00:00 (Time Up!)') : `${remainingMinutes}:00`}</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  {isLao ? `ກິນໄດ້ ${elapsedMinutes}m • ເຫຼືອ ${remainingMinutes}m` : `Elapsed ${elapsedMinutes}m • Left ${remainingMinutes}m`}
                </div>
              </div>
            </div>

            {/* Expired Red Alert Banner in Mobile Screen */}
            {isTimeExpired && (
              <div className="bg-red-600 text-white p-2.5 text-xs font-black flex items-center justify-between gap-2 border-b border-red-700 animate-pulse shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
                  </div>
                  <div>
                    <div className="leading-tight">{isLao ? '🚨 ໝົດເວລາບຸບເຟ່ແລ້ວ!' : '🚨 Buffet Time Expired!'}</div>
                    <div className="text-[10px] text-red-100 font-normal">
                      {isLao ? 'ກະລຸນາຕິດຕໍ່ພະນັກງານ ຫຼື ໄປໜ້າຄິດໄລ່ເງິນ' : 'Please proceed to cashier billing'}
                    </div>
                  </div>
                </div>
                {onNavigateToBilling && (
                  <button
                    onClick={() => onNavigateToBilling(selectedTableCode)}
                    className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 font-black rounded-lg text-[10px] shrink-0 shadow-md transition active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isLao ? 'ຄິດໄລ່ເງິນ' : 'Bill'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Success Toast for Mobile */}
            {orderSentSuccess && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 text-center text-xs font-black flex items-center justify-between gap-2 shadow-lg animate-fadeIn border-b border-emerald-400/30">
                <div className="flex items-center gap-1.5 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>{isLao ? `ອໍເດີ ${lastPlacedOrderId} ສົ່ງເຂົ້າໜ້າຈໍຄົວ KDS ແລ້ວ!` : `Order ${lastPlacedOrderId} sent to KDS!`}</span>
                      <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold flex items-center gap-0.5">
                        🔊 {isLao ? 'ອໍເດີເຂົ້າແລ້ວ' : 'Voice Alert'}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-100 font-normal">
                      {isLao ? '🔊 ລະບົບໄດ້ສົ່ງສຽງເຕືອນພາສາລາວ "ອໍເດີເຂົ້າແລ້ວ!" ບອກພະນັກງານຮຽບຮ້ອຍແລ້ວ' : 'Lao voice alert "Order Arrived!" successfully notified staff'}
                    </div>
                  </div>
                </div>
                {onNavigateToKds && (
                  <button
                    onClick={onNavigateToKds}
                    className="px-2.5 py-1.5 bg-amber-400 text-slate-950 rounded-xl text-[10px] font-black shrink-0 hover:bg-amber-300 transition flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95"
                  >
                    <ChefHat className="w-3 h-3 text-slate-900" />
                    <span>{isLao ? 'ເບິ່ງໜ້າຈໍຄົວ KDS' : 'View KDS'}</span>
                  </button>
                )}
              </div>
            )}

            {/* SCREEN BODY BASED ON TAB */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
              
              {/* TAB 1: MENU BROWSING */}
              {mobileTab === 'menu' && (
                <div className="space-y-3">
                  
                  {/* Search bar inside mobile */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder={isLao ? 'ຄົ້ນຫາເມນູ... (ຊີ້ນງົວ, ແຊວມອນ, ກຸ້ງ)' : 'Search menu items...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-800 rounded-xl text-xs text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-amber-500 transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-3 py-1 rounded-xl whitespace-nowrap font-bold transition ${
                          categoryFilter === cat.id
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        {isLao ? cat.nameLao : cat.nameEn}
                      </button>
                    ))}
                  </div>

                  {/* Menu Items Grid with Prices and No Lock */}
                  <div className="space-y-2.5">
                    {filteredMenuItems.map(item => {
                      const inCart = cart[item.id];
                      const isOutOfStock = (item.stockQty !== undefined && item.stockQty <= 0) || item.isAvailable === false;
                      const isLowStock = !isOutOfStock && item.stockQty !== undefined && item.stockQty <= (item.minStockAlert ?? 15);

                      return (
                        <div 
                          key={item.id}
                          className={`p-3 rounded-2xl transition flex items-center justify-between gap-3 shadow-sm ${
                            isOutOfStock 
                              ? 'bg-slate-850/60 border border-red-500/30 opacity-75' 
                              : 'bg-slate-800/90 border border-slate-700/80 hover:border-slate-600'
                          }`}
                        >
                          {/* Dish Image */}
                          <div className="relative shrink-0">
                            <img
                              src={item.image}
                              alt={item.nameEn}
                              className={`w-18 h-18 rounded-2xl object-cover border border-slate-700 ${isOutOfStock ? 'grayscale' : ''}`}
                              referrerPolicy="no-referrer"
                            />
                            {item.calories && (
                              <span className="absolute bottom-1 right-1 px-1 bg-black/70 text-[9px] font-bold text-amber-300 rounded">
                                {item.calories}kcal
                              </span>
                            )}
                          </div>

                          {/* Details & Pricing */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-xs text-white truncate">
                                {isLao ? item.nameLao : item.nameEn}
                              </h4>
                              {isOutOfStock ? (
                                <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black">
                                  {isLao ? 'ໝົດ' : 'Out'}
                                </span>
                              ) : isLowStock ? (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold">
                                  {isLao ? `ເຫຼືອ ${item.stockQty}` : `${item.stockQty} left`}
                                </span>
                              ) : null}
                            </div>

                            {/* Dish Description */}
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {isLao ? item.descriptionLao : item.descriptionEn}
                            </p>

                            {/* Price Tag & Stock Status */}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                                ₭ {item.priceLAK.toLocaleString()}
                                <span className="text-[9px] font-normal text-slate-400 ml-1">/{item.unit || (isLao ? 'ຈານ' : 'dish')}</span>
                              </span>

                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" />
                                <span>{isLao ? 'ລວມໃນບຸບເຟ້' : 'Free Buffet'}</span>
                              </span>

                              {item.stockQty !== undefined && !isOutOfStock && !isLowStock && (
                                <span className="text-[9px] text-slate-400">
                                  {isLao ? `ສະຕັອກ: ${item.stockQty}` : `Stock: ${item.stockQty}`}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Selector / Add Button */}
                          <div className="shrink-0">
                            {isOutOfStock ? (
                              <button
                                disabled
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-[10px] font-black flex items-center gap-1 cursor-not-allowed"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>{isLao ? 'ໝົດ' : 'Out'}</span>
                              </button>
                            ) : inCart ? (
                              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-amber-500/40">
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center transition"
                                >
                                  -
                                </button>
                                <span className="w-5 text-center font-black text-amber-400 text-xs">
                                  {inCart.qty}
                                </span>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="w-7 h-7 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center transition"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(item)}
                                className="w-9 h-9 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-md shadow-amber-500/20 transition transform active:scale-95"
                                title={isLao ? 'ກົດເພື່ອສັ່ງ' : 'Add to Order'}
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* TAB 2: CART */}
              {mobileTab === 'cart' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-amber-400" />
                      <span>{isLao ? 'ກະຕ່າສັ່ງອາຫານຂອງທ່ານ' : 'Your Order Cart'}</span>
                    </h4>
                    {cartTotalItems > 0 && (
                      <span className="text-[11px] text-amber-400 font-bold">
                        {cartTotalItems} {isLao ? 'ລາຍການ' : 'items'}
                      </span>
                    )}
                  </div>

                  {cartTotalItems === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs space-y-3">
                      <div className="w-14 h-14 rounded-3xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <Utensils className="w-7 h-7" />
                      </div>
                      <p>{isLao ? 'ຍັງບໍ່ມີເມນູໃນກະຕ່າ' : 'Your cart is empty'}</p>
                      <button
                        onClick={() => setMobileTab('menu')}
                        className="px-4 py-2 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs hover:bg-amber-400 shadow-md transition"
                      >
                        {isLao ? 'ເລືອກເມນູເລີຍ' : 'Browse Menu'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cartItemsList.map(({ item, qty, note }) => (
                        <div key={item.id} className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.image}
                                alt={item.nameEn}
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                              <div>
                                <div className="font-bold text-xs text-white">{isLao ? item.nameLao : item.nameEn}</div>
                                <div className="text-[10px] text-amber-400 font-semibold">
                                  ₭ {item.priceLAK.toLocaleString()} x {qty} = ₭ {(item.priceLAK * qty).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-6 h-6 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center"
                              >-</button>
                              <span className="font-black text-xs text-amber-400 w-4 text-center">{qty}</span>
                              <button
                                onClick={() => addToCart(item)}
                                className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center"
                              >+</button>
                            </div>
                          </div>

                          {/* Special Note Input */}
                          <div>
                            <input
                              type="text"
                              placeholder={isLao ? 'ໝາຍເຫດພິເສດ (ເຊັ່ນ: ບໍ່ໃສ່ຜັກ, ຂໍນ້ຳຈິ້ມເພີ່ມ)' : 'Special note (e.g. well-done, extra dip)...'}
                              value={note}
                              onChange={(e) => updateItemNote(item.id, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 rounded-xl text-[11px] text-slate-300 placeholder-slate-500 border border-slate-700/60 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Pricing Summary Card */}
                      <div className="p-3.5 bg-slate-850 rounded-2xl border border-slate-700 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>{isLao ? 'ມູນຄ່າອາຫານທັງໝົດ:' : 'Total Dish Value:'}</span>
                          <span className="font-bold text-slate-200">₭ {cartTotalDishValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span>{isLao ? 'ສ່ວນຫຼຸດບຸບເຟ້ (Free All-You-Can-Eat):' : 'Buffet Covered Discount:'}</span>
                          <span className="font-bold">- ₭ {cartTotalDishValue.toLocaleString()}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-700 flex justify-between font-black text-white">
                          <span>{isLao ? 'ຍອດຈ່າຍຄ່າອາຫານຕອນນີ້:' : 'Customer Pays for Dishes:'}</span>
                          <span className="text-emerald-400 font-black">₭ 0 (ລວມໃນບຸບເຟ້ແລ້ວ)</span>
                        </div>
                      </div>

                      {/* Instant Kitchen Dispatch Option */}
                      <button
                        type="button"
                        onClick={() => setAutoSwitchToKds(!autoSwitchToKds)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-bold text-slate-200">
                            {isLao ? 'ສົ່ງ & ເປີດໜ້າຈໍຄົວ KDS ທັນທີ' : 'Send & Open Kitchen Screen Immediately'}
                          </span>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${autoSwitchToKds ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                          <div className={`w-3 h-3 rounded-full bg-slate-950 transition-transform ${autoSwitchToKds ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </button>

                      {/* Confirm and Send Order Button */}
                      <button
                        id="btn-confirm-send-order"
                        onClick={handleSendOrder}
                        className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition transform active:scale-98"
                      >
                        <Send className="w-4 h-4" />
                        <span>
                          {isLao 
                            ? `ຢືນຢັນສັ່ງ ${cartTotalItems} ລາຍການ (ສົ່ງເຂົ້າໜ້າຈໍຄົວ KDS ທັນທີ)` 
                            : `Confirm & Send ${cartTotalItems} items to KDS`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ORDER HISTORY & REALTIME KITCHEN STATUS */}
              {mobileTab === 'history' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      <History className="w-4 h-4 text-emerald-400" />
                      <span>{isLao ? 'ສະຖານະອໍເດີໃນຄົວ KDS (Real-time)' : 'KDS Order Status'}</span>
                    </h4>
                    {onNavigateToKds && (
                      <button
                        onClick={onNavigateToKds}
                        className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>{isLao ? 'ເບິ່ງໜ້າຈໍຄົວ KDS' : 'View KDS'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {currentSession?.orders && currentSession.orders.length > 0 ? (
                    <div className="space-y-3">
                      {currentSession.orders.map(order => {
                        const statusColors = {
                          PENDING: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
                          COOKING: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
                          READY: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-black',
                          SERVED: 'bg-slate-700 text-slate-300 border-slate-600',
                        };

                        const maxPrepTime = Math.max(...order.items.map(i => i.prepTimeMinutes || 5), 5);

                        const statusTextLao = {
                          PENDING: '1. ລໍຖ້າກົດຮັບອໍເດີ',
                          COOKING: `2. ກຳລັງປຸງ (~${maxPrepTime} ນາທີ)`,
                          READY: '3. ✨ ແລ້ວພ້ອມເສີມ',
                          SERVED: '4. ເສີບເຖິງໂຕະແລ້ວ ✓',
                        };

                        const orderStep = order.status === 'PENDING' ? 1 : order.status === 'COOKING' ? 2 : order.status === 'READY' ? 3 : 4;

                        return (
                          <div key={order.id} className="p-3 bg-slate-800 rounded-2xl border border-slate-700 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-amber-400">{order.orderNumber}</span>
                                <span className="text-[10px] text-slate-400">
                                  • {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                  ⏱️ {isLao 
                                    ? `ສັ່ງເມື່ອ ${Math.max(0, Math.floor((Date.now() - new Date(order.orderTime).getTime()) / 60000))} ນາທີກ່ອນ` 
                                    : `${Math.max(0, Math.floor((Date.now() - new Date(order.orderTime).getTime()) / 60000))}m ago`}
                                </span>
                              </div>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border ${statusColors[order.status]}`}>
                                {isLao ? statusTextLao[order.status] : order.status}
                              </span>
                            </div>

                            {/* Mini Step Tracker for Customer */}
                            <div className="grid grid-cols-4 gap-1 py-1 text-[9px] text-center font-bold">
                              <div className={`p-1 rounded-lg ${orderStep >= 1 ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' : 'bg-slate-900/40 text-slate-500'}`}>
                                {isLao ? '1. ຮັບອໍເດີ' : '1. Accept'}
                              </div>
                              <div className={`p-1 rounded-lg ${orderStep === 2 ? 'bg-amber-500 text-slate-950 font-black animate-pulse' : orderStep > 2 ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900/40 text-slate-500'}`}>
                                {isLao ? `2. ປຸງ (~${maxPrepTime}m)` : `2. Cook (~${maxPrepTime}m)`}
                              </div>
                              <div className={`p-1 rounded-lg ${orderStep === 3 ? 'bg-emerald-500 text-white font-black animate-bounce' : orderStep > 3 ? 'bg-emerald-500/25 text-emerald-300' : 'bg-slate-900/40 text-slate-500'}`}>
                                {isLao ? '3. ພ້ອມເສີມ' : '3. Ready'}
                              </div>
                              <div className={`p-1 rounded-lg ${orderStep === 4 ? 'bg-blue-600 text-white font-black' : 'bg-slate-900/40 text-slate-500'}`}>
                                {isLao ? '4. ເສີບແລ້ວ' : '4. Served'}
                              </div>
                            </div>

                            {/* Item list */}
                            <div className="space-y-1.5 text-[11px] text-slate-300 divide-y divide-slate-700/50">
                              {order.items.map(item => (
                                <div key={item.id} className="pt-1.5 flex justify-between items-center">
                                  <div>
                                    <span className="font-bold text-white">{item.quantity}x</span> {isLao ? item.nameLao : item.nameEn}
                                    {item.specialNotes && (
                                      <span className="text-[10px] text-slate-400 block italic">"{item.specialNotes}"</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    {item.status === 'READY' ? (
                                      <span className="text-emerald-400 font-bold">✨ ແລ້ວພ້ອມເສີມ</span>
                                    ) : item.status === 'COOKING' ? (
                                      <span className="text-amber-400 font-bold">🔥 ກຳລັງປຸງ (~{item.prepTimeMinutes || 5}m)</span>
                                    ) : (
                                      <span className="text-amber-300 font-medium">⏱️ ລໍຖ້າຮັບ (~{item.prepTimeMinutes || 5}m)</span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                      <History className="w-8 h-8 text-slate-600 mx-auto" />
                      <p>{isLao ? 'ຍັງບໍ່ມີປະຫວັດການສັ່ງໃນຮອບນີ້' : 'No previous orders in this session yet'}</p>
                      <button
                        onClick={() => setMobileTab('menu')}
                        className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs"
                      >
                        {isLao ? 'ສັ່ງອາຫານຕອນນີ້' : 'Order Now'}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="bg-slate-850 p-2 border-t border-slate-800 grid grid-cols-3 gap-1">
              <button
                onClick={() => setMobileTab('menu')}
                className={`py-2 rounded-2xl text-[10px] font-bold flex flex-col items-center gap-1 transition ${
                  mobileTab === 'menu' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>{isLao ? 'ເມນູອາຫານ' : 'Menu'}</span>
              </button>

              <button
                onClick={() => setMobileTab('cart')}
                className={`py-2 rounded-2xl text-[10px] font-bold flex flex-col items-center gap-1 relative transition ${
                  mobileTab === 'cart' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isLao ? 'ກະຕ່າ' : 'Cart'}</span>
                {cartTotalItems > 0 && (
                  <span className="absolute top-1 right-6 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                    {cartTotalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileTab('history')}
                className={`py-2 rounded-2xl text-[10px] font-bold flex flex-col items-center gap-1 transition ${
                  mobileTab === 'history' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>{isLao ? 'ສະຖານະຄົວ' : 'KDS Status'}</span>
              </button>
            </div>

            {/* IN-PHONE TABLE SELECTOR SHEET / MODAL */}
            {isTableSelectorOpen && (
              <div 
                onClick={() => setIsTableSelectorOpen(false)}
                className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-fadeIn"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border-t border-slate-700 rounded-t-[32px] p-4 max-h-[85%] flex flex-col space-y-3 shadow-2xl animate-slideUp"
                >
                  {/* Sheet Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>{isLao ? 'ເລືອກໂຕະພາຍໃນຮ້ານ' : 'Select Restaurant Table'}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-extrabold">
                            {tables.length} {isLao ? 'ໂຕະ' : 'Tables'}
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {isLao ? 'ເລືອກໂຕະໃດກໍໄດ້ເພື່ອສັ່ງອາຫານປະຈຳໂຕະນັ້ນ' : 'Select any table to order for that table'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsTableSelectorOpen(false)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder={isLao ? 'ຄົ້ນຫາເລກໂຕະ... (ເຊັ່ນ: A-01, VIP-02)' : 'Search table code...'}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-850 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Zone Filter Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                    {allZones.map(zone => (
                      <button
                        key={zone}
                        onClick={() => setPickerZone(zone)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                          pickerZone === zone
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        {zone === 'ALL' ? (isLao ? 'ທຸກໂຊນ' : 'All') : zone}
                      </button>
                    ))}
                  </div>

                  {/* Grid of ALL Tables */}
                  <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-64 pr-1 scrollbar-thin">
                    {pickerFilteredTables.map(t => {
                      const isSelected = selectedTableCode === t.code;
                      const isOccupied = t.status !== 'VACANT';
                      const tableSession = t.currentSessionId ? sessions[t.currentSessionId] : undefined;
                      const isExpired = tableSession?.remainingMinutes !== undefined && tableSession.remainingMinutes <= 0;

                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSelectedTableCode(t.code);
                            setCart({});
                            setIsTableSelectorOpen(false);
                          }}
                          className={`p-2.5 rounded-2xl text-left transition flex flex-col justify-between border cursor-pointer relative ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                              : 'bg-slate-850 border-slate-750 text-white hover:bg-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs">ໂຕະ {t.code}</span>
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                            ) : isExpired ? (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            ) : isOccupied ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-600" />
                            )}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[9px]">
                            <span className={isSelected ? 'text-slate-850 font-bold' : 'text-slate-400'}>
                              {t.defaultCapacity} ບ່ອນນັ່ງ
                            </span>
                            <span className={`font-semibold ${
                              isSelected 
                                ? 'text-slate-950' 
                                : isExpired
                                ? 'text-red-400'
                                : isOccupied 
                                ? 'text-emerald-400' 
                                : 'text-slate-500'
                            }`}>
                              {isExpired 
                                ? (isLao ? 'ເບິດເວລາ' : 'Expired')
                                : isOccupied 
                                ? (isLao ? 'ກຳລັງກິນ' : 'Occupied') 
                                : (isLao ? 'ຫວ່າງ' : 'Vacant')}
                            </span>
                          </div>
                          <div className={`text-[8px] truncate mt-0.5 ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                            {t.zone}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {pickerFilteredTables.length === 0 && (
                    <p className="text-center text-xs text-slate-500 py-3">
                      {isLao ? 'ບໍ່ພົບໂຕະທີ່ຄົ້ນຫາ' : 'No tables matched'}
                    </p>
                  )}

                  {/* Footer hint */}
                  <div className="text-[10px] text-center text-slate-400 pt-1 border-t border-slate-800/80">
                    {isLao 
                      ? '✨ ສາມາດເລືອກໄດ້ທຸກໂຕະທັງ 4 ໂຊນ (Indoor A, Indoor B, VIP, Outdoor)' 
                      : '✨ Choose any table across all 4 zones (Indoor A, Indoor B, VIP, Outdoor)'}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Table QR Modal */}
      <TableQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        tables={tables}
        initialTableCode={selectedTableCode}
        language={language}
        onOpenMobileSimulator={(tableCode) => {
          setSelectedTableCode(tableCode);
          setCart({});
        }}
      />

    </div>
  );
};
