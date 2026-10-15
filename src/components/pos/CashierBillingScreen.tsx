import React, { useState } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Banknote, 
  Tag, 
  ShieldAlert, 
  CheckCircle2, 
  Printer, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Percent, 
  AlertCircle,
  Building,
  RefreshCw,
  X,
  LayoutDashboard,
  PartyPopper,
  Zap,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  RestaurantTable, 
  TableSession, 
  Promotion, 
  Language, 
  BillReceipt, 
  Branch 
} from '../../types';
import { BUFFET_PACKAGES, MOCK_PROMOTIONS } from '../../data/mockData';

interface CashierBillingScreenProps {
  tables: RestaurantTable[];
  sessions: Record<string, TableSession>;
  currentBranch: Branch;
  language: Language;
  selectedTableCode?: string;
  onTableSelect: (tableCode: string) => void;
  onCheckoutSuccess: (tableCode: string, bill: BillReceipt) => void;
  onNavigateToDashboard?: () => void;
}

export const CashierBillingScreen: React.FC<CashierBillingScreenProps> = ({
  tables,
  sessions,
  currentBranch,
  language,
  selectedTableCode,
  onTableSelect,
  onCheckoutSuccess,
  onNavigateToDashboard,
}) => {
  const isLao = language === 'la';

  // Active table selected
  const activeTableCode = selectedTableCode || tables.find(t => t.status !== 'VACANT')?.code || 'A-01';
  const table = tables.find(t => t.code === activeTableCode);
  const session = table?.currentSessionId ? sessions[table.currentSessionId] : undefined;

  // Form states
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'LAO_QR_BCEL' | 'LDB_TRUST' | 'CASH' | 'CREDIT_CARD'>('LAO_QR_BCEL');
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Guardrail Modal
  const [guardrailBlockedModalOpen, setGuardrailBlockedModalOpen] = useState<boolean>(false);
  const [guardrailReason, setGuardrailReason] = useState<string>('');

  // Payment Processing & Receipt Modal
  const [isProcessingQr, setIsProcessingQr] = useState<boolean>(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<BillReceipt | null>(null);

  // Calculate pricing breakdown
  const packageTier = session?.packageTier || 'PREMIUM';
  const pkg = BUFFET_PACKAGES[packageTier];
  const unitPrice = pkg?.priceLAK || 0;

  const fullGuests = session?.guests.filter(g => g.type === 'FULL').length || 0;
  const halfGuests = session?.guests.filter(g => g.type === 'HALF').length || 0;
  const freeGuests = session?.guests.filter(g => g.type === 'FREE').length || 0;

  const fullPriceSubtotal = fullGuests * unitPrice;
  const halfPriceSubtotal = halfGuests * (unitPrice * 0.5);
  const freePriceSubtotal = 0;

  const baseSubtotal = fullPriceSubtotal + halfPriceSubtotal + freePriceSubtotal;

  // Apply Discount
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'PERCENTAGE') {
      discountAmount = (baseSubtotal * appliedPromo.discountValue) / 100;
    } else {
      discountAmount = appliedPromo.discountValue;
    }
  }

  const subtotalAfterDiscount = Math.max(0, baseSubtotal - discountAmount);
  const serviceCharge = Math.round(subtotalAfterDiscount * currentBranch.serviceChargeRate);
  const vatTax = Math.round((subtotalAfterDiscount + serviceCharge) * currentBranch.vatRate);
  const netTotalLAK = subtotalAfterDiscount + serviceCharge + vatTax;

  // Handle Apply Promo Code
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    const found = MOCK_PROMOTIONS.find(p => p.code.toUpperCase() === promoCodeInput.trim().toUpperCase());
    if (!found) {
      setPromoError(isLao ? 'ບໍ່ພົບລະຫັດໂປຣໂມຊັ່ນນີ້' : 'Invalid promo code');
      return;
    }

    // Date check (e.g. 2026-08-19)
    const today = '2026-08-19';
    if (today < found.validFrom || today > found.validTo) {
      setPromoError(isLao ? `ລະຫັດນີ້ໝົດອາຍຸແລ້ວ (ໝົດອາຍຸ ${found.validTo})` : `Promo expired on ${found.validTo}`);
      return;
    }

    if (baseSubtotal < found.minSpendLAK) {
      setPromoError(isLao ? `ຍອດຂັ້ນຕ່ຳຕ້ອງເຖິງ ${found.minSpendLAK.toLocaleString()} ກີບ` : `Requires minimum spend of ${found.minSpendLAK.toLocaleString()} LAK`);
      return;
    }

    setAppliedPromo(found);
    setPromoSuccess(isLao ? `ນຳໃຊ້ລະຫັດ ${found.code} ສຳເລັດ! (${found.titleLao})` : `Applied promo ${found.code}!`);
  };

  // STRICT CHECKOUT GUARDRAIL VALIDATION
  const handleInitiatePayment = () => {
    // 1. Guardrail: Table must exist and be occupied
    if (!table || table.status === 'VACANT' || !session) {
      setGuardrailReason(isLao ? 'ໂຕະນີ້ຍັງບໍ່ທັນໄດ້ເປີດ Session ຫຼື ເປັນໂຕະຫວ່າງ' : 'This table is vacant with no active session initialized.');
      setGuardrailBlockedModalOpen(true);
      return;
    }

    // 2. Guardrail: Must have at least 1 guest
    if (session.guests.length === 0) {
      setGuardrailReason(isLao ? 'ບໍ່ສາມາດຄິດໄລ່ເງິນໄດ້: ຍັງບໍ່ມີຂໍ້ມູນແຂກ (0 Guests) ໃນລະບົບ' : 'BLOCKED: 0 guests recorded in the session.');
      setGuardrailBlockedModalOpen(true);
      return;
    }

    // 3. Guardrail: Subtotal check
    if (baseSubtotal === 0 && freeGuests === 0) {
      setGuardrailReason(isLao ? 'ບໍ່ສາມາດຄິດໄລ່ເງິນໄດ້: ຍອດບິນເປັນ 0 ກີບ ແລະ ບໍ່ແມ່ນກໍລະນີ VIP Free' : 'BLOCKED: Subtotal is 0 LAK without authorized VIP Free tag.');
      setGuardrailBlockedModalOpen(true);
      return;
    }

    // Instant real-time payment execution - ZERO delay, fireworks explode immediately!
    finalizeBill();
  };

  // Track celebration timers to cleanly cancel and reset on page/table change
  const celebrationTimersRef = React.useRef<number[]>([]);

  const stopCelebration = () => {
    celebrationTimersRef.current.forEach(id => clearTimeout(id));
    celebrationTimersRef.current = [];
    try {
      confetti.reset();
    } catch {
      // ignore
    }
  };

  // Immediate cleanup when active table changes or screen unmounts
  React.useEffect(() => {
    stopCelebration();
    return () => {
      stopCelebration();
    };
  }, [activeTableCode]);

  const handleCloseReceipt = () => {
    stopCelebration();
    setGeneratedReceipt(null);
  };

  // Modern Multi-Stage Celebratory Fireworks with audio chime & zero lag
  const launchModernCelebrationFireworks = () => {
    stopCelebration();

    // Stage 1: Instant Center Super-Burst (0ms delay) - crisp, fast decay
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#F43F5E', '#14B8A6', '#FBBF24'],
      startVelocity: 42,
      ticks: 120, // Crisp auto-clear
      gravity: 1.2,
      decay: 0.92,
      scalar: 1.1,
      zIndex: 99999
    });

    // Stage 2: Left Fireworks Cannon (50ms)
    const t1 = window.setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.7 },
        colors: ['#10B981', '#34D399', '#FBBF24', '#60A5FA', '#F472B6'],
        startVelocity: 48,
        ticks: 120,
        gravity: 1.2,
        decay: 0.92,
        scalar: 1.0,
        zIndex: 99999
      });
    }, 50);

    // Stage 3: Right Fireworks Cannon (100ms)
    const t2 = window.setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.7 },
        colors: ['#10B981', '#F59E0B', '#A78BFA', '#38BDF8', '#FB7185'],
        startVelocity: 48,
        ticks: 120,
        gravity: 1.2,
        decay: 0.92,
        scalar: 1.0,
        zIndex: 99999
      });
    }, 100);

    // Stage 4: Automatic total cleanup (1800ms) - completely resets canvas so nothing lingers
    const t3 = window.setTimeout(() => {
      stopCelebration();
    }, 1800);

    celebrationTimersRef.current = [t1, t2, t3];

    // Modern pleasant celebratory cash register & victory chime (Web Audio API)
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;
        const playTone = (freq: number, start: number, duration: number, gainVal: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(gainVal, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        // Harmonic celebratory chime: C5 -> E5 -> G5 -> High C6 sparkle
        playTone(523.25, now, 0.18, 0.12);
        playTone(659.25, now + 0.07, 0.2, 0.14);
        playTone(783.99, now + 0.14, 0.25, 0.16);
        playTone(1046.50, now + 0.21, 0.45, 0.18);
      }
    } catch {
      // Audio autoplay handled gracefully
    }
  };

  const finalizeBill = () => {
    const billNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBill: BillReceipt = {
      id: `BILL-${Date.now()}`,
      billNumber,
      branchId: currentBranch.id,
      branchNameLao: currentBranch.nameLao,
      tableCodes: [activeTableCode],
      sessionId: session?.id || 'SESS-000',
      cashierName: 'ນາງ ນ້ອຍ ແກ້ວມະນີ (Noy K.)',
      createdAt: new Date().toISOString(),
      packageTier: packageTier,
      guestsBreakdown: {
        fullPriceCount: fullGuests,
        fullPriceUnit: unitPrice,
        halfPriceCount: halfGuests,
        halfPriceUnit: unitPrice * 0.5,
        freeCount: freeGuests,
        freeUnit: 0
      },
      extraCharges: [],
      subtotalLAK: baseSubtotal,
      discountLAK: discountAmount,
      promoCode: appliedPromo?.code,
      vatTaxLAK: vatTax,
      serviceChargeLAK: serviceCharge,
      netTotalLAK: netTotalLAK,
      paymentMethod: paymentMethod,
      paymentStatus: 'PAID',
      laoQrString: `00020101021229370016A0000007270001010113${billNumber}053034185802LA5910LAO_BUFFET6010VIENTIANE`,
      bcelRef: `BCEL-TXN-${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    setGeneratedReceipt(newBill);
    onCheckoutSuccess(activeTableCode, newBill);

    // Launch modern multi-stage fireworks immediately with ZERO delay!
    launchModernCelebrationFireworks();
  };

  return (
    <div className="space-y-6">
      
      {/* Table Selector Pills */}
      <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
          {isLao ? 'ເລືອກໂຕະເພື່ອຄິດໄລ່ເງິນ:' : 'Select Table:'}
        </span>
        {tables.map(t => {
          const isSelected = t.code === activeTableCode;
          const isOccupied = t.status !== 'VACANT';
          return (
            <button
              key={t.id}
              onClick={() => {
                stopCelebration();
                onTableSelect(t.code);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : isOccupied
                  ? 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-slate-200 hover:bg-blue-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span>{t.code}</span>
              {isOccupied && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
            </button>
          );
        })}
      </div>

      {/* Main Cashier Workspace (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Bill Breakdown, Guests & Promo (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Table & Package Header Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-black text-lg">
                  {activeTableCode}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {isLao ? `ບິນໂຕະ ${activeTableCode}` : `Invoice for Table ${activeTableCode}`}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {session?.status || 'NO_SESSION'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {currentBranch.nameLao.split(':')[1]} • {isLao ? 'ພະນັກງານແຄັດເຊຍ: ນາງ ນ້ອຍ' : 'Cashier: Noy K.'}
                  </p>
                </div>
              </div>

              {pkg && (
                <div className="text-right">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${pkg.badgeBg} ${pkg.badgeText} border ${pkg.badgeBorder}`}>
                    {pkg.nameEn.split(' ')[0]} BUFFET
                  </span>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                    {pkg.priceLAK.toLocaleString()} ₭ / {isLao ? 'ທ່ານ' : 'pax'}
                  </div>
                </div>
              )}
            </div>

            {/* Overstay/Time Expired Red Notice */}
            {session && session.remainingMinutes !== undefined && session.remainingMinutes <= 0 && (
              <div className="mt-4 bg-red-600 text-white rounded-2xl p-3 flex items-center justify-between text-xs font-bold animate-pulse shadow-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-300 animate-bounce shrink-0" />
                  <div>
                    <div className="leading-tight">{isLao ? '🚨 ໂຕະນີ້ໝົດເວລາຮັບປະທານບຸບເຟ່ແລ້ວ!' : '🚨 Table Buffet Time is Expired!'}</div>
                    <div className="text-[10px] text-red-100 font-normal">
                      {isLao ? 'ກະລຸນາກວດສອບຍອດບິນ ແລະ ກົດຊຳລະເງິນເພື່ອບັນທຶກເຂົ້າພາບລວມແດັສບອດປະຈຳວັນ' : 'Please settle bill to record into daily overview dashboard'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] bg-white text-red-700 px-2 py-0.5 rounded-lg font-black shrink-0">
                  {isLao ? '0m ໝົດເວລາ' : 'Time Up'}
                </span>
              </div>
            )}

            {/* Dynamic Guest Pricing Breakdown */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isLao ? 'ລາຍລະອຽດແຂກ & ລາຄາບຸບເຟ່ (Dynamic Guest Breakdown):' : 'Guest Breakdown & Buffet Pricing:'}
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                
                {/* Full Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-[10px]">
                      {fullGuests}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {isLao ? 'ຜູ້ໃຫຍ່ (Full Price 100%)' : 'Adult Guests (Full Price)'}
                    </span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-mono font-bold">
                    {fullGuests} × {unitPrice.toLocaleString()} = <span className="text-emerald-600">{fullPriceSubtotal.toLocaleString()} ₭</span>
                  </div>
                </div>

                {/* Half Price */}
                <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-700/40 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 font-bold flex items-center justify-center text-[10px]">
                      {halfGuests}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {isLao ? 'ເດັກນ້ອຍ (Half Price 50% ຫຼຸດເຄິ່ງ)' : 'Children (50% Off)'}
                    </span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-mono font-bold">
                    {halfGuests} × {(unitPrice * 0.5).toLocaleString()} = <span className="text-blue-600">{halfPriceSubtotal.toLocaleString()} ₭</span>
                  </div>
                </div>

                {/* Free Price */}
                <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-700/40 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center text-[10px]">
                      {freeGuests}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {isLao ? 'ເດັກນ້ອຍຕ່ຳກວ່າ 90cm / VIP (Free 100%)' : 'Toddlers / VIP Free (100% Off)'}
                    </span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-mono font-bold">
                    {freeGuests} × 0 ₭ = <span className="text-purple-600">0 ₭</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Promo Code & Discount Engine */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isLao ? 'ໂປຣໂມຊັ່ນ & ລະຫັດສ່ວນຫຼຸດ (Promotion Engine):' : 'Promotion & Discount Engine:'}
              </label>

              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder={isLao ? 'ໃສ່ລະຫັດ ເຊັ່ນ BUFFET10, BCEL50K' : 'e.g. BUFFET10, BCEL50K'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono uppercase font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                >
                  {isLao ? 'ນຳໃຊ້' : 'Apply'}
                </button>
              </form>

              {/* Promo validation feedback */}
              {promoError && (
                <div className="mt-2 text-[11px] text-red-600 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{promoError}</span>
                </div>
              )}
              {promoSuccess && (
                <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{promoSuccess}</span>
                </div>
              )}

              {/* Available active promos hint */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[10px] text-slate-400">{isLao ? 'ລະຫັດແນະນຳ:' : 'Available:'}</span>
                {MOCK_PROMOTIONS.map(p => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      setPromoCodeInput(p.code);
                      setAppliedPromo(p);
                      setPromoSuccess(isLao ? `ນຳໃຊ້ລະຫັດ ${p.code} ສຳເລັດ!` : `Applied ${p.code}!`);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-md font-mono font-bold border border-amber-500/20"
                  >
                    {p.code} (-{p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `${p.discountValue.toLocaleString()} ₭`})
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Calculations & Lao Payment Methods (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Bill Total Calculation Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {isLao ? 'ສະຫຼຸບຍອດຊຳລະເງິນ (Settlement Summary)' : 'Settlement Summary'}
            </h4>

            <div className="space-y-2 text-xs border-y border-slate-800 py-3">
              <div className="flex items-center justify-between text-slate-300">
                <span>{isLao ? 'ຍອດລວມອາຫານບຸບເຟ່ (Subtotal):' : 'Buffet Subtotal:'}</span>
                <span className="font-mono font-bold">{baseSubtotal.toLocaleString()} ₭</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>{isLao ? `ສ່ວນຫຼຸດ (${appliedPromo?.code}):` : `Discount (${appliedPromo?.code}):`}</span>
                  <span className="font-mono">-{discountAmount.toLocaleString()} ₭</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span>{isLao ? 'ຄ່າບໍລິການ (Service Charge 5%):' : 'Service Charge (5%):'}</span>
                <span className="font-mono">{serviceCharge.toLocaleString()} ₭</span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>{isLao ? 'ອາກອນມູນຄ່າເພີ່ມ (VAT 7%):' : 'VAT Tax (7%):'}</span>
                <span className="font-mono">{vatTax.toLocaleString()} ₭</span>
              </div>
            </div>

            {/* NET TOTAL */}
            <div className="pt-1 flex items-baseline justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400">{isLao ? 'ຍອດສຸດທິ (Net Total):' : 'Net Total Due:'}</div>
                <div className="text-[10px] text-amber-400/80">{isLao ? 'ສະກຸນເງິນກີບລາວ (LAK)' : 'Lao Kip (LAK)'}</div>
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                {netTotalLAK.toLocaleString()} ₭
              </div>
            </div>
          </div>

          {/* Payment Method Selector (Lao Ecosystem) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">
              {isLao ? 'ເລືອກຊ່ອງທາງການຊຳລະເງິນ (Payment Ecosystem):' : 'Select Payment Method:'}
            </h4>

            <div className="grid grid-cols-2 gap-2">
              
              {/* LAO QR / BCEL OnePay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('LAO_QR_BCEL')}
                className={`p-3 rounded-2xl border text-left transition ${
                  paymentMethod === 'LAO_QR_BCEL'
                    ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/20 text-red-950 dark:text-red-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">BCEL OnePay</span>
                  <QrCode className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">LAO QR Dynamic Code</div>
              </button>

              {/* LDB TrustPay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('LDB_TRUST')}
                className={`p-3 rounded-2xl border text-left transition ${
                  paymentMethod === 'LDB_TRUST'
                    ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20 text-blue-950 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">LDB Trust</span>
                  <QrCode className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Lao Development Bank</div>
              </button>

              {/* Cash Payment */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-2xl border text-left transition ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 text-emerald-950 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{isLao ? 'ເງິນສົດ (Cash)' : 'Cash'}</span>
                  <Banknote className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{isLao ? 'ຄິດໄລ່ເງິນທອນ' : 'Cash calculation'}</div>
              </button>

              {/* Credit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-3 rounded-2xl border text-left transition ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20 text-purple-950 dark:text-purple-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Credit Card</span>
                  <CreditCard className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Visa / Mastercard / UnionPay</div>
              </button>

            </div>

            {/* Check-Out Submit Button */}
            <button
              id="btn-process-checkout"
              onClick={handleInitiatePayment}
              className="w-full mt-3 py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                <PartyPopper className="w-4 h-4 text-white" />
              </div>
              <span className="text-base tracking-tight">
                {isLao 
                  ? `ຢືນຢັນຊຳລະເງິນ ${netTotalLAK.toLocaleString()} ₭ (Check-Out)` 
                  : `Confirm & Settle ${netTotalLAK.toLocaleString()} LAK`}
              </span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white/20 ml-1 tracking-wider text-emerald-100 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" />
                0ms
              </span>
            </button>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* GUARDRAIL BLOCKED MODAL (STRICT VALIDATION) */}
      {/* ========================================================================= */}
      {guardrailBlockedModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 mx-auto mb-4 border border-red-300">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
                CHECKOUT GUARDRAIL BLOCKED
              </span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {isLao ? 'ລະບົບປ້ອງກັນ: ບໍ່ສາມາດ Check-out ບິນເປົ່າໄດ້!' : 'Blocked: Cannot Checkout Empty Session'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {guardrailReason}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <button
                onClick={() => setGuardrailBlockedModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800"
              >
                {isLao ? 'ຮັບຊາບ & ກັບຄືນໄປແກ້ໄຂ' : 'Acknowledge & Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECEIPT / PAYMENT SUCCESS MODAL (MODERN ZERO-DELAY CELEBRATION) */}
      {/* ========================================================================= */}
      {generatedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-500/30 dark:border-emerald-500/20 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
            
            {/* Ambient Festive Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-500"></div>

            {/* Header with Celebration Banner */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-500/10">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow">
                    ✓
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {isLao ? 'ຊຳລະເງິນທັນທີ 0ms' : 'Instant Settle 0ms'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {generatedReceipt.bcelRef.slice(-8)}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight mt-0.5">
                    {isLao ? 'ຊຳລະເງິນສຳເລັດ • ພລຸສະຫຼອງທັນທີ!' : 'Payment Settled • Instant Celebration!'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Replay Confetti Button */}
                <button
                  type="button"
                  onClick={launchModernCelebrationFireworks}
                  title={isLao ? 'ຍິງພລຸສະຫຼອງອີກຮອບ' : 'Fire Confetti Again'}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <PartyPopper className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline text-[11px]">{isLao ? 'ຍິງພລຸ' : 'Fireworks'}</span>
                </button>

                <button 
                  onClick={handleCloseReceipt}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Thermal Receipt Preview */}
            <div className="my-4 p-5 bg-slate-50 dark:bg-slate-850/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 font-mono text-xs space-y-2.5 shadow-inner">
              <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
                <div className="font-black text-sm text-slate-900 dark:text-white tracking-wide">LAO BUFFET RESTAURANT</div>
                <div className="text-[11px] font-sans font-semibold text-amber-600 dark:text-amber-400 mt-0.5">{generatedReceipt.branchNameLao}</div>
                <div className="text-[10px] text-slate-400 mt-1">Invoice: {generatedReceipt.billNumber}</div>
              </div>

              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">{isLao ? 'ໂຕະ:' : 'Table:'}</span>
                <span className="font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-[10px]">
                  {generatedReceipt.tableCodes.join(', ')}
                </span>
              </div>

              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">{isLao ? 'ແພັກເກັດ:' : 'Package Tier:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {generatedReceipt.packageTier}
                </span>
              </div>

              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">{isLao ? 'ລວມລາຄາອາຫານ:' : 'Food Subtotal:'}</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {generatedReceipt.subtotalLAK.toLocaleString()} ₭
                </span>
              </div>

              {generatedReceipt.discountLAK > 0 && (
                <div className="flex justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
                  <span>{isLao ? 'ສ່ວນຫຼຸດໂປຣໂມຊັ່ນ:' : 'Promo Discount:'} ({generatedReceipt.promoCode})</span>
                  <span>-{generatedReceipt.discountLAK.toLocaleString()} ₭</span>
                </div>
              )}

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Service Charge (5%):</span>
                <span>{generatedReceipt.serviceChargeLAK.toLocaleString()} ₭</span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>VAT (7%):</span>
                <span>{generatedReceipt.vatTaxLAK.toLocaleString()} ₭</span>
              </div>

              <div className="pt-2.5 border-t border-dashed border-slate-300 dark:border-slate-700 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                <span>{isLao ? 'ຍອດລວມທັງໝົດ:' : 'NET TOTAL:'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base">
                  {generatedReceipt.netTotalLAK.toLocaleString()} ₭
                </span>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-700/60 mt-1">
                Method: <strong className="text-slate-700 dark:text-slate-300">{generatedReceipt.paymentMethod}</strong> • Status: <strong className="text-emerald-600">PAID ✓</strong>
              </div>
            </div>

            {/* Dashboard Record Notice & Quick Navigate */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isLao ? '✓ ບັນທຶກເຂົ້າພາບລວມແດັສບອດປະຈຳວັນແລ້ວ' : '✓ Recorded into daily overview dashboard'}</span>
              </div>
              {onNavigateToDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    handleCloseReceipt();
                    onNavigateToDashboard();
                  }}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black shrink-0 flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{isLao ? 'ເບິ່ງແດັສບອດ' : 'Dashboard'} →</span>
                </button>
              )}
            </div>

            {/* Actions: Print Receipt & Close */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => alert(isLao ? 'ກຳລັງສັ່ງພິມໃບບິນໄປທີ່ເຄື່ອງພິມ POS Thermal 80mm...' : 'Printing receipt to 80mm thermal printer...')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>{isLao ? 'ພິມໃບບິນ (Print Receipt)' : 'Print Receipt'}</span>
              </button>

              <button
                type="button"
                onClick={handleCloseReceipt}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
              >
                {isLao ? 'ປິດ & ປົດລັອກໂຕະ (Done)' : 'Close & Release Table'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
