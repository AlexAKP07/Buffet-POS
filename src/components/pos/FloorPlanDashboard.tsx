import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  Link2, 
  CreditCard, 
  CalendarClock, 
  Sparkles, 
  Utensils, 
  CheckCircle2, 
  AlertCircle,
  Armchair,
  BellRing,
  X,
  Layers,
  ChevronRight,
  RotateCcw,
  QrCode,
  Hourglass,
  Calculator,
  DollarSign,
  Check,
  ZoomIn,
  Crown
} from 'lucide-react';
import { 
  RestaurantTable, 
  TableSession, 
  BuffetPackageTier, 
  Language, 
  GuestType, 
  TableStatus 
} from '../../types';
import { BUFFET_PACKAGES } from '../../data/mockData';
import { TableQrModal } from './TableQrModal';

interface FloorPlanDashboardProps {
  tables: RestaurantTable[];
  sessions: Record<string, TableSession>;
  language: Language;
  onOpenTable: (tableCode: string, packageTier: BuffetPackageTier, fullGuests: number, halfGuests: number, freeGuests: number, extraChairs: number) => void;
  onAddExtraChair?: (tableCode: string) => void;
  onRemoveExtraChair?: (tableCode: string) => void;
  onAddMidMealGuests?: (tableCode: string, fullGuests: number, halfGuests: number, freeGuests: number, note: string) => void;
  onAddExtraChairs?: (tableCode: string, delta: number) => void;
  onAddMidMealGuest?: (tableCode: string, type: GuestType, count: number) => void;
  onMergeTables: (masterCode: string, slaveCodes: string[]) => void;
  onNavigateToBilling: (tableCode: string) => void;
  onNavigateToKds?: (tableCode: string) => void;
  onNavigateToMobileSimulator?: (tableCode: string) => void;
  onSendDelayedCareAlert?: (tableCode: string) => void;
  onSelectTableForBilling?: (tableCode: string) => void;
  orders?: any[];
  onResetToCleanShift?: () => void;
  onLoadDemoBusyShift?: () => void;
  onAdjustRemainingMinutes?: (tableCode: string, remainingMin: number) => void;
}

export const FloorPlanDashboard: React.FC<FloorPlanDashboardProps> = ({
  tables,
  sessions,
  language,
  onOpenTable,
  onAddExtraChair,
  onRemoveExtraChair,
  onAddMidMealGuests,
  onAddExtraChairs,
  onAddMidMealGuest,
  onMergeTables,
  onNavigateToBilling,
  onNavigateToKds,
  onNavigateToMobileSimulator,
  onSendDelayedCareAlert,
  onSelectTableForBilling,
  orders,
  onResetToCleanShift,
  onLoadDemoBusyShift,
  onAdjustRemainingMinutes,
}) => {
  const isLao = language === 'la';

  // Filters & Selected State
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  
  // Modals
  const [openTableModalTable, setOpenTableModalTable] = useState<RestaurantTable | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<BuffetPackageTier>('PREMIUM');
  const [fullGuestsCount, setFullGuestsCount] = useState<number>(2);
  const [halfGuestsCount, setHalfGuestsCount] = useState<number>(0);
  const [freeGuestsCount, setFreeGuestsCount] = useState<number>(0);
  const [initialExtraChairs, setInitialExtraChairs] = useState<number>(0);

  // Mid-Meal Guest Modal
  const [midMealModalTable, setMidMealModalTable] = useState<RestaurantTable | null>(null);
  const [midMealFull, setMidMealFull] = useState<number>(1);
  const [midMealHalf, setMidMealHalf] = useState<number>(0);
  const [midMealFree, setMidMealFree] = useState<number>(0);
  const [midMealNote, setMidMealNote] = useState<string>('');

  // Merge Table Modal
  const [mergeModalOpen, setMergeModalOpen] = useState<boolean>(false);
  const [masterTableCode, setMasterTableCode] = useState<string>('');
  const [selectedSlaveCodes, setSelectedSlaveCodes] = useState<string[]>([]);

  // Seat Management Modal
  const [seatModalTable, setSeatModalTable] = useState<RestaurantTable | null>(null);

  // View Table Ordered Items Modal
  const [viewingOrderTable, setViewingOrderTable] = useState<RestaurantTable | null>(null);

  // Table QR Code Stand Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [qrModalTableCode, setQrModalTableCode] = useState<string>(tables[0]?.code || 'A-01');

  // Preview Image Lightbox Modal
  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; title: string; subtitle: string } | null>(null);

  // Success alert message
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Calculate Metrics
  const availableCount = tables.filter(t => t.status === 'VACANT').length;
  const occupiedCount = tables.filter(t => t.status === 'OCCUPIED').length;
  const nearLimitCount = tables.filter(t => t.status === 'NEAR_LIMIT').length;
  const delayedCount = tables.filter(t => t.status === 'DELAYED_ALERT').length;
  const reservedCount = tables.filter(t => t.status === 'RESERVED').length;
  const expiredCount = tables.filter(t => {
    const s = t.currentSessionId ? sessions[t.currentSessionId] : undefined;
    return s && s.remainingMinutes !== undefined && s.remainingMinutes <= 0;
  }).length;

  const zones = ['ALL', 'Indoor Zone A', 'Indoor Zone B', 'VIP Terrace', 'Outdoor Garden'];

  const filteredTables = selectedZone === 'ALL' 
    ? tables 
    : selectedZone === 'EXPIRED'
    ? tables.filter(t => {
        const s = t.currentSessionId ? sessions[t.currentSessionId] : undefined;
        return s && s.remainingMinutes !== undefined && s.remainingMinutes <= 0;
      })
    : tables.filter(t => t.zone === selectedZone);

  // Handle Open Table submission
  const handleOpenTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openTableModalTable) return;
    if (fullGuestsCount + halfGuestsCount + freeGuestsCount === 0) {
      alert(isLao ? 'ກະລຸນາໃສ່ຈຳນວນແຂກຢ່າງໜ້ອຍ 1 ທ່ານ' : 'Please specify at least 1 guest');
      return;
    }
    onOpenTable(
      openTableModalTable.code,
      selectedPackage,
      fullGuestsCount,
      halfGuestsCount,
      freeGuestsCount,
      initialExtraChairs
    );
    showNotification(
      isLao 
        ? `ເປີດໂຕະ ${openTableModalTable.code} ສຳເລັດ! (ແພັກເກັດ ${BUFFET_PACKAGES[selectedPackage].nameLao})` 
        : `Table ${openTableModalTable.code} successfully opened with ${selectedPackage} package!`
    );
    setOpenTableModalTable(null);
  };

  // Handle Mid-Meal Guest submission
  const handleMidMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!midMealModalTable) return;
    onAddMidMealGuests(
      midMealModalTable.code,
      midMealFull,
      midMealHalf,
      midMealFree,
      midMealNote || (isLao ? 'ແຂກມາເພີ່ມກາງຄາບ' : 'Mid-meal guest')
    );
    showNotification(
      isLao 
        ? `ເພີ່ມແຂກໃສ່ໂຕະ ${midMealModalTable.code} ສຳເລັດ! ຍອດບິນຖືກອັບເດດອັດຕະໂນມັດ` 
        : `Added guests to Table ${midMealModalTable.code}. Bill subtotal recalculated!`
    );
    setMidMealModalTable(null);
  };

  // Handle Merge Tables submission
  const handleMergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterTableCode || selectedSlaveCodes.length === 0) {
      alert(isLao ? 'ກະລຸນາເລືອກໂຕະຫຼັກ ແລະ ໂຕະທີ່ຈະນຳມາຮວມ' : 'Please select a Master table and at least 1 table to merge');
      return;
    }
    onMergeTables(masterTableCode, selectedSlaveCodes);
    showNotification(
      isLao 
        ? `ຮວມໂຕະ ${selectedSlaveCodes.join(', ')} ເຂົ້າກັບໂຕະຫຼັກ ${masterTableCode} ສຳເລັດ!` 
        : `Merged tables ${selectedSlaveCodes.join(', ')} into master table ${masterTableCode}!`
    );
    setMergeModalOpen(false);
    setSelectedSlaveCodes([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span className="text-sm font-semibold">{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP ANALYTICS COUNTER CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Available Tables */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isLao ? 'ໂຕະຫວ່າງພ້ອມບໍລິການ' : 'Available Tables'}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{availableCount}</span>
                <span className="text-xs text-slate-400 font-medium">/{tables.length} {isLao ? 'ໂຕະ' : 'tables'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{isLao ? 'ພ້ອມຕ້ອນຮັບລູກຄ້າໃໝ່ທັນທີ' : 'Ready for walk-in seating'}</span>
          </div>
        </div>

        {/* Occupied Tables */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isLao ? 'ໂຕະກຳລັງນັ່ງກິນ / ສັ່ງອາຫານ' : 'Occupied Tables'}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{occupiedCount}</span>
                <span className="text-xs text-slate-400 font-medium">
                  {Math.round((occupiedCount / tables.length) * 100)}% {isLao ? 'ການໃຊ້ງານ' : 'Occupancy'}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Utensils className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>{isLao ? 'ກຳລັງດຳເນີນການສັ່ງ & ເສີບ' : 'Active dining sessions'}</span>
          </div>
        </div>

        {/* Tables Near Time Limit (< 15 mins) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isLao ? 'ໂຕະໃກ້ໝົດເວລາ (< 15 ນາທີ)' : 'Near Time Limit (<15m)'}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{nearLimitCount}</span>
                <span className="text-xs text-amber-600/80 font-medium">{isLao ? 'ແຈ້ງເຕືອນລ່ວງໜ້າ' : 'Warning'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{isLao ? 'ກຽມແຈ້ງ Last Call ຂອງຫວານ' : 'Prepare dessert last-call'}</span>
          </div>
        </div>

        {/* Tables with Delayed Orders (> 10 mins) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-red-200 dark:border-red-900/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isLao ? 'ໂຕະອາຫານຊັກຊ້າ (Care Alert)' : 'Delayed Food Alerts'}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">{delayedCount}</span>
                <span className="text-xs text-red-500 font-medium">{isLao ? 'ຕ້ອງການດູແລດ່ວນ' : 'Requires Care'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-red-700 dark:text-red-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>{isLao ? 'ພະນັກງານຄວນເຂົ້າໄປຂໍອະໄພ' : 'Staff care intervention'}</span>
          </div>
        </div>

      </div>

      {/* ACTION BAR & ZONE FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        
        {/* Zone Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {zones.map(zone => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedZone === zone
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {zone === 'ALL' 
                ? (isLao ? 'ທຸກໂຊນ (All Zones)' : 'All Zones') 
                : zone}
            </button>
          ))}

          {expiredCount > 0 && (
            <button
              onClick={() => setSelectedZone(selectedZone === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 animate-pulse ${
                selectedZone === 'EXPIRED'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40 ring-2 ring-red-400'
                  : 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-300 dark:border-red-800'
              }`}
              title={isLao ? 'ກັ່ນຕອງສະເພາະໂຕະທີ່ເບິດເວລາແລ້ວ' : 'Filter expired tables'}
            >
              <Clock className="w-3.5 h-3.5 text-red-500 animate-spin" />
              <span>{isLao ? `🚨 ເບິດເວລາແລ້ວ (${expiredCount})` : `🚨 Time Expired (${expiredCount})`}</span>
            </button>
          )}
        </div>

        {/* Global Action Buttons: Merge Tables, Quick Reservation */}
        <div className="flex items-center gap-2">
          {onResetToCleanShift && (
            <button
              onClick={onResetToCleanShift}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-600"
              title="ຣີເຊັດທຸກໂຕະໃຫ້ເປັນ 0 (ຫວ່າງທັງໝົດ)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>{isLao ? 'ຣີເຊັດເປັນ 0 (Clean Shift)' : 'Reset 0'}</span>
            </button>
          )}

          {onLoadDemoBusyShift && (
            <button
              onClick={onLoadDemoBusyShift}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition"
              title="ໂຫຼດຂໍ້ມູນຈຳລອງມີໂຕະກຳລັງກິນ"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>{isLao ? 'ໂຫຼດຂໍ້ມູນຈຳລອງ (Demo)' : 'Load Demo'}</span>
            </button>
          )}

          {/* Table QR Stand Modal Button */}
          <button
            id="btn-table-qr-stands"
            onClick={() => {
              setQrModalTableCode(tables[0]?.code || 'A-01');
              setIsQrModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition transform active:scale-95"
            title="ປ້າຍ QR Code ສັ່ງອາຫານປະຈຳໂຕະ"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{isLao ? 'ປ້າຍ QR ສັ່ງອາຫານ' : 'Table QR Stands'}</span>
          </button>

          <button
            id="btn-merge-tables"
            onClick={() => setMergeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold transition"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{isLao ? 'ຮວມບິນຫຼາຍໂຕະ (Merge Bills)' : 'Merge Bills'}</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC FLOOR PLAN GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map(table => {
          const session = table.currentSessionId ? sessions[table.currentSessionId] : undefined;
          const pkg = session ? BUFFET_PACKAGES[session.packageTier] : undefined;
          const totalSeats = table.defaultCapacity + table.extraChairs;
          const isDelayedAlert = table.status === 'DELAYED_ALERT';
          const isReserved = table.status === 'RESERVED';
          const isVacant = table.status === 'VACANT';
          const isOccupied = table.status === 'OCCUPIED' || table.status === 'NEAR_LIMIT' || isDelayedAlert;

          // Time tracking & duration
          const durationTotal = session?.durationMinutes || 90;
          const remainingMinutes = session?.remainingMinutes !== undefined 
            ? session.remainingMinutes 
            : (table.status === 'NEAR_LIMIT' ? 10 : 60);
          const elapsedMinutes = Math.max(0, durationTotal - remainingMinutes);
          const isTimeExpired = remainingMinutes <= 0;
          const isNearLimit = remainingMinutes > 0 && remainingMinutes <= 15;
          const startTimeFormatted = session?.startTime 
            ? new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : '18:30';

          // Food orders for this table
          const tableOrders = (orders || []).filter(o => o.tableCode === table.code || (session && o.sessionId === session.id));
          const allSessionOrders = (session?.orders && session.orders.length > 0) ? session.orders : tableOrders;
          const allOrderItems = allSessionOrders.flatMap(o => o.items || []);
          const totalOrderedDishes = allOrderItems.reduce((sum, item) => sum + item.quantity, 0);
          const firstOrder = allSessionOrders.length > 0 ? allSessionOrders[allSessionOrders.length - 1] : null;
          const firstOrderTime = firstOrder?.orderTime
            ? new Date(firstOrder.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : null;
          const firstOrderElapsedMins = firstOrder?.orderTime
            ? Math.max(0, Math.floor((Date.now() - new Date(firstOrder.orderTime).getTime()) / 60000))
            : null;

          return (
            <div
              key={table.id}
              className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-800 flex flex-col justify-between p-4 shadow-sm hover:shadow-md relative ${
                isTimeExpired
                  ? 'border-red-500 ring-2 ring-red-500/40 shadow-red-500/20 bg-red-50/10'
                  : isDelayedAlert 
                  ? 'border-red-500 ring-2 ring-red-500/20 shadow-red-500/10' 
                  : isNearLimit
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : isOccupied
                  ? 'border-blue-300 dark:border-blue-800'
                  : isReserved
                  ? 'border-purple-300 dark:border-purple-800 border-dashed'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              
              {/* Top Header of Table Card */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                      {table.code}
                    </span>
                    
                    {/* Zone Badge */}
                    <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {table.zone.replace('Indoor ', '').replace('Outdoor ', '')}
                    </span>
                  </div>

                  {/* Seat Capacity & Extra Chairs */}
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{table.defaultCapacity} {isLao ? 'ບ່ອນນັ່ງ' : 'Seats'}</span>
                    {table.extraChairs > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-md border border-amber-300 dark:border-amber-700 flex items-center gap-0.5">
                        <Armchair className="w-3 h-3" />
                        +{table.extraChairs} {isLao ? 'ຕັ່ງເສີມ' : 'Extra'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge & QR Stand Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrModalTableCode(table.code);
                      setIsQrModalOpen(true);
                    }}
                    className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700/80 hover:bg-amber-500 hover:text-slate-950 text-slate-500 dark:text-slate-300 transition"
                    title={isLao ? `ເບິ່ງປ້າຍ QR ໂຕະ ${table.code}` : `View QR Code Stand for Table ${table.code}`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  {isVacant && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {isLao ? 'ຫວ່າງ' : 'Vacant'}
                    </span>
                  )}
                  {isTimeExpired ? (
                    <button
                      id={`btn-time-expired-${table.code}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToBilling(table.code);
                      }}
                      title={isLao ? 'ເບິດເວລາແລ້ວ! ກົດທີ່ນີ້ເພື່ອທຳການຊຳລະເງິນໃຫ້ລູກຄ້າ' : 'Time Expired! Click here to settle payment for customer'}
                      className="group px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-red-600/50 animate-pulse ring-2 ring-red-400 cursor-pointer transition transform active:scale-95"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                      <Clock className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                      <span className="tracking-tight">{isLao ? 'ເບິດເວລາແລ້ວ' : 'Time Expired'}</span>
                      <span className="text-[10px] bg-red-800/90 text-amber-200 group-hover:bg-white group-hover:text-red-700 px-1.5 py-0.5 rounded font-bold transition">
                        {isLao ? 'ຊຳລະເງິນ' : 'Pay'} →
                      </span>
                    </button>
                  ) : isNearLimit ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3" />
                      {isLao ? 'ໃກ້ໝົດເວລາ' : 'Near Limit'}
                    </span>
                  ) : isOccupied ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      {isLao ? 'ກຳລັງກິນ' : 'Occupied'}
                    </span>
                  ) : null}
                  {isDelayedAlert && !isTimeExpired && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 flex items-center gap-1 animate-bounce">
                      <BellRing className="w-3 h-3" />
                      {isLao ? 'ອາຫານຊ້າ (>10m)' : 'Delayed Alert'}
                    </span>
                  )}
                  {isReserved && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {isLao ? 'ຈອງແລ້ວ' : 'Reserved'}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Section: Active Session Details or Empty State */}
              <div className="my-3 py-2 border-y border-slate-100 dark:border-slate-700/60 min-h-[90px] flex flex-col justify-center">
                {session && pkg ? (
                  <div className="space-y-2">
                    {/* Buffet Package Badge & Price */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${pkg.badgeBg} ${pkg.badgeText} border ${pkg.badgeBorder}`}>
                        {pkg.nameEn.split(' ')[0]} BUFFET
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {pkg.priceLAK.toLocaleString()} ₭
                      </span>
                    </div>

                    {/* Guests Breakdown: Full, Half, Free */}
                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <span className="font-semibold">{session.guests.length} {isLao ? 'ທ່ານ:' : 'Guests:'}</span>
                      <span className="text-[11px] text-slate-500">
                        {session.guests.filter(g => g.type === 'FULL').length} Full • {session.guests.filter(g => g.type === 'HALF').length} Half • {session.guests.filter(g => g.type === 'FREE').length} Free
                      </span>
                    </div>

                    {/* Elapsed & Remaining Time Tracking Box */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                      
                      {/* 1. Time Elapsed & Start Time */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{isLao ? 'ຕອນນີ້ກິນໄດ້:' : 'Elapsed:'}</span>
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {isLao ? `${elapsedMinutes} ນາທີ` : `${elapsedMinutes} mins`} 
                          <span className="text-[10px] text-slate-400 font-normal ml-1">
                            ({isLao ? `ເລີ່ມ ${startTimeFormatted}` : `from ${startTimeFormatted}`})
                          </span>
                        </span>
                      </div>

                      {/* 2. Remaining Time with Quick Test Controls */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Hourglass className="w-3 h-3 text-amber-500" />
                          <span>{isLao ? 'ເວລາທີ່ເຫຼືອ:' : 'Remaining:'}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black ${
                            isTimeExpired 
                              ? 'text-red-600 dark:text-red-400 animate-pulse text-xs' 
                              : isNearLimit 
                              ? 'text-amber-500' 
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isTimeExpired 
                              ? (isLao ? '0 ນາທີ (ເບິດເວລາແລ້ວ!)' : '0 mins (Time Expired!)') 
                              : (isLao ? `${remainingMinutes} ນາທີ` : `${remainingMinutes} mins`)}
                          </span>

                          {/* Quick Pay Button right next to expired timer */}
                          {isTimeExpired && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToBilling(table.code);
                              }}
                              title={isLao ? 'ເບິດເວລາແລ້ວ! ກົດເພື່ອທຳການຊຳລະເງິນໃຫ້ລູກຄ້າ' : 'Time Expired! Click to settle payment for customer'}
                              className="px-2 py-0.5 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[10px] font-black shadow-sm flex items-center gap-1 animate-pulse cursor-pointer transition transform active:scale-95"
                            >
                              <CreditCard className="w-3 h-3 text-yellow-300" />
                              <span>{isLao ? 'ຊຳລະເງິນ' : 'Pay'}</span>
                            </button>
                          )}

                          {/* Interactive time controls for staff/testing */}
                          {onAdjustRemainingMinutes && (
                            <div className="flex items-center gap-0.5 ml-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAdjustRemainingMinutes(table.code, 0);
                                }}
                                title={isLao ? 'ຈຳລອງເວລາໝົດ (0 ນາທີ) ເພື່ອເບິ່ງໄອຄອນສີແດງ ເບິດເວລາແລ້ວ' : 'Simulate 0m Expired (Red Alert)'}
                                className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 font-black cursor-pointer"
                              >
                                0m!
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAdjustRemainingMinutes(table.code, Math.max(0, remainingMinutes - 15));
                                }}
                                title="-15 ນາທີ"
                                className="px-1 py-0.5 rounded text-[9px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                              >
                                -15m
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAdjustRemainingMinutes(table.code, remainingMinutes + 15);
                                }}
                                title="+15 ນາທີ"
                                className="px-1 py-0.5 rounded text-[9px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                              >
                                +15m
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isTimeExpired 
                              ? 'bg-red-600 animate-pulse' 
                              : isNearLimit 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((elapsedMinutes / durationTotal) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Food Items Ordered Box */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Utensils className="w-3 h-3 text-amber-500" />
                          <span>
                            {isLao 
                              ? `ສັ່ງອາຫານ: ${totalOrderedDishes} ລາຍການ` 
                              : `Food Orders: ${totalOrderedDishes} items`}
                          </span>
                        </span>
                        {firstOrderTime && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {isLao 
                              ? `ເລີ່ມສັ່ງ ${firstOrderElapsedMins !== null ? `${firstOrderElapsedMins}m ກ່ອນ` : ''} (${firstOrderTime})` 
                              : `Started ${firstOrderElapsedMins !== null ? `${firstOrderElapsedMins}m ago` : ''} (${firstOrderTime})`}
                          </span>
                        )}
                      </div>

                      {/* Dishes chips preview */}
                      {allOrderItems.length > 0 ? (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {allOrderItems.slice(0, 3).map((item, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 font-medium truncate max-w-[130px]"
                            >
                              {isLao ? item.nameLao : item.nameEn} ×{item.quantity}
                            </span>
                          ))}
                          {allOrderItems.length > 3 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingOrderTable(table);
                              }}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                            >
                              +{allOrderItems.length - 3} {isLao ? 'ເມນູ (ເບິ່ງທັງໝົດ)' : 'more...'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">
                          {isLao ? 'ຍັງບໍ່ມີອໍເດີ (ກົດ "ສັ່ງ" ເພື່ອເລີ່ມສັ່ງ)' : 'No orders yet'}
                        </p>
                      )}
                    </div>

                    {/* Delayed Alert Notice */}
                    {isDelayedAlert && !isTimeExpired && (
                      <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg p-1.5 flex items-center justify-between text-[10px] text-red-700 dark:text-red-300">
                        <span className="font-medium">⚠️ {isLao ? 'ອໍເດີ #0895 ຊ້າ 12 ນາທີ' : 'Order #0895 delayed 12m'}</span>
                        <button
                          onClick={() => onSendDelayedCareAlert(table.code)}
                          className="px-1.5 py-0.5 bg-red-600 text-white rounded font-bold hover:bg-red-700 text-[9px]"
                        >
                          {isLao ? 'ສົ່ງດູແລ' : 'Care Ping'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2 text-slate-400 dark:text-slate-500">
                    <p className="text-xs">{isLao ? 'ໂຕະຫວ່າງ ພ້ອມຮັບແຂກ' : 'Table is vacant & ready'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{isLao ? 'ກົດ "ເປີດໂຕະ" ເພື່ອເລີ່ມ Session' : 'Click "Open Table" to begin'}</p>
                  </div>
                )}
              </div>

              {/* Bottom Action Section */}
              <div className="space-y-1.5 pt-1">
                
                {/* Flashing Red Alert Banner: Time Expired! */}
                {isTimeExpired && (
                  <div 
                    onClick={() => onNavigateToBilling(table.code)}
                    className="cursor-pointer bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl p-2.5 flex items-center justify-between text-xs font-black shadow-lg shadow-red-600/40 animate-pulse transition active:scale-98 ring-2 ring-red-400"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-yellow-300 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping"></span>
                          <span className="text-xs font-black">{isLao ? '🚨 ເບິດເວລາແລ້ວ! ກົດເພື່ອທຳການຊຳລະເງິນ' : '🚨 Time Expired! Click to Pay'}</span>
                        </div>
                        <div className="text-[10px] text-red-100 font-normal">
                          {isLao ? 'ກົດທີ່ໄອຄອນນີ້ເພື່ອທຳການຊຳລະເງິນໃຫ້ລູກຄ້າທັນທີ' : 'Click here to proceed to customer payment'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white text-red-700 hover:bg-yellow-300 hover:text-slate-950 px-2.5 py-1.5 rounded-lg font-black shrink-0 shadow-sm flex items-center gap-1 transition">
                      <CreditCard className="w-3.5 h-3.5" />
                      {isLao ? 'ຊຳລະເງິນ' : 'Pay'} →
                    </span>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center gap-1.5">
                  {isVacant ? (
                    <button
                      id={`btn-open-table-${table.code}`}
                      onClick={() => {
                        setOpenTableModalTable(table);
                        setFullGuestsCount(table.defaultCapacity);
                        setHalfGuestsCount(0);
                        setFreeGuestsCount(0);
                        setInitialExtraChairs(0);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold hover:bg-slate-800 dark:hover:bg-amber-400 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{isLao ? 'ເປີດໂຕະ (Open Table)' : 'Open Table'}</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-4 gap-1 w-full">
                      
                      {/* Add Mid-Meal Guest */}
                      <button
                        id={`btn-add-guest-${table.code}`}
                        onClick={() => {
                          setMidMealModalTable(table);
                          setMidMealFull(1);
                          setMidMealHalf(0);
                          setMidMealFree(0);
                        }}
                        title={isLao ? 'ເພີ່ມແຂກກາງຄາບ' : 'Add Mid-Meal Guests'}
                        className="py-1.5 px-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-0.5"
                      >
                        <Users className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>{isLao ? '+ແຂກ' : '+Guest'}</span>
                      </button>

                      {/* Seat Extra Chair (+ / -) */}
                      <button
                        id={`btn-extra-chair-${table.code}`}
                        onClick={() => setSeatModalTable(table)}
                        title={isLao ? 'ຈັດການເກົ້າອີ້ເສີມ' : 'Manage Extra Chairs'}
                        className="py-1.5 px-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-0.5"
                      >
                        <Armchair className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{isLao ? 'ຕັ່ງ' : 'Seat'}</span>
                      </button>

                      {/* Order Food directly to Kitchen KDS */}
                      <button
                        id={`btn-order-kds-${table.code}`}
                        onClick={() => {
                          if (onNavigateToMobileSimulator) {
                            onNavigateToMobileSimulator(table.code);
                          }
                        }}
                        title={isLao ? 'ສັ່ງອາຫານສົ່ງເຂົ້າຄົວ KDS' : 'Order Food to Kitchen'}
                        className="py-1.5 px-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center gap-0.5"
                      >
                        <Utensils className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{isLao ? 'ສັ່ງ' : 'Order'}</span>
                      </button>

                      {/* Bill / Checkout Button: Turns Vibrant Red with Pay icon when time expired! */}
                      <button
                        id={`btn-bill-${table.code}`}
                        onClick={() => onNavigateToBilling(table.code)}
                        title={isTimeExpired ? (isLao ? 'ເບິດເວລາແລ້ວ! ກົດເພື່ອທຳການຊຳລະເງິນໃຫ້ລູກຄ້າ' : 'Time Expired! Click to settle payment') : (isLao ? 'ຊຳລະເງິນ / Check-out' : 'Billing & Payment')}
                        className={`py-1.5 px-1 rounded-lg text-[10px] flex items-center justify-center gap-0.5 transition cursor-pointer ${
                          isTimeExpired
                            ? 'bg-red-600 hover:bg-red-700 text-white font-black animate-pulse ring-2 ring-red-400 shadow-lg shadow-red-600/40'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm'
                        }`}
                      >
                        {isTimeExpired ? (
                          <>
                            <CreditCard className="w-3.5 h-3.5 text-yellow-300 shrink-0 animate-bounce" />
                            <span>{isLao ? 'ຊຳລະເງິນ' : 'Pay'}</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3 h-3 shrink-0" />
                            <span>{isLao ? 'ຊຳລະເງິນ' : 'Bill'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: OPEN TABLE MODAL */}
      {/* ========================================================================= */}
      {openTableModalTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-base border border-amber-500/20">
                  {openTableModalTable.code}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {isLao ? `ເປີດໂຕະບຸບເຟ່ ${openTableModalTable.code}` : `Open Buffet Session for ${openTableModalTable.code}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {openTableModalTable.zone} • {openTableModalTable.defaultCapacity} {isLao ? 'ບ່ອນນັ່ງມາດຕະຖານ' : 'Default Seats'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setOpenTableModalTable(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOpenTableSubmit} className="space-y-4 mt-4">
              
              {/* Package Selection with Images Under Each Tier */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isLao ? '1. ເລືອກແພັກເກັດບຸບເຟ່ (Select Buffet Tier):' : '1. Select Buffet Package Tier:'}</span>
                  </label>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {isLao ? '✨ ມີຮູບພາບເມນູຕົວຢ່າງ' : '✨ Includes food photos'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {(Object.keys(BUFFET_PACKAGES) as BuffetPackageTier[]).map((tierKey) => {
                    const p = BUFFET_PACKAGES[tierKey];
                    const isSelected = selectedPackage === tierKey;
                    return (
                      <button
                        type="button"
                        key={tierKey}
                        onClick={() => setSelectedPackage(tierKey)}
                        className={`group relative p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between overflow-hidden cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 text-slate-900 dark:text-white shadow-md shadow-amber-500/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-amber-400/50 bg-slate-50/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Header of Tier Card */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${p.badgeBg} ${p.badgeText}`}>
                              {tierKey}
                            </span>
                            {isSelected ? (
                              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            ) : (
                              tierKey === 'VIP' && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                          </div>
                          
                          <div className="font-extrabold text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-1.5">
                            {p.priceLAK.toLocaleString()} ₭
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {p.durationMinutes} {isLao ? 'ນາທີ' : 'min'}
                          </div>
                        </div>

                        {/* Food Image under each package */}
                        <div className="relative mt-2 rounded-xl overflow-hidden aspect-[4/3] bg-slate-900/10 border border-slate-200/80 dark:border-slate-700/80 shadow-inner group-hover:border-amber-400/60 transition">
                          <img
                            src={p.imageUrl}
                            alt={p.nameLao}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1.5">
                            <span className="text-[10px] font-bold text-white line-clamp-1 drop-shadow leading-tight">
                              {p.highlightDish || (tierKey === 'STANDARD' ? 'ໝູສະໄລ້ & ໄກ່' : tierKey === 'PREMIUM' ? 'ງົວ & ຊີຟູດ' : 'ວາກິວ & ແຊວມອນ')}
                            </span>
                          </div>
                          {/* Zoom button on hover */}
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImageModal({
                                url: p.imageUrl || '',
                                title: `${p.id} - ${p.nameLao}`,
                                subtitle: p.descriptionLao
                              });
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-md bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                            title={isLao ? 'ເບິ່ງຮູບໃຫຍ່' : 'Zoom photo'}
                          >
                            <ZoomIn className="w-3 h-3" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Package Detailed Info Banner Underneath the 3 packages */}
                {selectedPackage && BUFFET_PACKAGES[selectedPackage] && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 dark:to-slate-800/40 border border-amber-500/25 flex gap-3 items-center">
                    <div 
                      className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-amber-500/40 shadow-sm cursor-pointer group"
                      onClick={() => setPreviewImageModal({
                        url: BUFFET_PACKAGES[selectedPackage].imageUrl || '',
                        title: `${selectedPackage} - ${BUFFET_PACKAGES[selectedPackage].nameLao}`,
                        subtitle: BUFFET_PACKAGES[selectedPackage].descriptionLao
                      })}
                      title={isLao ? 'ຄລິກເພື່ອເບິ່ງຮູບຂະໜາດເຕັມ' : 'Click to view full photo'}
                    >
                      <img
                        src={BUFFET_PACKAGES[selectedPackage].imageUrl}
                        alt="Selected tier preview"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition">
                        <ZoomIn className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {BUFFET_PACKAGES[selectedPackage].nameLao}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                          {BUFFET_PACKAGES[selectedPackage].durationMinutes} {isLao ? 'ນາທີ' : 'mins'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2">
                        {BUFFET_PACKAGES[selectedPackage].descriptionLao}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-700 dark:text-amber-300 font-semibold flex-wrap">
                        <span className="bg-white/80 dark:bg-slate-800/90 px-1.5 py-0.5 rounded border border-amber-500/25">
                          ✨ {BUFFET_PACKAGES[selectedPackage].highlightDish || BUFFET_PACKAGES[selectedPackage].features[0]}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {isLao ? 'ລວມນ້ຳດື່ມ, ຜັກສົດ & ຂອງຫວານບໍ່ອັ້ນ' : 'Unlimited drinks, greens & dessert'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guest Counts: Full Price, Half Price (Kids), Free (Toddler) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isLao ? '2. ຈຳນວນແຂກຕາມປະເພດລາຄາ (Guest Breakdown):' : '2. Guest Breakdown by Pricing Tier:'}
                </label>
                
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {/* Full Price */}
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {isLao ? 'ຜູ້ໃຫຍ່ (Full Price 100%)' : 'Adults (Full Price)'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {BUFFET_PACKAGES[selectedPackage].priceLAK.toLocaleString()} ₭ / {isLao ? 'ທ່ານ' : 'pax'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFullGuestsCount(Math.max(0, fullGuestsCount - 1))}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-slate-700 dark:text-white font-bold"
                      >-</button>
                      <span className="w-6 text-center font-bold text-slate-800 dark:text-white">{fullGuestsCount}</span>
                      <button
                        type="button"
                        onClick={() => setFullGuestsCount(fullGuestsCount + 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-slate-700 dark:text-white font-bold"
                      >+</button>
                    </div>
                  </div>

                  {/* Half Price */}
                  <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {isLao ? 'ເດັກນ້ອຍ (Half Price 50% ຫຼຸດເຄິ່ງ)' : 'Children (50% Off)'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {(BUFFET_PACKAGES[selectedPackage].priceLAK * 0.5).toLocaleString()} ₭ / {isLao ? 'ທ່ານ' : 'pax'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHalfGuestsCount(Math.max(0, halfGuestsCount - 1))}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-slate-700 dark:text-white font-bold"
                      >-</button>
                      <span className="w-6 text-center font-bold text-slate-800 dark:text-white">{halfGuestsCount}</span>
                      <button
                        type="button"
                        onClick={() => setHalfGuestsCount(halfGuestsCount + 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-slate-700 dark:text-white font-bold"
                      >+</button>
                    </div>
                  </div>

                  {/* Free Guests */}
                  <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {isLao ? 'ເດັກນ້ອຍຕ່ຳກວ່າ 90cm / VIP (Free 100%)' : 'Toddlers / Free VIP (0 ₭)'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        0 ₭ ({isLao ? 'ບໍ່ຄິດເງິນ' : 'Free'})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFreeGuestsCount(Math.max(0, freeGuestsCount - 1))}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-slate-700 dark:text-white font-bold"
                      >-</button>
                      <span className="w-6 text-center font-bold text-slate-800 dark:text-white">{freeGuestsCount}</span>
                      <button
                        type="button"
                        onClick={() => setFreeGuestsCount(freeGuestsCount + 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-slate-700 dark:text-white font-bold"
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Chairs Allocation */}
              <div className="flex items-center justify-between bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-xs">
                <div className="flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-300">
                      {isLao ? 'ເພີ່ມເກົ້າອີ້ເສີມ (Extra Chairs):' : 'Add Extra Chairs:'}
                    </span>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400">
                      {isLao ? `ສູງສຸດບໍ່ເກີນ +${openTableModalTable.maxExtraChairs} ຕັ່ງ` : `Max +${openTableModalTable.maxExtraChairs} chairs`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInitialExtraChairs(Math.max(0, initialExtraChairs - 1))}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 text-amber-900 dark:text-amber-300 font-bold"
                  >-</button>
                  <span className="w-5 text-center font-bold text-amber-900 dark:text-amber-300">{initialExtraChairs}</span>
                  <button
                    type="button"
                    onClick={() => setInitialExtraChairs(Math.min(openTableModalTable.maxExtraChairs, initialExtraChairs + 1))}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 text-amber-900 dark:text-amber-300 font-bold"
                  >+</button>
                </div>
              </div>

              {/* Subtotal Calculation Preview */}
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">{isLao ? 'ຄາດຄະເນຍອດບຸບເຟ່ເບື້ອງຕົ້ນ' : 'Estimated Buffet Subtotal'}</div>
                  <div className="text-xs font-medium text-slate-300">
                    {fullGuestsCount + halfGuestsCount + freeGuestsCount} {isLao ? 'ທ່ານ' : 'Guests'} • {BUFFET_PACKAGES[selectedPackage].durationMinutes} {isLao ? 'ນາທີ' : 'mins'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-amber-400">
                    {(
                      fullGuestsCount * BUFFET_PACKAGES[selectedPackage].priceLAK +
                      halfGuestsCount * (BUFFET_PACKAGES[selectedPackage].priceLAK * 0.5)
                    ).toLocaleString()} ₭
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenTableModalTable(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isLao ? 'ຍົກເລີກ' : 'Cancel'}
                </button>
                <button
                  id="btn-confirm-open-table"
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20"
                >
                  {isLao ? 'ຢືນຢັນເປີດໂຕະ (Confirm Open)' : 'Confirm Open Session'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MID-MEAL GUEST ADDITION MODAL */}
      {/* ========================================================================= */}
      {midMealModalTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isLao ? `ເພີ່ມແຂກກາງຄາບ - ໂຕະ ${midMealModalTable.code}` : `Add Mid-Meal Guests to ${midMealModalTable.code}`}
                </h3>
                <p className="text-xs text-slate-500">
                  {isLao ? 'ຄິດໄລ່ແພັກເກັດຕາມໂຕະ ແລະ ໝົດເວລາພ້ອມໂຕະ' : 'Inherits table package tier and remaining session time'}
                </p>
              </div>
              <button 
                onClick={() => setMidMealModalTable(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMidMealSubmit} className="space-y-4 mt-4">
              
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {isLao ? 'ຜູ້ໃຫຍ່ (Full Price):' : 'Adults (Full Price):'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMidMealFull(Math.max(0, midMealFull - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border text-slate-700 dark:text-white font-bold"
                    >-</button>
                    <span className="w-6 text-center font-bold text-slate-800 dark:text-white">{midMealFull}</span>
                    <button
                      type="button"
                      onClick={() => setMidMealFull(midMealFull + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border text-slate-700 dark:text-white font-bold"
                    >+</button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {isLao ? 'ເດັກນ້ອຍ (Half Price 50%):' : 'Children (50%):'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMidMealHalf(Math.max(0, midMealHalf - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border text-slate-700 dark:text-white font-bold"
                    >-</button>
                    <span className="w-6 text-center font-bold text-slate-800 dark:text-white">{midMealHalf}</span>
                    <button
                      type="button"
                      onClick={() => setMidMealHalf(midMealHalf + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border text-slate-700 dark:text-white font-bold"
                    >+</button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {isLao ? 'ເດັກນ້ອຍ (Free 100%):' : 'Toddler / Free:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMidMealFree(Math.max(0, midMealFree - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border text-slate-700 dark:text-white font-bold"
                    >-</button>
                    <span className="w-6 text-center font-bold text-slate-800 dark:text-white">{midMealFree}</span>
                    <button
                      type="button"
                      onClick={() => setMidMealFree(midMealFree + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border text-slate-700 dark:text-white font-bold"
                    >+</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isLao ? 'ໝາຍເຫດ (Special Note):' : 'Special Note:'}
                </label>
                <input
                  type="text"
                  value={midMealNote}
                  onChange={(e) => setMidMealNote(e.target.value)}
                  placeholder={isLao ? 'ເຊັ່ນ: ໝູ່ຕາມມາກາງຄາບ ຕອນ 19:30' : 'e.g. Friend arrived at 19:30'}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMidMealModalTable(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  {isLao ? 'ຍົກເລີກ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                >
                  {isLao ? 'ບັນທຶກເພີ່ມແຂກ' : 'Save Added Guests'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MERGE TABLES / COMBINE BILLS MODAL */}
      {/* ========================================================================= */}
      {mergeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {isLao ? 'ຮວມບິນຫຼາຍໂຕະ (Merge Tables into Master Bill)' : 'Merge Tables into Master Bill'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isLao ? 'ລວມຍອດສັ່ງ ແລະ ຈຳນວນແຂກທັງໝົດເປັນ 1 ບິນດຽວ' : 'Combine orders & guests into 1 invoice'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setMergeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMergeSubmit} className="space-y-4 mt-4">
              
              {/* Step 1: Select Master Table */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isLao ? '1. ເລືອກໂຕະຫຼັກ (Master Table):' : '1. Select Master Table:'}
                </label>
                <select
                  value={masterTableCode}
                  onChange={(e) => setMasterTableCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">{isLao ? '-- ເລືອກໂຕະຫຼັກ --' : '-- Select Master Table --'}</option>
                  {tables.filter(t => t.status !== 'VACANT').map(t => (
                    <option key={t.id} value={t.code}>
                      {t.code} ({t.zone}) - {t.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Slave Tables to Merge */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isLao ? '2. ເລືອກໂຕະທີ່ຈະນຳມາຮວມ (Select Tables to Merge):' : '2. Select Tables to Merge:'}
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  {tables
                    .filter(t => t.status !== 'VACANT' && t.code !== masterTableCode)
                    .map(t => {
                      const isChecked = selectedSlaveCodes.includes(t.code);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedSlaveCodes(selectedSlaveCodes.filter(c => c !== t.code));
                            } else {
                              setSelectedSlaveCodes([...selectedSlaveCodes, t.code]);
                            }
                          }}
                          className={`p-2 rounded-lg text-xs font-bold text-center border transition ${
                            isChecked
                              ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200'
                          }`}
                        >
                          {t.code}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMergeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  {isLao ? 'ຍົກເລີກ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                >
                  {isLao ? 'ຢືນຢັນຮວມບິນ (Confirm Merge)' : 'Confirm Merge'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SEAT & EXTRA CHAIR MANAGEMENT */}
      {/* ========================================================================= */}
      {seatModalTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Armchair className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isLao ? `ຈັດການເກົ້າອີ້ເສີມ ໂຕະ ${seatModalTable.code}` : `Seat Management - Table ${seatModalTable.code}`}
                </h3>
              </div>
              <button 
                onClick={() => setSeatModalTable(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-center">
              
              {/* Visual Seat Representation */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 mb-2">
                  {isLao ? 'ແຜນຜັງບ່ອນນັ່ງປະຈຸບັນ' : 'Current Physical Seating Layout'}
                </div>
                
                {/* Table Top representation */}
                <div className="w-28 h-20 mx-auto bg-amber-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md my-3 relative">
                  {seatModalTable.code}
                  {/* Chairs around */}
                  <span className="absolute -top-3 px-2 py-0.5 bg-slate-800 text-white rounded-full text-[9px]">
                    {seatModalTable.defaultCapacity} Base
                  </span>
                  {seatModalTable.extraChairs > 0 && (
                    <span className="absolute -bottom-3 px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded-full text-[9px]">
                      +{seatModalTable.extraChairs} Extra
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3">
                  {isLao ? 'ບ່ອນນັ່ງລວມ:' : 'Total Capacity:'} {seatModalTable.defaultCapacity + seatModalTable.extraChairs} {isLao ? 'ບ່ອນ' : 'seats'}
                </div>
              </div>

              {/* + / - Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    onRemoveExtraChair(seatModalTable.code);
                    setSeatModalTable({ ...seatModalTable, extraChairs: Math.max(0, seatModalTable.extraChairs - 1) });
                  }}
                  disabled={seatModalTable.extraChairs <= 0}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-slate-700 dark:text-white disabled:opacity-40"
                >
                  - {isLao ? 'ຫຼຸດຕັ່ງເສີມ' : 'Remove Chair'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddExtraChair(seatModalTable.code);
                    setSeatModalTable({ ...seatModalTable, extraChairs: Math.min(seatModalTable.maxExtraChairs, seatModalTable.extraChairs + 1) });
                  }}
                  disabled={seatModalTable.extraChairs >= seatModalTable.maxExtraChairs}
                  className="px-4 py-2 rounded-xl bg-amber-500 font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 shadow-sm"
                >
                  + {isLao ? 'ເພີ່ມຕັ່ງເສີມ' : 'Add Extra Chair'}
                </button>
              </div>

            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-right">
              <button
                type="button"
                onClick={() => setSeatModalTable(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white"
              >
                {isLao ? 'ສຳເລັດ' : 'Done'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Table Ordered Items Details Modal */}
      {viewingOrderTable && (
        <div 
          onClick={() => setViewingOrderTable(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-base border border-amber-500/20">
                  {viewingOrderTable.code}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {isLao ? `ລາຍການອາຫານທີ່ສັ່ງທັງໝົດ - ໂຕະ ${viewingOrderTable.code}` : `All Orders for Table ${viewingOrderTable.code}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isLao ? 'ລາຍລະອຽດເມນູອາຫານ, ເວລາສັ່ງ ແລະ ສະຖານະໃນຄົວ' : 'Detailed order tickets and kitchen preparation status'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingOrderTable(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 max-h-[380px] overflow-y-auto space-y-3 pr-1">
              {(() => {
                const s = viewingOrderTable.currentSessionId ? sessions[viewingOrderTable.currentSessionId] : undefined;
                const tblOrders = (orders || []).filter(o => o.tableCode === viewingOrderTable.code || (s && o.sessionId === s.id));
                const activeOrders = (s?.orders && s.orders.length > 0) ? s.orders : tblOrders;

                if (!activeOrders || activeOrders.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400">
                      <Utensils className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-semibold">{isLao ? 'ຍັງບໍ່ມີອໍເດີອາຫານສຳລັບໂຕະນີ້' : 'No orders placed yet'}</p>
                    </div>
                  );
                }

                return activeOrders.map((ord, idx) => (
                  <div key={ord.id || idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs border-b border-slate-200/40 dark:border-slate-700/40 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <span>{ord.orderNumber}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          • {new Date(ord.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                          ⏱️ {isLao ? `ສັ່ງມາແລ້ວ ${Math.max(0, Math.floor((Date.now() - new Date(ord.orderTime).getTime()) / 60000))} ນາທີ` : `${Math.max(0, Math.floor((Date.now() - new Date(ord.orderTime).getTime()) / 60000))}m ago`}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        ord.status === 'READY' 
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black' 
                          : ord.status === 'COOKING' 
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black' 
                          : ord.status === 'SERVED'
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {isLao ? (
                          ord.status === 'READY' 
                            ? '✨ ແລ້ວພ້ອມເສີມ' 
                            : ord.status === 'COOKING' 
                            ? `🔥 ກຳລັງປຸງ (~${Math.max(...ord.items.map(i => i.prepTimeMinutes || 5), 5)}m)` 
                            : ord.status === 'SERVED'
                            ? '✓ ເສີບແລ້ວ'
                            : '🛎️ ລໍຖ້າຮັບອໍເດີ'
                        ) : ord.status}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {ord.items.map((it, itemIdx) => (
                        <div key={it.id || itemIdx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center">
                              {it.quantity}×
                            </span>
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {isLao ? it.nameLao : it.nameEn}
                              </span>
                              {it.specialNotes && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                                  ໝາຍເຫດ: {it.specialNotes}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold ${
                            it.status === 'READY' 
                              ? 'text-emerald-500' 
                              : it.status === 'COOKING' 
                              ? 'text-amber-500' 
                              : it.status === 'SERVED'
                              ? 'text-slate-400'
                              : 'text-blue-500'
                          }`}>
                            {isLao ? (
                              it.status === 'READY' 
                                ? '✨ ແລ້ວພ້ອມເສີມ' 
                                : it.status === 'COOKING' 
                                ? `🔥 ກຳລັງປຸງ (~${it.prepTimeMinutes || 5}m)` 
                                : it.status === 'SERVED'
                                ? '✓ ເສີບແລ້ວ'
                                : `⏱️ ລໍຖ້າຮັບ (~${it.prepTimeMinutes || 5}m)`
                            ) : it.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingOrderTable(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
              >
                {isLao ? 'ປິດ' : 'Close'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const tblCode = viewingOrderTable.code;
                  setViewingOrderTable(null);
                  if (onNavigateToMobileSimulator) {
                    onNavigateToMobileSimulator(tblCode);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>{isLao ? 'ສັ່ງອາຫານເພີ່ມໃຫ້ໂຕະນີ້' : 'Order More Dishes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table QR Stand Modal */}
      <TableQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        tables={tables}
        initialTableCode={qrModalTableCode}
        language={language}
        onOpenMobileSimulator={(tableCode) => {
          if (onNavigateToMobileSimulator) {
            onNavigateToMobileSimulator(tableCode);
          }
        }}
      />

      {/* Lightbox / Full-screen Image Preview for Package */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImageModal(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] w-full bg-slate-950">
              <img 
                src={previewImageModal.url} 
                alt={previewImageModal.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {previewImageModal.title}
              </h4>
              <p className="text-sm text-slate-300 mt-1">
                {previewImageModal.subtitle}
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewImageModal(null)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  {isLao ? 'ປິດໜ້າຕ່າງ' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
