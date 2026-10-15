import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Utensils, 
  Armchair, 
  Receipt, 
  ArrowUpRight, 
  ChevronRight, 
  RefreshCw, 
  Plus, 
  Sparkles, 
  ShieldAlert, 
  Flame, 
  DollarSign,
  Calendar,
  ChefHat,
  Search,
  Bell,
  RotateCcw
} from 'lucide-react';
import { 
  RestaurantTable, 
  TableSession, 
  Order, 
  Language, 
  BuffetPackageTier,
  BillReceipt 
} from '../../types';
import { BUFFET_PACKAGES } from '../../data/mockData';

interface ExecutiveDashboardProps {
  tables: RestaurantTable[];
  sessions: Record<string, TableSession>;
  orders: Order[];
  paidBills?: BillReceipt[];
  language: Language;
  onOpenQuickModal: () => void;
  onSelectTableForBilling: (tableCode: string) => void;
  onNavigateToFloorPlan: () => void;
  onNavigateToKds: () => void;
  onAddExtraChairs: (tableCode: string) => void;
  onAddMidMealGuest: (tableCode: string, type: 'FULL' | 'HALF' | 'FREE', count: number) => void;
  onSendCareAlert: (tableCode: string) => void;
  onResetToCleanShift?: () => void;
  onLoadDemoBusyShift?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  tables,
  sessions,
  orders,
  paidBills = [],
  language,
  onOpenQuickModal,
  onSelectTableForBilling,
  onNavigateToFloorPlan,
  onNavigateToKds,
  onAddExtraChairs,
  onAddMidMealGuest,
  onSendCareAlert,
  onResetToCleanShift,
  onLoadDemoBusyShift,
}) => {
  const isLao = language === 'la';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterZone, setFilterZone] = useState('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');

  // Real-time calculations
  const vacantTables = tables.filter(t => t.status === 'VACANT');
  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED' || t.status === 'NEAR_LIMIT' || t.status === 'DELAYED_ALERT');
  const nearLimitTables = tables.filter(t => t.status === 'NEAR_LIMIT');
  const delayedOrders = orders.filter(o => o.isDelayed);

  // Total active guests
  const totalActiveGuests = occupiedTables.reduce((sum, t) => sum + (t.currentGuests || 0), 0);

  // Active sessions value estimation
  const inProgressLAK = occupiedTables.reduce((sum, t) => {
    if (!t.currentSessionId || !sessions[t.currentSessionId]) return sum;
    const s = sessions[t.currentSessionId];
    const pkg = BUFFET_PACKAGES[s.packageTier];
    const guests = s.guests || [];
    const guestsTotal = guests.reduce((gSum, g) => gSum + (g.priceCharged || (pkg.priceLAK * (1 - g.discountPercent / 100))), 0);
    return sum + (guestsTotal || (t.currentGuests || 2) * pkg.priceLAK);
  }, 0);

  // Dynamic Completed Revenue from Paid Bills
  const completedBilledLAK = (paidBills || []).reduce((sum, b) => sum + b.netTotalLAK, 0);
  const totalRevenueToday = completedBilledLAK + inProgressLAK;
  const totalPaidBillsCount = (paidBills || []).length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      
      {/* Dashboard Header (Matching Image 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{isLao ? 'ແດຊບອດພາບລວມການດຳເນີນງານ' : 'Executive Operations Dashboard'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
              Live POS
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isLao 
              ? 'ຕິດຕາມສະຖານະໂຕະສົດ, ໄລຍະເວລາກິນບຸບເຟ່, ເວລາຄົວ KDS ແລະ ລາຍຮັບແບບ Real-time' 
              : 'Comprehensive view of buffet table turnover, dining durations, kitchen SLA, and revenue metrics.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onResetToCleanShift && (
            <button
              onClick={onResetToCleanShift}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="ຣີເຊັດທຸກໂຕະໃຫ້ເປັນ 0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>{isLao ? 'ຣີເຊັດ 0' : 'Reset 0'}</span>
            </button>
          )}

          {onLoadDemoBusyShift && (
            <button
              onClick={onLoadDemoBusyShift}
              className="px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="ໂຫຼດຂໍ້ມູນຈຳລອງ"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>{isLao ? 'ໂຫຼດ Demo' : 'Load Demo'}</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span className="hidden sm:inline">{isLao ? 'ຣີເຟຣຊ' : 'Refresh'}</span>
          </button>

          <button
            onClick={onOpenQuickModal}
            className="px-4 py-2 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-900 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-slate-950/20 dark:shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isLao ? '+ ເປີດໂຕະໃໝ່' : '+ Quick Open Table'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Counter Cards (Matching Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Available Tables */}
        <div 
          onClick={onNavigateToFloorPlan}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-500/40 transition cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isLao ? 'ໂຕະຫວ່າງພ້ອມຮັບແຂກ' : 'AVAILABLE TABLES'}
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                {vacantTables.length}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{isLao ? `${vacantTables.length} ໂຕະພ້ອມເປີດບໍລິການ` : `${vacantTables.length} vacant tables ready`}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* Card 2: Occupied Tables */}
        <div 
          onClick={onNavigateToFloorPlan}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 transition cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isLao ? 'ໂຕະກຳລັງຮັບປະທານ' : 'OCCUPIED TABLES'}
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                {occupiedTables.length}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{isLao ? `${totalActiveGuests} ຄົນກຳລັງກິນບຸບເຟ່` : `${totalActiveGuests} guests dining now`}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* Card 3: Expiring & Delayed Food Alert */}
        <div 
          onClick={onNavigateToKds}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/40 transition cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isLao ? 'ໃກ້ໝົດເວລາ & ຊັກຊ້າ' : 'NEAR LIMIT & DELAYED'}
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition flex items-center gap-2">
                <span>{nearLimitTables.length + delayedOrders.length}</span>
                {delayedOrders.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500 text-white font-bold animate-pulse">
                    {delayedOrders.length} {isLao ? 'ຊ້າ' : 'Late'}
                  </span>
                )}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{isLao ? 'ຕ້ອງການພະນັກງານດູແລດ່ວນ' : 'Requires immediate staff care'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        {/* Card 4: Total Billed Today */}
        <div 
          onClick={() => onSelectTableForBilling('A-01')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/40 transition cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isLao ? 'ຍອດຂາຍລວມມື້ນີ້ (LAK)' : 'TOTAL BILLED TODAY'}
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">
                ₭{totalRevenueToday.toLocaleString()}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{isLao ? `${totalPaidBillsCount} ບິນຊຳລະຜ່ານລະບົບແລ້ວ` : `${totalPaidBillsCount} bills closed across branch`}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

      </div>

      {/* Middle Section: Billing & Revenue Collection Summary (Matching Image 2) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span>{isLao ? 'ສະຫຼຸບຍອດຂາຍ & ການເກັບເງິນ (Billing & Revenue Summary)' : 'Billing & Revenue Collection Summary'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isLao ? 'ລາຍລະອຽດຍອດຊຳລະແລ້ວ, ມູນຄ່າໂຕະກຳລັງກິນ ແລະ ອໍເດີທີ່ຕ້ອງດູແລ' : 'Real-time fee notes, partial retainer tranches, and outstanding invoice balances'}
            </p>
          </div>
          <button 
            onClick={() => onSelectTableForBilling('A-01')}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-500 flex items-center gap-1 transition"
          >
            <span>{isLao ? 'ໄປທີ່ໜ້າເຊັກບິນ (Cashier)' : 'View Cashier & Bills'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Metric 1: Paid Amount */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                {isLao ? 'ຍອດຊຳລະແລ້ວ (PAID AMOUNT)' : 'PAID AMOUNT'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{totalPaidBillsCount} Cleared</span>
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₭{completedBilledLAK.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {isLao ? 'ບັນທຶກລົງພາບລວມແດັສບອດປະຈຳວັນແລ້ວ' : 'Deposited & recorded in daily dashboard'}
            </p>
          </div>

          {/* Metric 2: Active Dining In-Progress */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                {isLao ? 'ມູນຄ່າກຳລັງກິນ (IN-SESSION)' : 'PARTIAL / IN PROGRESS'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{occupiedTables.length} In Progress</span>
              </span>
            </div>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              ₭{inProgressLAK.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {isLao ? `${occupiedTables.length} ໂຕະກຳລັງຮັບປະທານບຸບເຟ່` : 'Estimated value of currently active buffet sessions'}
            </p>
          </div>

          {/* Metric 3: Delayed Food & Care Balance */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                {isLao ? 'ອໍເດີຊັກຊ້າ > 15 ນາທີ (DELAYED)' : 'DELAYED ORDERS'}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 ${
                delayedOrders.length > 0 
                  ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 animate-pulse' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <AlertTriangle className="w-3 h-3" />
                <span>{delayedOrders.length} Pending Attention</span>
              </span>
            </div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {delayedOrders.length > 0 ? `${delayedOrders.length} ອໍເດີ` : '0 ອໍເດີ (ທັນເວລາ)'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {isLao ? 'ສົ່ງແຈ້ງເຕືອນໃຫ້ພະນັກງານເສີບໄປດູແລແຂກ' : 'Priority care alert sent to floor staff for table'}
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: DAILY PAID BILLS OVERVIEW & REAL-TIME LEDGER */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span>{isLao ? '📋 ບັນທຶກບິນຊຳລະເງິນປະຈຳວັນ (Daily Paid Bills History)' : 'Daily Paid Bills & Settlement Ledger'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isLao 
                ? 'ທຸກບິນທີ່ກົດຊຳລະເງິນໃນໜ້າ Cashier ຈະຖືກບັນທຶກລົງພາບລວມແດັສບອດນີ້ທັນທີ' 
                : 'Every invoice finalized at checkout automatically records into this ledger.'}
            </p>
          </div>

          {/* Payment Method Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'ALL', labelLao: 'ທັງໝົດ', labelEn: 'All' },
              { id: 'LAO_QR_BCEL', labelLao: 'BCEL OnePay QR', labelEn: 'BCEL OnePay' },
              { id: 'CASH', labelLao: 'ເງິນສົດ Cash', labelEn: 'Cash' },
              { id: 'CREDIT_CARD', labelLao: 'ບັດເຄຣດິດ', labelEn: 'Card' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentMethodFilter(m.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                  paymentMethodFilter === m.id
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isLao ? m.labelLao : m.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Paid Bills Table */}
        <div className="overflow-x-auto">
          {paidBills.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-semibold">
                {isLao ? 'ຍັງບໍ່ມີບິນຊຳລະເງິນໃນຮອບນີ້ (ເມື່ອຊຳລະເງິນໃນໜ້າ Cashier ຈະບັນທຶກທີ່ນີ້ທັນທີ)' : 'No settled invoices yet'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">{isLao ? 'ເລກທີບິນ' : 'Invoice #'}</th>
                  <th className="py-2.5 px-3">{isLao ? 'ໂຕະ' : 'Table'}</th>
                  <th className="py-2.5 px-3">{isLao ? 'ແພັກເກັດ' : 'Buffet Tier'}</th>
                  <th className="py-2.5 px-3">{isLao ? 'ຈຳນວນແຂກ' : 'Guests'}</th>
                  <th className="py-2.5 px-3">{isLao ? 'ຍອດຊຳລະສຸດທິ' : 'Net Total'}</th>
                  <th className="py-2.5 px-3">{isLao ? 'ວິທີຊຳລະ' : 'Method'}</th>
                  <th className="py-2.5 px-3">{isLao ? 'ເວລາ' : 'Time'}</th>
                  <th className="py-2.5 px-3">{isLao ? 'ສະຖານະ' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paidBills
                  .filter(b => paymentMethodFilter === 'ALL' || b.paymentMethod === paymentMethodFilter)
                  .map(bill => {
                    const guestCount = bill.guestsBreakdown 
                      ? (bill.guestsBreakdown.fullPriceCount + bill.guestsBreakdown.halfPriceCount + bill.guestsBreakdown.freeCount)
                      : 2;
                    return (
                      <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {bill.billNumber}
                          {bill.bcelRef && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {bill.bcelRef}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold">
                            {bill.tableCodes.join(', ')}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {bill.packageTier}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {guestCount} {isLao ? 'ທ່ານ' : 'pax'}
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">
                          ₭ {bill.netTotalLAK.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            bill.paymentMethod === 'LAO_QR_BCEL'
                              ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                              : bill.paymentMethod === 'CASH'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                          }`}>
                            {bill.paymentMethod === 'LAO_QR_BCEL' ? 'BCEL OnePay QR' : bill.paymentMethod === 'CASH' ? 'Cash' : 'Credit Card'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">
                          {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PAID</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Real-Time Operational Workspace: Active Tables & Kitchen Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Dining Sessions & Live Countdown (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-500" />
                <span>{isLao ? 'ໂຕະກຳລັງຮັບປະທານ & ນັບເວລາຖອຍຫຼັງ' : 'Active Tables & Countdown Tracker'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isLao ? 'ຈັດການເພີ່ມຕັ່ງ, ເພີ່ມແຂກກາງຄັນ ແລະ ສົ່ງເຊັກບິນ' : 'Manage extra chairs, add mid-meal guests, and push to cashier'}
              </p>
            </div>
            <button
              onClick={onNavigateToFloorPlan}
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
            >
              {isLao ? 'ເບິ່ງຜັງເຕັມ →' : 'View Floor Plan →'}
            </button>
          </div>

          <div className="space-y-3">
            {occupiedTables.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                {isLao ? 'ບໍ່ມີໂຕະກຳລັງກິນໃນຕອນນີ້. ຄລິກ "+ ເປີດໂຕະໃໝ່" ເພື່ອເລີ່ມຕົ້ນ.' : 'No active dining tables. Click "+ Quick Open Table" to start.'}
              </div>
            ) : (
              occupiedTables.slice(0, 5).map(table => {
                const session = table.currentSessionId ? sessions[table.currentSessionId] : null;
                const pkg = session ? BUFFET_PACKAGES[session.packageTier] : BUFFET_PACKAGES.STANDARD;
                
                // Demo remaining time calculation
                const remaining = session?.remainingMinutes ?? 35;
                const isTimeExpired = remaining <= 0;
                const isNearLimit = remaining > 0 && remaining <= 15;
                const progressPercent = Math.max(5, Math.min(100, (remaining / (pkg.durationMinutes || 90)) * 100));

                return (
                  <div
                    key={table.id}
                    className={`p-3.5 rounded-xl border transition ${
                      isTimeExpired
                        ? 'border-red-500 ring-2 ring-red-500/30 bg-red-50/20 dark:bg-red-950/20'
                        : isNearLimit
                        ? 'border-purple-300 dark:border-purple-800 bg-slate-50/50 dark:bg-slate-800/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      
                      {/* Table Identifier & Package */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${
                          isTimeExpired 
                            ? 'bg-red-600 shadow-md shadow-red-600/40 animate-pulse' 
                            : isNearLimit 
                            ? 'bg-purple-600 shadow-md shadow-purple-500/30' 
                            : 'bg-slate-900 dark:bg-slate-700'
                        }`}>
                          {table.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {table.zone}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${pkg.badgeBg} ${pkg.badgeText} border ${pkg.badgeBorder}`}>
                              {pkg.nameEn.split(' ')[0]}
                            </span>
                            {table.extraChairs > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
                                +{table.extraChairs} ຕັ່ງ
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {table.currentGuests || 2} {isLao ? 'ຄົນ' : 'guests'} &bull; {pkg.durationMinutes}m {isLao ? 'ບຸບເຟ່' : 'buffet'}
                          </p>
                        </div>
                      </div>

                      {/* Remaining Time & Progress */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 font-mono text-xs font-bold">
                          <Clock className={`w-3.5 h-3.5 ${
                            isTimeExpired 
                              ? 'text-red-500 animate-spin' 
                              : isNearLimit 
                              ? 'text-purple-600 dark:text-purple-400 animate-spin' 
                              : 'text-slate-400'
                          }`} />
                          <span className={
                            isTimeExpired 
                              ? 'text-red-600 font-black' 
                              : isNearLimit 
                              ? 'text-purple-600 dark:text-purple-400' 
                              : 'text-slate-700 dark:text-slate-300'
                          }>
                            {isTimeExpired ? (isLao ? '0 ນາທີ (ເບິດເວລາແລ້ວ!)' : '0m (Expired!)') : `${remaining} ${isLao ? 'ນາທີ' : 'mins'}`}
                          </span>
                        </div>
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isTimeExpired ? 'bg-red-600 animate-pulse' : isNearLimit ? 'bg-purple-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                    </div>

                    {/* Operational Quick Actions Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onAddExtraChairs(table.code)}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 font-medium text-[11px] transition"
                        >
                          + ຕັ່ງເພີ່ມ
                        </button>
                        <button
                          onClick={() => onAddMidMealGuest(table.code, 'FULL', 1)}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 font-medium text-[11px] transition"
                        >
                          + ແຂກກາງຄັນ
                        </button>
                      </div>

                      <button
                        onClick={() => onSelectTableForBilling(table.code)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition ${
                          isTimeExpired
                            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-2 ring-red-400 shadow-md shadow-red-600/30'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                        }`}
                      >
                        {isTimeExpired ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-yellow-300 animate-bounce" />
                            <span>{isLao ? '🚨 ຊຳລະເງິນ' : '🚨 Pay'}</span>
                          </>
                        ) : (
                          <>
                            <Receipt className="w-3 h-3" />
                            <span>{isLao ? 'ເຊັກບິນ' : 'Checkout'}</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Kitchen Delayed Care Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-orange-500" />
                <span>{isLao ? 'ຄິວຄົວ & ແຈ້ງເຕືອນຊັກຊ້າ (KDS SLA)' : 'Kitchen Queue & Delay Alerts'}</span>
              </h2>
              <button
                onClick={onNavigateToKds}
                className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline"
              >
                {isLao ? 'ເບິ່ງຈໍຄົວ →' : 'View KDS →'}
              </button>
            </div>

            {/* Delayed food items alert box */}
            {delayedOrders.length > 0 ? (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="font-bold">
                      {isLao ? 'ພົບອໍເດີຊັກຊ້າກວ່າ 15 ນາທີ!' : 'Delayed Orders Alert (> 15 mins)'}
                    </span>
                    <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
                      {isLao 
                        ? 'ກະລຸນາສົ່ງພະນັກງານໄປແຈ້ງແຂກ ແລະ ເບິ່ງແຍງທີ່ໂຕະດ່ວນ.' 
                        : 'Please dispatch floor staff to attend to guests immediately.'}
                    </p>
                  </div>
                </div>

                {delayedOrders.map(order => (
                  <div 
                    key={order.id}
                    className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                          ໂຕະ {order.tableCode}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {order.orderNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {order.items.map(i => `${i.nameLao} x${i.quantity}`).join(', ')}
                      </p>
                    </div>

                    <button
                      onClick={() => onSendCareAlert(order.tableCode)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shrink-0 transition flex items-center gap-1 shadow-sm"
                    >
                      <Bell className="w-3 h-3" />
                      <span>{isLao ? 'ສົ່ງດູແລ' : 'Care Alert'}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isLao ? 'ທຸກອໍເດີເສີບທັນຕາມກຳນົດ' : 'All Orders On Schedule'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isLao ? 'ບໍ່ມີອໍເດີຊັກຊ້າເກີນ 15 ນາທີໃນຕອນນີ້' : 'No tickets exceeding 15 minutes prep SLA.'}
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats at bottom of right card */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                {isLao ? 'ເວລາປຸງແຕ່ງສະເລ່ຍ' : 'Average Cook Time'}
              </span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                8.4 {isLao ? 'ນາທີ' : 'mins'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
                {isLao ? 'ອັດຕາສຳເລັດຕາມ SLA' : 'SLA Compliance'}
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                96.2%
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
