import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, 
  User, 
  Phone, 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle,
  AlertTriangle,
  X,
  Plus,
  Minus,
  Sparkles,
  Check,
  Search,
  Filter,
  UtensilsCrossed,
  Crown,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Reservation, Language, BuffetPackageTier, RestaurantTable } from '../../types';
import { BUFFET_PACKAGES } from '../../data/mockData';

interface ReservationsManagerProps {
  reservations: Reservation[];
  tables: RestaurantTable[];
  language: Language;
  onAddReservation: (res: Omit<Reservation, 'id'>) => void;
  onSeatReservation: (reservationId: string, tableCode: string) => void;
}

// Date helper utilities
const formatDateIso = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayIso = (): string => formatDateIso(new Date());

const getTomorrowIso = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateIso(d);
};

const getDaysFromNowIso = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatDateIso(d);
};

const getNextWeekendIso = (): string => {
  const d = new Date();
  const day = d.getDay();
  const diff = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return formatDateIso(d);
};

// Popular dining slots
const POPULAR_TIME_SLOTS = [
  { time: '11:30', period: 'lunch', label: '11:30 (ທ່ຽງ)' },
  { time: '12:00', period: 'lunch', label: '12:00 (ທ່ຽງ)' },
  { time: '12:30', period: 'lunch', label: '12:30 (ທ່ຽງ)' },
  { time: '13:00', period: 'lunch', label: '13:00 (ທ່ຽງ)' },
  { time: '17:00', period: 'dinner', label: '17:00 (ແລງ)' },
  { time: '17:30', period: 'dinner', label: '17:30 (ແລງ)' },
  { time: '18:00', period: 'dinner', label: '18:00 (ແລງ)' },
  { time: '18:30', period: 'dinner', label: '18:30 (ແລງ)' },
  { time: '19:00', period: 'dinner', label: '19:00 (ແລງ)' },
  { time: '19:30', period: 'dinner', label: '19:30 (ແລງ)' },
  { time: '20:00', period: 'dinner', label: '20:00 (ແລງ)' },
  { time: '20:30', period: 'dinner', label: '20:30 (ແລງ)' },
  { time: '21:00', period: 'dinner', label: '21:00 (ແລງ)' }
];

export const ReservationsManager: React.FC<ReservationsManagerProps> = ({
  reservations,
  tables,
  language,
  onAddReservation,
  onSeatReservation,
}) => {
  const isLao = language === 'la';
  const todayIso = getTodayIso();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'CONFIRMED' | 'SEATED'>('ALL');

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('+856 20 ');
  const [tableCode, setTableCode] = useState<string>(tables[0]?.code || 'A-05');
  const [pax, setPax] = useState<number>(4);
  const [packageTier, setPackageTier] = useState<BuffetPackageTier>('PREMIUM');
  const [date, setDate] = useState<string>(todayIso);
  const [timeSlot, setTimeSlot] = useState<string>('18:30');
  const [depositAmountLAK, setDepositAmountLAK] = useState<number>(200000);
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [inAppToast, setInAppToast] = useState<{ show: boolean; message: string } | null>(null);

  // Time parsing helper
  const parseTimeSlot = (timeStr: string) => {
    const parts = (timeStr || '18:30').split(':');
    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    if (isNaN(h)) h = 18;
    if (isNaN(m)) m = 30;
    return { h, m };
  };

  const formatTimeSlot = (h: number, m: number) => {
    const hh = String(Math.max(0, Math.min(23, h))).padStart(2, '0');
    const mm = String(Math.max(0, Math.min(59, m))).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  // Clock adjusters
  const handleAdjustHour = (delta: number) => {
    const { h, m } = parseTimeSlot(timeSlot);
    let newH = h + delta;
    if (newH > 23) newH = 10;
    if (newH < 10) newH = 22;
    setTimeSlot(formatTimeSlot(newH, m));
  };

  const handleAdjustMinute = (delta: number) => {
    const { h, m } = parseTimeSlot(timeSlot);
    let newM = m + delta;
    let newH = h;
    if (newM >= 60) {
      newM = 0;
      newH = (newH + 1) % 24;
    } else if (newM < 0) {
      newM = 45;
      newH = newH > 0 ? newH - 1 : 23;
    }
    setTimeSlot(formatTimeSlot(newH, newM));
  };

  // Past Date & Time Validation
  const validation = useMemo(() => {
    if (!date) {
      return { isPast: true, message: isLao ? 'ກະລຸນາເລືອກວັນທີ' : 'Please select a date' };
    }
    
    // Check Date
    if (date < todayIso) {
      return {
        isPast: true,
        reason: 'date_past',
        message: isLao 
          ? '⚠️ ວັນທີທີ່ເລືອກຜ່ານມາແລ້ວ! ຕ້ອງຈອງແຕ່ມື້ນີ້ ຫຼື ມື້ໜ້າເທົ່ານັ້ນ (ບໍ່ສາມາດຈອງມື້ວານນີ້ ຫຼື ອະດີດໄດ້)' 
          : '⚠️ Selected date has passed! Bookings must be for today or future dates.'
      };
    }

    // Check Time if Date is Today
    if (date === todayIso) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const { h, m } = parseTimeSlot(timeSlot);
      const selectedMinutes = h * 60 + m;

      // Grace buffer of 5 minutes
      if (selectedMinutes < currentMinutes - 5) {
        const nowFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return {
          isPast: true,
          reason: 'time_past',
          message: isLao 
            ? `⚠️ ເວລາ ${timeSlot} ຜ່ານມາແລ້ວສຳລັບມື້ນີ້! (ເວລາປັດຈຸບັນແມ່ນ ${nowFormatted}). ກະລຸນາເລືອກເວລາໃນອະນາຄົດ` 
            : `⚠️ Time ${timeSlot} has already passed for today! Current time is ${nowFormatted}. Please choose an upcoming time.`
        };
      }
    }

    return { isPast: false, message: '' };
  }, [date, timeSlot, todayIso, isLao]);

  // One-click Auto Fix to Now + 30 mins
  const handleFixToValidNow = () => {
    const now = new Date();
    setDate(todayIso);
    let targetHour = now.getHours();
    let targetMin = Math.ceil(now.getMinutes() / 15) * 15 + 15;
    if (targetMin >= 60) {
      targetHour += 1;
      targetMin = 0;
    }
    if (targetHour >= 22) {
      // If late night, suggest tomorrow at 12:00
      setDate(getTomorrowIso());
      setTimeSlot('12:00');
    } else {
      setTimeSlot(formatTimeSlot(Math.max(11, targetHour), targetMin));
    }
  };

  // Open modal with fresh state
  const handleOpenCreateModal = () => {
    const now = new Date();
    setDate(todayIso);
    let targetHour = now.getHours() + 1;
    let targetMin = 0;
    if (targetHour < 11) targetHour = 11;
    if (targetHour >= 22) {
      setDate(getTomorrowIso());
      targetHour = 12;
    }
    setTimeSlot(formatTimeSlot(targetHour, targetMin));
    setCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.isPast) return;

    onAddReservation({
      tableCode,
      customerName: customerName.trim() || (isLao ? 'ລູກຄ້າຈອງໂຕະ' : 'Walk-in Reservation'),
      customerPhone,
      guestCount: pax,
      packageTier,
      date,
      timeSlot,
      status: 'CONFIRMED',
      depositAmountLAK,
      specialNotes
    });

    setCreateModalOpen(false);
    
    // In-app feedback toast
    setInAppToast({
      show: true,
      message: isLao 
        ? `✓ ບັນທຶກການຈອງໂຕະ ${tableCode} (${customerName}) ວັນທີ ${date} ເວລາ ${timeSlot} ສຳເລັດແລ້ວ!` 
        : `✓ Reservation for table ${tableCode} on ${date} at ${timeSlot} saved successfully!`
    });
    setTimeout(() => setInAppToast(null), 4000);

    // Reset customer fields
    setCustomerName('');
    setSpecialNotes('');
  };

  // Filter reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      // Text search
      const matchesSearch = 
        res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.customerPhone.includes(searchQuery) ||
        res.tableCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filterTab === 'TODAY') return res.date === todayIso;
      if (filterTab === 'UPCOMING') return res.date > todayIso;
      if (filterTab === 'CONFIRMED') return res.status === 'CONFIRMED';
      if (filterTab === 'SEATED') return res.status === 'SEATED';
      return true;
    });
  }, [reservations, searchQuery, filterTab, todayIso]);

  // Current parsed hour and minute for digital display
  const { h: currentHour, m: currentMin } = parseTimeSlot(timeSlot);

  // Suggested deposit amount based on selected tier & pax
  const pkgPrice = BUFFET_PACKAGES[packageTier]?.priceLAK || 219000;
  const estimatedTotal = pkgPrice * pax;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {inAppToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-bold text-xs">{inAppToast.message}</span>
        </div>
      )}

      {/* Header & Quick Summary Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">
                {isLao ? 'ລະບົບຈອງໂຕະບຸບເຟ່ລ່ວງໜ້າ (Table Reservations)' : 'Buffet Table Reservation Management'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                PRO BOOKINGS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isLao 
                ? 'ຈອງແຕ່ມື້ນີ້ຫາລ່ວງໜ້າ • ປັບໂມງເວລາສະດວກ • ຈັດການເງິນມັດຈຳ & ເປີດໂຕະຕ້ອນຮັບທັນທີ' 
                : 'Advance booking only • Interactive clock picker • Deposit & check-in'}
            </p>
          </div>
        </div>

        {/* Action Button: New Booking */}
        <button
          id="btn-open-new-reservation-modal"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-2xl text-xs font-black shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isLao ? '➕ ເພີ່ມການຈອງໃໝ່ (New Booking)' : '➕ New Reservation'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isLao ? 'ຄົ້ນຫາຊື່ລູກຄ້າ, ເບີໂທ, ຫຼື ໂຕະ...' : 'Search by guest name, phone, or table...'}
            className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'TODAY', 'UPCOMING', 'CONFIRMED', 'SEATED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                filterTab === tab
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {tab === 'ALL' && (isLao ? 'ທຸກລາຍການ' : 'All')}
              {tab === 'TODAY' && (isLao ? '📌 ຈອງມື້ນີ້' : 'Today')}
              {tab === 'UPCOMING' && (isLao ? '📅 ລ່ວງໜ້າ' : 'Upcoming')}
              {tab === 'CONFIRMED' && (isLao ? '✓ ຢືນຢັນແລ້ວ' : 'Confirmed')}
              {tab === 'SEATED' && (isLao ? '🍽️ ມາຮອດແລ້ວ' : 'Seated')}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Grid List */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <CalendarClock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {isLao ? 'ບໍ່ພົບລາຍການຈອງໂຕະໃນເງື່ອນໄຂນີ້' : 'No reservations found'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {isLao ? 'ທ່ານສາມາດກົດປຸ່ມດ້ານເທິງເພື່ອເພີ່ມການຈອງໃໝ່ໄດ້ທັນທີ' : 'Click the button above to add a new reservation'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 transition"
          >
            {isLao ? '➕ ເພີ່ມການຈອງໂຕະໃໝ່' : 'New Reservation'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map((res) => {
            const pkg = BUFFET_PACKAGES[res.packageTier] || BUFFET_PACKAGES.STANDARD;
            const isConfirmed = res.status === 'CONFIRMED';
            const isToday = res.date === todayIso;
            const isFuture = res.date > todayIso;

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition space-y-3.5 relative overflow-hidden"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-base flex items-center justify-center border border-amber-500/30 shadow-inner">
                      {res.tableCode}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {res.customerName}
                      </h4>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{res.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      res.status === 'SEATED'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {res.status === 'SEATED' ? (isLao ? 'ມາຮອດແລ້ວ' : 'SEATED') : (isLao ? 'ຢືນຢັນແລ້ວ' : 'CONFIRMED')}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold border border-amber-500/30">
                        {isLao ? '📌 ມື້ນີ້' : 'Today'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Box */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{res.date}</span>
                      <span className="text-slate-400">•</span>
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold">{res.timeSlot}</span>
                    </span>
                    <span className="font-extrabold flex items-center gap-1 text-slate-900 dark:text-white">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {res.guestCount} {isLao ? 'ທ່ານ' : 'pax'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${pkg.badgeBg} ${pkg.badgeBorder} ${pkg.badgeText}`}>
                      {res.packageTier}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">
                      <span className="text-[11px] text-slate-400 mr-1">{isLao ? 'ມັດຈຳ:' : 'Deposit:'}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                        {res.depositAmountLAK.toLocaleString()} ₭
                      </span>
                    </span>
                  </div>

                  {res.specialNotes && (
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                      📝 {res.specialNotes}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div>
                  {isConfirmed ? (
                    <button
                      onClick={() => onSeatReservation(res.id, res.tableCode)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-98 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isLao ? 'ແຂກມາຮອດແລ້ວ (ເປີດໂຕະຕ້ອນຮັບ)' : 'Seat Guests & Open Table'}</span>
                    </button>
                  ) : (
                    <div className="py-2 text-center text-xs text-slate-400 font-medium">
                      ✓ {isLao ? 'ແຂກນັ່ງໂຕະ ແລະ ເລີ່ມກິນແລ້ວ' : 'Guests are currently dining'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* ULTRA-MODERN CREATE RESERVATION MODAL ("ເພີ່ມການຈອງໂຕະໃໝ່") */}
      {/* ============================================================ */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {isLao ? 'ເພີ່ມການຈອງໂຕະໃໝ່' : 'New Table Reservation'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isLao ? 'ຈອງແຕ່ມື້ນີ້ຫາລ່ວງໜ້າ • ປັບໂມງເວລາສະດວກ' : 'Advance bookings only • Interactive time picker'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              
              {/* SECTION 1: Customer Details */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isLao ? '1. ຂໍ້ມູນລູກຄ້າ (Customer Details)' : '1. Customer Information'}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isLao ? 'ຊື່ລູກຄ້າ (Customer Name):' : 'Customer Name:'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      placeholder={isLao ? 'ທ່ານ ສົມພອນ ແກ້ວສຸວັນ' : 'Mr. Somphone Keosouvann'}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      {isLao ? 'ເບີໂທລະສັບ:' : 'Phone Number:'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        placeholder="+856 20 5512 8844"
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        {isLao ? 'ໂຕະທີ່ຈອງ (ເລືອກໄດ້ທຸກໂຕະ):' : 'Reserved Table (All Tables):'}
                      </label>
                      <span className="text-[10px] text-amber-500 font-bold">
                        {tables.length} {isLao ? 'ໂຕະທັງໝົດ' : 'Total'}
                      </span>
                    </div>
                    <select
                      value={tableCode}
                      onChange={(e) => setTableCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                    >
                      {Array.from(new Set(tables.map(t => t.zone))).map(zone => (
                        <optgroup key={zone} label={`📍 ${zone}`}>
                          {tables.filter(t => t.zone === zone).map(t => (
                            <option key={t.id} value={t.code}>
                              ໂຕະ {t.code} ({t.defaultCapacity} {isLao ? 'ບ່ອນນັ່ງ' : 'seats'}) {t.status === 'RESERVED' ? '• [ຈອງແລ້ວ]' : ''}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>

                    {/* Quick Table Selection Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto mt-1.5 pb-1 scrollbar-thin">
                      {tables.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTableCode(t.code)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                            tableCode === t.code
                              ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-400 font-black'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {t.code}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Date & Interactive Clock ("ໂມງສາມາດກົດໄດ້ປັບໄດ້") */}
              <div className="space-y-3.5 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isLao ? '2. ວັນທີ & ເວລາຈອງ (Date & Interactive Clock)' : '2. Date & Time Selection'}</span>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    {isLao ? 'ຈອງແຕ່ມື້ນີ້ຫາລ່ວງໜ້າ' : 'Today & Future Only'}
                  </span>
                </div>

                {/* Date Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {isLao ? 'ວັນທີຈອງ (ເລີ່ມແຕ່ມື້ນີ້ເປັນຕົ້ນໄປ):' : 'Reservation Date (Min: Today):'}
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {isLao ? `ມື້ນີ້: ${todayIso}` : `Today: ${todayIso}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        min={todayIso}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick Date Shortcut Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setDate(todayIso)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        date === todayIso 
                          ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400/50 shadow-sm' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                      }`}
                    >
                      {isLao ? '📌 ມື້ນີ້' : 'Today'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(getTomorrowIso())}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        date === getTomorrowIso() 
                          ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400/50 shadow-sm' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                      }`}
                    >
                      {isLao ? '🌅 ມື້ອື່ນ' : 'Tomorrow'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(getDaysFromNowIso(2))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        date === getDaysFromNowIso(2) 
                          ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400/50 shadow-sm' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                      }`}
                    >
                      {isLao ? '📅 +2 ມື້' : '+2 Days'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(getNextWeekendIso())}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        date === getNextWeekendIso() 
                          ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400/50 shadow-sm' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                      }`}
                    >
                      {isLao ? '🎉 ທ້າຍອາທິດ' : 'Weekend'}
                    </button>
                  </div>
                </div>

                {/* INTERACTIVE CLOCK WIDGET ("ໂມງສາມາດກົດໄດ້ປັບໄດ້") */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    {isLao ? 'ໂມງເວລາຈອງ (ກົດປັບຊົ່ວໂມງ & ນາທີໄດ້):' : 'Interactive Clock & Time Adjuster:'}
                  </label>

                  {/* Digital Clock Display & Stepper Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    
                    {/* Hour Stepper */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">{isLao ? 'ຊົ່ວໂມງ:' : 'Hour:'}</span>
                      <button
                        type="button"
                        onClick={() => handleAdjustHour(-1)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm transition active:scale-95 cursor-pointer"
                        title={isLao ? 'ຫຼຸດຊົ່ວໂມງ' : 'Decrease hour'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-12 h-10 rounded-xl bg-slate-900 text-amber-400 font-mono font-black text-lg flex items-center justify-center shadow-inner">
                        {String(currentHour).padStart(2, '0')}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdjustHour(1)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm transition active:scale-95 cursor-pointer"
                        title={isLao ? 'ເພີ່ມຊົ່ວໂມງ' : 'Increase hour'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-mono text-xl font-bold text-slate-400">:</span>

                    {/* Minute Stepper */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">{isLao ? 'ນາທີ:' : 'Minute:'}</span>
                      <button
                        type="button"
                        onClick={() => handleAdjustMinute(-15)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm transition active:scale-95 cursor-pointer"
                        title={isLao ? 'ຫຼຸດ 15 ນາທີ' : 'Decrease 15 mins'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-12 h-10 rounded-xl bg-slate-900 text-amber-400 font-mono font-black text-lg flex items-center justify-center shadow-inner">
                        {String(currentMin).padStart(2, '0')}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdjustMinute(15)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm transition active:scale-95 cursor-pointer"
                        title={isLao ? 'ເພີ່ມ 15 ນາທີ' : 'Increase 15 mins'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Shift buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjustMinute(15)}
                        className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/20 cursor-pointer"
                      >
                        +15m
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustMinute(30)}
                        className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/20 cursor-pointer"
                      >
                        +30m
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustHour(1)}
                        className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] border border-amber-500/20 cursor-pointer"
                      >
                        +1h
                      </button>
                    </div>

                  </div>

                  {/* Popular Quick Time Slots Pills */}
                  <div className="mt-2.5">
                    <span className="block text-[10px] font-bold text-slate-400 mb-1">
                      {isLao ? 'ຮອບເວລາຍອດນິຍົມ (ກົດເລືອກໄດ້ທັນທີ):' : 'Popular Dining Time Slots (Click to set):'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_TIME_SLOTS.map(slot => {
                        const isSelected = timeSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setTimeSlot(slot.time)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
                            }`}
                          >
                            <span>{slot.time}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Validation Banner: Warning when date or time is in the past! */}
                {validation.isPast && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-2 animate-pulse">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                      <span className="font-extrabold">{validation.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFixToValidNow}
                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-[10px] hover:bg-red-500 transition shrink-0 cursor-pointer"
                    >
                      {isLao ? '🕒 ປັບເປັນດຽວນີ້' : 'Fix to Now'}
                    </button>
                  </div>
                )}

              </div>

              {/* SECTION 3: Party Size & Buffet Package */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isLao ? '3. ຈຳນວນແຂກ & ແພັກເກັດບຸບເຟ່ (Guests & Package)' : '3. Party Size & Package'}</span>
                </div>

                {/* Party Size Stepper */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isLao ? 'ຈຳນວນແຂກ (Party Size):' : 'Party Size (Pax):'}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPax(Math.max(1, pax - 1))}
                      className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold text-base transition cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-16 h-9 rounded-xl bg-slate-900 text-amber-400 font-mono font-black text-base flex items-center justify-center shadow-inner">
                      {pax} {isLao ? 'ທ່ານ' : 'pax'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPax(pax + 1)}
                      className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white flex items-center justify-center font-bold text-base transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Quick Pax Pills */}
                    <div className="flex items-center gap-1 ml-2 overflow-x-auto">
                      {[2, 4, 6, 8, 10, 15].map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setPax(count)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            pax === count 
                              ? 'bg-amber-500 text-slate-950 font-black' 
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Package Cards */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    {isLao ? 'ແພັກເກັດບຸບເຟ່ທີ່ເລືອກ:' : 'Buffet Package Tier:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(['STANDARD', 'PREMIUM', 'VIP'] as const).map(tier => {
                      const p = BUFFET_PACKAGES[tier];
                      const isSelected = packageTier === tier;
                      return (
                        <div
                          key={tier}
                          onClick={() => setPackageTier(tier)}
                          className={`group p-2.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between overflow-hidden ${
                            isSelected 
                              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-400/40 shadow-md' 
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1">
                                {tier === 'VIP' && <Crown className="w-3 h-3 text-amber-500" />}
                                <span>{tier}</span>
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 stroke-[3]" />}
                            </div>
                            <div className="mt-1 font-mono font-black text-xs text-amber-600 dark:text-amber-400">
                              {p.priceLAK.toLocaleString()} ₭
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {p.durationMinutes} {isLao ? 'ນາທີ' : 'mins'}
                            </div>
                          </div>

                          {/* Food photo */}
                          <div className="relative mt-2 rounded-xl overflow-hidden aspect-[4/3] bg-slate-900/10 border border-slate-200/80 dark:border-slate-700/80">
                            <img
                              src={p.imageUrl}
                              alt={p.nameLao}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1">
                              <span className="text-[9px] font-bold text-white line-clamp-1 drop-shadow">
                                {p.highlightDish || (tier === 'STANDARD' ? 'ໝູ & ໄກ່' : tier === 'PREMIUM' ? 'ງົວ & ຊີຟູດ' : 'ວາກິວ & ແຊວມອນ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 4: Deposit & Special Notes */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isLao ? '4. ເງິນມັດຈຳ & ໝາຍເຫດ (Deposit & Notes)' : '4. Deposit & Notes'}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {isLao ? 'ເງິນມັດຈຳ (LAK):' : 'Deposit Amount (LAK):'}
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isLao ? `ຄາດຄະເນຍອດລວມ: ~${estimatedTotal.toLocaleString()} ₭` : `Est: ~${estimatedTotal.toLocaleString()} ₭`}
                    </span>
                  </div>
                  
                  <input
                    type="number"
                    value={depositAmountLAK}
                    onChange={(e) => setDepositAmountLAK(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />

                  {/* Quick deposit preset buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {[100000, 200000, 300000, 500000].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDepositAmountLAK(amount)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          depositAmountLAK === amount 
                            ? 'bg-amber-500 text-slate-950 font-black' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {amount.toLocaleString()} ₭
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    {isLao ? 'ໝາຍເຫດພິເສດ:' : 'Special Notes:'}
                  </label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder={isLao ? 'ເຊັ່ນ: ຂໍຕັ່ງເດັກນ້ອຍ, ງານວັນເກີດ, ລູກຄ້າ VIP' : 'e.g. Baby chair, birthday celebration'}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />

                  {/* Quick Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {[
                      isLao ? '🍼 ຂໍຕັ່ງເດັກນ້ອຍ' : '🍼 Baby Chair',
                      isLao ? '🎂 ງານວັນເກີດ' : '🎂 Birthday',
                      isLao ? '⭐ ລູກຄ້າ VIP' : '⭐ VIP Guest',
                      isLao ? '🏢 ງານລ້ຽງບໍລິສັດ' : '🏢 Company Dinner',
                      isLao ? '🍲 ຂໍໝໍ້ຊຸບໝ່າລ່າ' : '🍲 Mala Soup'
                    ].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSpecialNotes(prev => prev ? `${prev}, ${chip}` : chip)}
                        className="px-2 py-0.5 rounded-lg text-[10px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isLao ? 'ຍົກເລີກ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={validation.isPast}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition transform active:scale-95 cursor-pointer ${
                    validation.isPast
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/25'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLao ? 'ຢືນຢັນບັນທຶກການຈອງ' : 'Save Reservation'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
