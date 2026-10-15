import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Flame, 
  BellRing, 
  UtensilsCrossed, 
  AlertTriangle,
  Play,
  Check,
  Filter,
  Volume2,
  VolumeX,
  Hourglass,
  Sparkles,
  ChevronRight,
  PlusCircle,
  Timer
} from 'lucide-react';
import { Order, OrderItem, Language } from '../../types';
import { playLaoOrderVoiceAlert } from '../../utils/audioAlert';

interface KitchenDisplaySystemProps {
  orders: Order[];
  language: Language;
  onUpdateItemStatus: (orderId: string, itemId: string, newStatus: 'PENDING' | 'COOKING' | 'READY' | 'SERVED') => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: 'PENDING' | 'COOKING' | 'READY' | 'SERVED') => void;
  onCompleteOrder: (orderId: string) => void;
  onTriggerDelayedAlert: (orderId: string) => void;
  onNavigateToMobileSimulator?: () => void;
  onNavigateToFloorPlan?: () => void;
  onAddTestOrder?: () => void;
}

// Kitchen Audio Chime Feedback
const playKitchenChime = (type: 'accept' | 'ready' | 'served' | 'alert') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'accept') {
      // Step 1 Chime: Pleasant upward notification (Accepting order & starting cook)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'ready') {
      // Step 2 -> 3 Chime: Bright high bell (Food is cooked, ready to serve!)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'served') {
      // Step 4 Chime: Warm gentle completed tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'alert') {
      // Priority delay alert
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    // Ignore audio permission errors
  }
};

export const KitchenDisplaySystem: React.FC<KitchenDisplaySystemProps> = ({
  orders,
  language,
  onUpdateItemStatus,
  onUpdateOrderStatus,
  onCompleteOrder,
  onTriggerDelayedAlert,
  onNavigateToMobileSimulator,
  onNavigateToFloorPlan,
  onAddTestOrder,
}) => {
  const isLao = language === 'la';

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COOKING' | 'READY' | 'DELAYED'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Update live clock every 3 seconds to keep minutes elapsed synchronized
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const triggerChime = (type: 'accept' | 'ready' | 'served' | 'alert') => {
    if (soundEnabled) {
      playKitchenChime(type);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'DELAYED') return order.isDelayed;
    if (statusFilter === 'PENDING') return order.status === 'PENDING';
    if (statusFilter === 'COOKING') return order.status === 'COOKING';
    if (statusFilter === 'READY') return order.status === 'READY';
    return true;
  });

  const delayedCount = orders.filter(o => o.isDelayed).length;
  const cookingCount = orders.filter(o => o.status === 'COOKING').length;
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const readyCount = orders.filter(o => o.status === 'READY').length;

  return (
    <div className="space-y-6">
      
      {/* Header & KDS Summary Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  {isLao ? 'ຈໍສະແດງຜົນໃນຄົວ KDS (Kitchen Display System)' : 'Kitchen Display System (KDS)'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold animate-pulse">
                  LIVE SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isLao 
                  ? 'ຂັ້ນຕອນຄົວ: 1. ກົດຮັບອໍເດີ ➔ 2. ກຳລັງປຸງ (ບອກເວລາປະມານ) ➔ 3. ປຸງແລ້ວບອກ "ແລ້ວພ້ອມເສີມ" ➔ 4. ເສີບເຖິງໂຕະ' 
                  : 'Workflow: 1. Accept Order ➔ 2. Cooking (est. time) ➔ 3. Ready to Serve (ແລ້ວພ້ອມເສີມ) ➔ 4. Served'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <div className={`px-3 py-1 text-center rounded-xl transition ${pendingCount > 0 ? 'bg-amber-500/15' : ''}`}>
              <div className="text-[11px] text-amber-300 font-bold">{isLao ? '1. ລໍຖ້າຮັບ' : '1. Pending'}</div>
              <div className="text-base font-black text-amber-400">{pendingCount}</div>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="px-3 py-1 text-center">
              <div className="text-[11px] text-blue-300 font-bold">{isLao ? '2. ກຳລັງປຸງ' : '2. Cooking'}</div>
              <div className="text-base font-extrabold text-blue-400">{cookingCount}</div>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="px-3 py-1 text-center">
              <div className="text-[11px] text-emerald-300 font-bold">{isLao ? '3. ແລ້ວພ້ອມເສີມ' : '3. Ready'}</div>
              <div className="text-base font-extrabold text-emerald-400">{readyCount}</div>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="px-3 py-1 text-center bg-red-500/20 rounded-xl border border-red-500/30">
              <div className="text-[11px] text-red-300 font-bold">{isLao ? 'ຊັກຊ້າ >10m' : 'Delayed'}</div>
              <div className="text-base font-black text-red-400">{delayedCount}</div>
            </div>
          </div>

          {/* Quick Action Navigation & Tools */}
          <div className="flex items-center gap-2">
            {/* Audio chime toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) triggerChime('accept');
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                soundEnabled 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={soundEnabled ? (isLao ? 'ປິດສຽງເຕືອນ' : 'Mute Sound') : (isLao ? 'ເປີດສຽງເຕືອນ' : 'Enable Sound')}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Test Voice Announcement Button */}
            <button
              onClick={() => playLaoOrderVoiceAlert('A-01')}
              className="px-2.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title={isLao ? 'ທົດສອບສຽງເຕືອນພາສາລາວ "ອໍເດີເຂົ້າແລ້ວ!"' : 'Test voice: "Order Arrived!"'}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">{isLao ? 'ສຽງ: "ອໍເດີເຂົ້າແລ້ວ"' : 'Voice Alert'}</span>
            </button>

            {/* Test incoming order button */}
            {onAddTestOrder && (
              <button
                onClick={() => {
                  onAddTestOrder();
                  playLaoOrderVoiceAlert();
                }}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition active:scale-95 cursor-pointer"
                title={isLao ? 'ສ້າງອໍເດີທົດສອບເຂົ້າມາໃນຄົວເພື່ອທົດລອງຂັ້ນຕອນ' : 'Simulate incoming test order'}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isLao ? '⚡ ທົດສອບຮັບອໍເດີໃໝ່' : 'Test Order'}</span>
              </button>
            )}

            {onNavigateToMobileSimulator && (
              <button
                onClick={onNavigateToMobileSimulator}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 transition active:scale-95 cursor-pointer"
              >
                <span>📱 {isLao ? 'ໜ້າມືຖືລູກຄ້າ' : 'Mobile Order'}</span>
              </button>
            )}
            {onNavigateToFloorPlan && (
              <button
                onClick={onNavigateToFloorPlan}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <span>🪑 {isLao ? 'ຜັງໂຕະ' : 'Floor Plan'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Filter Pills with explicit step names */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800 overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" />
            {isLao ? 'ກັ່ນຕອງຂັ້ນຕອນ:' : 'Filter Step:'}
          </span>
          {(['ALL', 'PENDING', 'COOKING', 'READY', 'DELAYED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                statusFilter === tab
                  ? tab === 'DELAYED'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : tab === 'READY'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                    : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab === 'ALL' && (isLao ? 'ທຸກອໍເດີ (All)' : 'All Tickets')}
              {tab === 'PENDING' && (isLao ? `🛎️ ຂັ້ນຕອນ 1: ລໍຖ້າຮັບອໍເດີ (${pendingCount})` : `Step 1: Pending (${pendingCount})`)}
              {tab === 'COOKING' && (isLao ? `🔥 ຂັ້ນຕອນ 2: ກຳລັງປຸງ (${cookingCount})` : `Step 2: Cooking (${cookingCount})`)}
              {tab === 'READY' && (isLao ? `✨ ຂັ້ນຕອນ 3: ແລ້ວພ້ອມເສີມ (${readyCount})` : `Step 3: Ready (${readyCount})`)}
              {tab === 'DELAYED' && `🚨 ${isLao ? 'ອໍເດີຊ້າ >10m' : 'Delayed'} (${delayedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* TICKET QUEUE GRID */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {isLao ? 'ບໍ່ມີອໍເດີຄ້າງໃນຄິວນີ້' : 'All orders prepared & served!'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {isLao ? 'ຄົວພ້ອມຮັບອໍເດີໃໝ່ຈາກລູກຄ້າສະແກນ QR Code' : 'Kitchen is ready for next table tickets'}
          </p>
          {onAddTestOrder && (
            <button
              onClick={() => {
                onAddTestOrder();
                triggerChime('accept');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isLao ? 'ກົດເພື່ອທົດສອບຮັບອໍເດີໃໝ່ດຽວນີ້' : 'Simulate incoming test order now'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map(order => {
            const isDelayed = order.isDelayed;
            const hasPending = order.items.some(i => i.status === 'PENDING') || order.status === 'PENDING';
            const hasCooking = order.items.some(i => i.status === 'COOKING') || order.status === 'COOKING';
            const allReadyOrServed = order.items.every(i => i.status === 'READY' || i.status === 'SERVED') && order.items.length > 0;
            const allServed = order.items.every(i => i.status === 'SERVED') && order.items.length > 0;
            
            // Calculate maximum and average estimated prep time for dishes
            const maxPrepTime = Math.max(...order.items.map(i => i.prepTimeMinutes || 5), 5);

            // Determine explicit step state
            // Step 1: PENDING (needs accept)
            // Step 2: COOKING (cooking with approx minutes)
            // Step 3: READY (ແລ້ວພ້ອມເສີມ)
            // Step 4: SERVED (served to table)
            const currentStep = hasPending ? 1 : (hasCooking && !allReadyOrServed) ? 2 : (allReadyOrServed && !allServed) ? 3 : 4;

            const isCooking = currentStep === 2;
            const isReady = currentStep === 3;
            const isServed = currentStep === 4;

            const orderDate = new Date(order.orderTime);
            const elapsedMinutes = Math.max(0, Math.floor((currentTime - orderDate.getTime()) / 60000));
            const orderTimeFormatted = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={order.id}
                className={`rounded-3xl border transition-all duration-200 bg-white dark:bg-slate-800 shadow-md flex flex-col justify-between overflow-hidden relative ${
                  isDelayed 
                    ? 'border-red-500 ring-4 ring-red-500/20 bg-red-50/20 dark:bg-red-950/10' 
                    : isReady
                    ? 'border-emerald-500 ring-4 ring-emerald-500/25 shadow-emerald-500/15'
                    : isCooking
                    ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-amber-400/10'
                    : 'border-blue-400 dark:border-slate-700 ring-2 ring-blue-400/30'
                }`}
              >
                
                {/* Delayed Banner */}
                {isDelayed && (
                  <div className="bg-red-600 text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold animate-pulse">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{isLao ? `ອາຫານຊ້າກວ່າ SLA (+${order.delayedMinutes} ນາທີ)` : `Delayed > 10 mins (+${order.delayedMinutes}m)`}</span>
                    </div>
                    <span className="text-[10px] bg-white text-red-600 px-1.5 py-0.5 rounded font-black">
                      CARE ALERT
                    </span>
                  </div>
                )}

                {/* Ticket Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-base shadow-sm">
                      {order.tableCode}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 border ${
                          elapsedMinutes >= 10
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 animate-pulse'
                            : elapsedMinutes >= 5
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        }`}>
                          <Hourglass className="w-2.5 h-2.5" />
                          <span>{isLao ? `ຕອນນີ້ໄດ້: ${elapsedMinutes} ນາທີ` : `Elapsed: ${elapsedMinutes}m`}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{isLao ? `ເລີ່ມສັ່ງ: ${orderTimeFormatted}` : `Started: ${orderTimeFormatted}`}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400 font-mono text-[10px]">{order.items.length} {isLao ? 'ລາຍການ' : 'items'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Explicit Current Status Badge */}
                  <div>
                    {isReady ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                        <span>{isLao ? '✨ ແລ້ວພ້ອມເສີມ' : 'Ready to Serve'}</span>
                      </span>
                    ) : isCooking ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 flex items-center gap-1.5 shadow-sm animate-pulse">
                        <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                        <span>{isLao ? `🔥 ກຳລັງປຸງ (~${maxPrepTime} ນາທີ)` : `Cooking (~${maxPrepTime}m)`}</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-slate-950 border border-amber-400 flex items-center gap-1.5 shadow-sm animate-pulse">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isLao ? '🛎️ ລໍຖ້າກົດຮັບອໍເດີ' : 'Waiting to Accept'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 4-STEP SEQUENTIAL WORKFLOW STEPPER BAR ("ຕາມຂັ້ນຕອນ") */}
                <div className="px-3 py-2 bg-slate-100/90 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center justify-between text-[10px] font-bold gap-1">
                    
                    {/* Step 1: ຮັບອໍເດີ */}
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all ${
                      currentStep === 1
                        ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400 shadow-sm animate-pulse'
                        : 'text-emerald-600 dark:text-emerald-400 font-bold'
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                        currentStep === 1 ? 'bg-slate-950 text-amber-400 font-black' : 'bg-emerald-500 text-white'
                      }`}>
                        {currentStep > 1 ? '✓' : '1'}
                      </span>
                      <span>{isLao ? '1. ຮັບອໍເດີ' : '1. Accept'}</span>
                    </div>

                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />

                    {/* Step 2: ກຳລັງປຸງ (ໃຊ້ເວລາປະມານ X ນາທີ) */}
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all ${
                      currentStep === 2
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black ring-2 ring-amber-400/50 shadow-sm animate-pulse'
                        : currentStep > 2
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                        currentStep === 2 
                          ? 'bg-amber-500 text-slate-950 font-black' 
                          : currentStep > 2 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {currentStep > 2 ? '✓' : '2'}
                      </span>
                      <span>{isLao ? `2. ກຳລັງປຸງ (~${maxPrepTime}m)` : `2. Cook (~${maxPrepTime}m)`}</span>
                    </div>

                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />

                    {/* Step 3: ແລ້ວພ້ອມເສີມ */}
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all ${
                      currentStep === 3
                        ? 'bg-emerald-500 text-white font-black ring-2 ring-emerald-400 shadow-md animate-bounce'
                        : currentStep > 3
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                        currentStep === 3 
                          ? 'bg-slate-950 text-white' 
                          : currentStep > 3 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {currentStep > 3 ? '✓' : '3'}
                      </span>
                      <span>{isLao ? '3. ແລ້ວພ້ອມເສີມ' : '3. Ready'}</span>
                    </div>

                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />

                    {/* Step 4: ເສີບແລ້ວ */}
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all ${
                      currentStep === 4
                        ? 'bg-blue-600 text-white font-black'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                        currentStep === 4 ? 'bg-white text-blue-600 font-black' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {currentStep === 4 ? '✓' : '4'}
                      </span>
                      <span>{isLao ? '4. ເສີບແລ້ວ' : '4. Served'}</span>
                    </div>

                  </div>
                </div>

                {/* Ticket Items List */}
                <div className="p-4 space-y-3 flex-1">
                  {order.items.map((item) => {
                    const itemPrepTime = item.prepTimeMinutes || 5;
                    return (
                      <div 
                        key={item.id}
                        className={`p-3 rounded-2xl border transition space-y-2 ${
                          item.status === 'READY'
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                            : item.status === 'COOKING'
                            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                            : item.status === 'SERVED'
                            ? 'bg-slate-100/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                            : 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                              item.status === 'READY'
                                ? 'bg-emerald-500 text-white'
                                : item.status === 'COOKING'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-amber-400'
                            }`}>
                              {item.quantity}x
                            </span>
                            <div>
                              <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                                {isLao ? item.nameLao : item.nameEn}
                              </div>
                              
                              {/* Progressive status text & approx prep time */}
                              {item.status === 'PENDING' && (
                                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 mt-0.5">
                                  <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span>{isLao ? `⏱️ ໃຊ້ເວລາປຸງແຕ່ງປະມານ ${itemPrepTime} ນາທີ (ລໍຖ້າຮັບອໍເດີ)` : `⏱️ Est. prep: ~${itemPrepTime} mins (Pending)`}</span>
                                </div>
                              )}
                              {item.status === 'COOKING' && (
                                <div className="text-[11px] text-amber-700 dark:text-amber-300 font-black flex items-center gap-1.5 mt-0.5">
                                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce shrink-0" />
                                  <span>{isLao ? `🔥 ກຳລັງປຸງ • ໃຊ້ເວລາປະມານ ${itemPrepTime} ນາທີ` : `🔥 Cooking • Approx ${itemPrepTime} mins`}</span>
                                </div>
                              )}
                              {item.status === 'READY' && (
                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1.5 mt-0.5">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3] shrink-0" />
                                  <span>{isLao ? '✨ ແລ້ວພ້ອມເສີມເຖິງໂຕະ!' : '✨ Done • Ready to serve!'}</span>
                                </div>
                              )}
                              {item.status === 'SERVED' && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{isLao ? '✓ ເສີບເຖິງໂຕະຮຽບຮ້ອຍແລ້ວ' : '✓ Served to table'}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Progressive Action Button for Each Dish */}
                          <div>
                            {item.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => {
                                  triggerChime('accept');
                                  onUpdateItemStatus(order.id, item.id, 'COOKING');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/30 active:scale-95 transition cursor-pointer"
                                title={isLao ? 'ກົດຮັບອໍເດີເພື່ອເລີ່ມປຸງແຕ່ງ' : 'Accept order and start cooking'}
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>{isLao ? '🛎️ ກົດຮັບອໍເດີ' : 'Accept Order'}</span>
                              </button>
                            )}

                            {item.status === 'COOKING' && (
                              <button
                                type="button"
                                onClick={() => {
                                  triggerChime('ready');
                                  onUpdateItemStatus(order.id, item.id, 'READY');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition cursor-pointer animate-pulse"
                                title={isLao ? 'ກົດເມື່ອປຸງແລ້ວ ພ້ອມເສີມ' : 'Cooked & ready to serve'}
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>{isLao ? '✨ ແລ້ວພ້ອມເສີມ' : 'Ready'}</span>
                              </button>
                            )}

                            {item.status === 'READY' && (
                              <button
                                type="button"
                                onClick={() => {
                                  triggerChime('served');
                                  onUpdateItemStatus(order.id, item.id, 'SERVED');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                                title={isLao ? 'ກົດເມື່ອເສີບລູກຄ້າແລ້ວ' : 'Mark served'}
                              >
                                <UtensilsCrossed className="w-3 h-3" />
                                <span>{isLao ? '🍽️ ເສີບແລ້ວ' : 'Served'}</span>
                              </button>
                            )}

                            {item.status === 'SERVED' && (
                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                ✓ {isLao ? 'ເສີບແລ້ວ' : 'Served'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Special Notes if any */}
                        {(item.specialNotes || item.specialNote) && (
                          <div className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10 p-2 rounded-xl border border-amber-300/40 dark:border-amber-500/20 italic font-medium">
                            🥢 {item.specialNotes || item.specialNote}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Ticket Bottom Actions - Exact Step-by-Step Order Execution Workflow */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                  {isDelayed && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerChime('alert');
                        onTriggerDelayedAlert(order.id);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-200 cursor-pointer"
                    >
                      <BellRing className="w-3.5 h-3.5 text-red-600 animate-ping" />
                      <span>{isLao ? '🚨 ແຈ້ງເຕືອນພະນັກງານດູແລດ່ວນ' : 'Notify Waiter Priority Care'}</span>
                    </button>
                  )}

                  {/* Step 1: When order has pending items -> Click to Accept & Start Cooking */}
                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        triggerChime('accept');
                        if (onUpdateOrderStatus) {
                          onUpdateOrderStatus(order.id, 'COOKING');
                        } else {
                          order.items.forEach(i => onUpdateItemStatus(order.id, i.id, 'COOKING'));
                        }
                      }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-98 transition cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isLao ? '🛎️ ຂັ້ນຕອນທີ 1: ກົດຮັບອໍເດີ (ເລີ່ມປຸງແຕ່ງທຸກເມນູ)' : 'Step 1: Accept Order & Start Cooking'}</span>
                    </button>
                  ) : currentStep === 2 ? (
                    /* Step 2: Cooking in progress -> Click to Mark Cooked & Ready to Serve */
                    <button
                      type="button"
                      onClick={() => {
                        triggerChime('ready');
                        if (onUpdateOrderStatus) {
                          onUpdateOrderStatus(order.id, 'READY');
                        } else {
                          order.items.forEach(i => onUpdateItemStatus(order.id, i.id, 'READY'));
                        }
                      }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-98 transition cursor-pointer animate-pulse"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isLao ? '✨ ຂັ້ນຕອນທີ 2: ປຸງແລ້ວ (ແລ້ວພ້ອມເສີມ)' : 'Step 2: Mark Done (Ready to Serve)'}</span>
                    </button>
                  ) : currentStep === 3 ? (
                    /* Step 3: Cooked & Ready -> Click to Deliver to Table */
                    <button
                      type="button"
                      onClick={() => {
                        triggerChime('served');
                        onCompleteOrder(order.id);
                      }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-98 transition cursor-pointer"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>{isLao ? '🍽️ ຂັ້ນຕອນທີ 3: ເສີບເຖິງໂຕະ (ສຳເລັດອໍເດີ)' : 'Step 3: Serve to Table (Complete Ticket)'}</span>
                    </button>
                  ) : (
                    /* Step 4: Completed Stage */
                    <div className="w-full py-2.5 rounded-2xl bg-slate-900/10 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{isLao ? '✓ ສຳເລັດອໍເດີ (ເສີບເຖິງໂຕະຮຽບຮ້ອຍ)' : 'Ticket Completed & Fully Served'}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
