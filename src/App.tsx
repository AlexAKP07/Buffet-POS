import React, { useState, useEffect } from 'react';
import { 
  FloorPlanDashboard 
} from './components/pos/FloorPlanDashboard';
import { 
  KitchenDisplaySystem 
} from './components/pos/KitchenDisplaySystem';
import { 
  CashierBillingScreen 
} from './components/pos/CashierBillingScreen';
import { 
  CustomerMobileSimulator 
} from './components/pos/CustomerMobileSimulator';
import { 
  AuthUserManagement 
} from './components/pos/AuthUserManagement';
import { 
  ReservationsManager 
} from './components/pos/ReservationsManager';
import { 
  LoginPortal 
} from './components/auth/LoginPortal';
import { 
  ExecutiveDashboard 
} from './components/dashboard/ExecutiveDashboard';
import { 
  QuickOpenTableModal 
} from './components/pos/QuickOpenTableModal';
import { 
  TableQrModal 
} from './components/pos/TableQrModal';
import { 
  MenuStockManager 
} from './components/pos/MenuStockManager';
import { 
  ShareSystemModal 
} from './components/pos/ShareSystemModal';
import confetti from 'canvas-confetti';

import { 
  Language, 
  PosViewTab, 
  RestaurantTable, 
  TableSession, 
  Order, 
  User, 
  Branch, 
  Reservation, 
  BuffetPackageTier, 
  GuestType, 
  BillReceipt, 
  MenuItem,
  StockRestockLog
} from './types';

import { 
  MOCK_BRANCHES, 
  MOCK_USERS, 
  MOCK_TABLES, 
  MOCK_SESSIONS, 
  MOCK_ORDERS, 
  MOCK_RESERVATIONS,
  BUFFET_PACKAGES,
  CLEAN_FRESH_TABLES,
  DEMO_BUSY_TABLES,
  DEMO_BUSY_SESSIONS,
  DEMO_BUSY_ORDERS,
  MOCK_PAID_BILLS,
  MOCK_MENU_ITEMS,
  INITIAL_STOCK_LOGS
} from './data/mockData';
import { JBBQLogo } from './components/common/JBBQLogo';
import { playLaoOrderVoiceAlert } from './utils/audioAlert';

import { 
  LayoutDashboard,
  LayoutGrid, 
  ChefHat, 
  Receipt, 
  Smartphone, 
  CalendarClock, 
  ShieldCheck, 
  Bell,
  Search,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Globe,
  Plus,
  Menu,
  X,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  Flame,
  ArrowRight,
  QrCode,
  Boxes,
  Share2
} from 'lucide-react';

export function App() {
  // Global Authentication State (Default logged in to Executive Dashboard; can sign out to Portal)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

  // Global Settings
  const [language, setLanguage] = useState<Language>('la');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentBranchId, setCurrentBranchId] = useState<string>('BR-VTE-01');

  // Navigation State: Active POS Tab
  const [activeTab, setActiveTab] = useState<PosViewTab>('DASHBOARD');

  // Interactive Live Data State
  const [tables, setTables] = useState<RestaurantTable[]>(MOCK_TABLES);
  const [sessions, setSessions] = useState<Record<string, TableSession>>(MOCK_SESSIONS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [paidBills, setPaidBills] = useState<BillReceipt[]>(MOCK_PAID_BILLS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [stockLogs, setStockLogs] = useState<StockRestockLog[]>(INITIAL_STOCK_LOGS);

  // Low stock items count for sidebar notification badge
  const lowStockAlertCount = menuItems.filter(m => (m.stockQty ?? 0) <= (m.minStockAlert ?? 15)).length;

  // Cashier Active Target
  const [cashierSelectedTable, setCashierSelectedTable] = useState<string>('A-01');
  const [mobileSimulatorSelectedTable, setMobileSimulatorSelectedTable] = useState<string>('A-01');

  // UI Interactive States
  const [isQuickOpenModalOpen, setIsQuickOpenModalOpen] = useState(false);
  const [isGlobalQrModalOpen, setIsGlobalQrModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'info';
  }>({
    show: true,
    title: 'Operation Successful',
    message: `Welcome back, ${MOCK_USERS[0].fullName}. Signed in as Administrator.`,
    type: 'success'
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToToast(prev => ({ ...prev, show: false }));
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Clear any celebration confetti immediately whenever navigating to a new tab/page
  useEffect(() => {
    try {
      confetti.reset();
    } catch {
      // ignore
    }
  }, [activeTab]);

  // Support real customer QR code scanning via mobile camera URL (?table=A-01)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table');
      if (tableParam) {
        setMobileSimulatorSelectedTable(tableParam);
        setActiveTab('MOBILE_SIMULATOR');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0];
  const isLao = language === 'la';

  // Delayed orders count for live badge
  const delayedOrdersCount = orders.filter(o => o.isDelayed).length;

  // ==========================================
  // AUTHENTICATION HANDLERS
  // ==========================================
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('DASHBOARD');
    setToToast({
      show: true,
      title: isLao ? 'ເຂົ້າສູ່ລະບົບສຳເລັດ' : 'Operation Successful',
      message: isLao 
        ? `ຍິນດີຕ້ອນຮັບ, ${user.fullName} (${user.role})` 
        : `Welcome back, ${user.fullName}. Signed in as ${user.role}.`,
      type: 'success'
    });
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  // ==========================================
  // POS OPERATIONAL HANDLERS
  // ==========================================

  // 1. Open Table (Dispatches Starter Soup & Grill setup to Kitchen KDS)
  const handleOpenTable = (
    tableCode: string, 
    pkgTier: BuffetPackageTier, 
    guestCounts: { full: number; half: number; free: number } | number, 
    halfOrNotes?: number | string,
    freeParam?: number,
    extraParam?: number,
    notesParam?: string
  ) => {
    const table = tables.find(t => t.code === tableCode);
    if (!table) return;

    let fullGuests = 2;
    let halfGuests = 0;
    let freeGuests = 0;
    let extraChairs = 0;
    let specialNotesStr = typeof halfOrNotes === 'string' ? halfOrNotes : (notesParam || '');

    if (typeof guestCounts === 'object' && guestCounts !== null) {
      fullGuests = Number(guestCounts.full) || 0;
      halfGuests = Number(guestCounts.half) || 0;
      freeGuests = Number(guestCounts.free) || 0;
    } else if (typeof guestCounts === 'number') {
      fullGuests = guestCounts;
      halfGuests = typeof halfOrNotes === 'number' ? halfOrNotes : 0;
      freeGuests = typeof freeParam === 'number' ? freeParam : 0;
      extraChairs = typeof extraParam === 'number' ? extraParam : 0;
    }

    const totalGuests = (fullGuests + halfGuests + freeGuests) > 0 ? (fullGuests + halfGuests + freeGuests) : (table.defaultCapacity || 2);
    const newSessionId = `SESS-${Date.now()}`;
    const startTime = new Date().toISOString();
    const pkg = BUFFET_PACKAGES[pkgTier] || BUFFET_PACKAGES.STANDARD;
    const duration = pkg.durationMinutes;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Starter setup order sent to kitchen immediately
    const starterOrderId = `ORD-SETUP-${Date.now()}`;
    const starterOrder: Order = {
      id: starterOrderId,
      orderNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      sessionId: newSessionId,
      tableCode,
      orderTime: startTime,
      status: 'PENDING',
      isDelayed: false,
      delayedMinutes: 0,
      items: [
        {
          id: `ITM-ST-1-${Date.now()}`,
          menuItemId: 'ITEM-ST-01',
          nameLao: 'ໝໍ້ຕົ້ມຊຸບດຳ/ຕົ້ມຍຳ + ເຕົາປີ້ງ BBQ',
          nameEn: 'Hotpot Soup Base + Charcoal BBQ Grill Setup',
          category: 'PORK',
          quantity: 1,
          specialNotes: isLao ? `ຊຸດເລີ່ມຕົ້ນ ສຳລັບ ${totalGuests} ທ່ານ (${pkg.nameLao})` : `Starter setup for ${totalGuests} guests (${pkg.nameEn})`,
          status: 'PENDING',
          prepTimeMinutes: 3,
          priceLAK: 0
        },
        {
          id: `ITM-ST-2-${Date.now()}`,
          menuItemId: 'ITEM-ST-02',
          nameLao: 'ຊຸດຊີ້ນ ແລະ ຜັກລວມເລີ່ມຕົ້ນ (Starter Platter)',
          nameEn: 'Starter Meat & Veggie Platter',
          category: 'BEEF',
          quantity: 1,
          specialNotes: isLao ? 'ເສີບທັນທີເມື່ອເປີດໂຕະ' : 'Serve immediately upon table open',
          status: 'PENDING',
          prepTimeMinutes: 4,
          priceLAK: 0
        }
      ]
    };

    const newGuests = [
      ...Array(fullGuests).fill(null).map((_, i) => ({
        id: `G-${Date.now()}-F${i}`,
        type: 'FULL' as GuestType,
        discountPercent: 0,
        priceCharged: pkg.priceLAK,
        addedAt: timeStr,
      })),
      ...Array(halfGuests).fill(null).map((_, i) => ({
        id: `G-${Date.now()}-H${i}`,
        type: 'HALF' as GuestType,
        discountPercent: 50,
        priceCharged: Math.round(pkg.priceLAK * 0.5),
        addedAt: timeStr,
      })),
      ...Array(freeGuests).fill(null).map((_, i) => ({
        id: `G-${Date.now()}-Z${i}`,
        type: 'FREE' as GuestType,
        discountPercent: 100,
        priceCharged: 0,
        addedAt: timeStr,
      })),
    ];

    const newSession: TableSession = {
      id: newSessionId,
      branchId: currentBranchId,
      tableCodes: [tableCode],
      packageTier: pkgTier,
      status: 'ACTIVE_EATING',
      guestCount: totalGuests,
      guests: newGuests,
      startTime,
      durationMinutes: duration,
      remainingMinutes: duration,
      extraCharges: [],
      orders: [starterOrder],
      specialNotes: specialNotesStr,
    };

    // Send starter order to KDS queue immediately
    setOrders(prev => [starterOrder, ...prev]);
    setSessions(prev => ({ ...prev, [newSessionId]: newSession }));
    setTables(prev => prev.map(t => t.code === tableCode ? {
      ...t,
      status: 'OCCUPIED',
      currentSessionId: newSessionId,
      currentGuests: totalGuests,
    } : t));
  };

  // Quick Open Table with Toast
  const handleQuickOpenTable = (
    tableCode: string, 
    pkgTier: BuffetPackageTier, 
    guestCounts: { full: number; half: number; free: number }, 
    extraChairs: number,
    notes?: string
  ) => {
    handleOpenTable(tableCode, pkgTier, guestCounts, notes);
    if (extraChairs > 0) {
      handleAddExtraChairs(tableCode, extraChairs);
    }
    setToToast({
      show: true,
      title: isLao ? 'ເປີດໂຕະສຳເລັດ' : 'Table Opened Successfully',
      message: isLao 
        ? `ເປີດໂຕະ ${tableCode} (${guestCounts.full + guestCounts.half + guestCounts.free} ທ່ານ) ຮຽບຮ້ອຍແລ້ວ`
        : `Table ${tableCode} opened with ${guestCounts.full + guestCounts.half + guestCounts.free} guests.`,
      type: 'success'
    });
  };

  // Reset shift to 0 occupied tables (clean fresh start)
  const handleResetToCleanShift = () => {
    setTables(CLEAN_FRESH_TABLES);
    setSessions({});
    setOrders([]);
    setPaidBills([]);
    setToToast({
      show: true,
      title: isLao ? 'ຣີເຊັດເປັນ 0 ສຳເລັດ' : 'Shift Reset to 0',
      message: isLao 
        ? `ທຸກໂຕະເລີ່ມຕົ້ນເປັນ 0 (ຫວ່າງທັງໝົດ ${CLEAN_FRESH_TABLES.length} ໂຕະ). ເມື່ອເປີດໂຕະຈຶ່ງສະແດງລາຍລະອຽດ.`
        : `All ${CLEAN_FRESH_TABLES.length} tables reset to 0 occupied. Details show upon opening a table.`,
      type: 'info'
    });
  };

  // Load demo busy shift
  const handleLoadDemoBusyShift = () => {
    setTables(DEMO_BUSY_TABLES);
    setSessions(DEMO_BUSY_SESSIONS);
    setOrders(DEMO_BUSY_ORDERS);
    setToToast({
      show: true,
      title: isLao ? 'ໂຫຼດຂໍ້ມູນຈຳລອງສຳເລັດ' : 'Loaded Demo Shift',
      message: isLao 
        ? 'ໂຫຼດໂຕະກຳລັງກິນ 5 ໂຕະ, ອໍເດີຄົວ ແລະ ເວລານັບຖອຍຫຼັງຮຽບຮ້ອຍແລ້ວ.'
        : 'Loaded 5 active tables with dining sessions, orders, and timers.',
      type: 'success'
    });
  };

  // 2. Add Extra Chairs
  const handleAddExtraChairs = (tableCode: string, delta: number = 1) => {
    setTables(prev => prev.map(t => {
      if (t.code === tableCode) {
        const nextCount = Math.max(0, Math.min(4, t.extraChairs + delta));
        return { ...t, extraChairs: nextCount };
      }
      return t;
    }));
    setToToast({
      show: true,
      title: isLao ? 'ເພີ່ມຕັ່ງສຳເລັດ' : 'Extra Chair Added',
      message: isLao ? `ເພີ່ມຕັ່ງໃສ່ໂຕະ ${tableCode} ແລ້ວ` : `Extra chair added to Table ${tableCode}`,
      type: 'success'
    });
  };

  // 3. Add Mid-Meal Guest
  const handleAddMidMealGuest = (tableCode: string, type: GuestType, count: number) => {
    const table = tables.find(t => t.code === tableCode);
    if (!table || !table.currentSessionId) return;

    const sessionId = table.currentSessionId;
    const session = sessions[sessionId];
    if (!session) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const pkg = BUFFET_PACKAGES[session.packageTier];
    const unitPrice = type === 'FULL' ? pkg.priceLAK : type === 'HALF' ? Math.round(pkg.priceLAK * 0.5) : 0;
    const discount = type === 'FULL' ? 0 : type === 'HALF' ? 50 : 100;

    const newGuestItems = Array(count).fill(null).map((_, i) => ({
      id: `G-MID-${Date.now()}-${i}`,
      type,
      discountPercent: discount,
      priceCharged: unitPrice,
      addedAt: timeStr,
      note: isLao ? 'ແຂກມາເພີ່ມກາງຄັນ (Mid-Meal Addition)' : 'Mid-Meal Addition'
    }));

    setSessions(prev => ({
      ...prev,
      [sessionId]: {
        ...session,
        guestCount: (session.guestCount || 0) + count,
        guests: [...(session.guests || []), ...newGuestItems]
      }
    }));

    setTables(prev => prev.map(t => t.code === tableCode ? {
      ...t,
      currentGuests: (t.currentGuests || 0) + count
    } : t));

    setToToast({
      show: true,
      title: isLao ? 'ເພີ່ມແຂກກາງຄັນສຳເລັດ' : 'Mid-Meal Guests Added',
      message: isLao 
        ? `ເພີ່ມ ${count} ທ່ານ ໃສ່ໂຕະ ${tableCode} (${type})` 
        : `Added ${count} mid-meal guests to Table ${tableCode} (${type})`,
      type: 'success'
    });
  };

  // 4. Merge Tables
  const handleMergeTables = (primaryTableCode: string, targetTableCode: string) => {
    const primaryTable = tables.find(t => t.code === primaryTableCode);
    const targetTable = tables.find(t => t.code === targetTableCode);
    if (!primaryTable || !targetTable || !primaryTable.currentSessionId) return;

    const primarySession = sessions[primaryTable.currentSessionId];
    if (!primarySession) return;

    let targetGuests = 0;
    let targetGuestItems: any[] = [];
    if (targetTable.currentSessionId && sessions[targetTable.currentSessionId]) {
      const targetSession = sessions[targetTable.currentSessionId];
      targetGuests = targetSession.guestCount || 0;
      targetGuestItems = targetSession.guests || [];
    }

    setSessions(prev => ({
      ...prev,
      [primaryTable.currentSessionId!]: {
        ...primarySession,
        tableCodes: [...new Set([...(primarySession.tableCodes || [primaryTableCode]), targetTableCode])],
        guestCount: (primarySession.guestCount || 0) + targetGuests,
        guests: [...(primarySession.guests || []), ...targetGuestItems],
      }
    }));

    setTables(prev => prev.map(t => {
      if (t.code === primaryTableCode) {
        return {
          ...t,
          isMerged: true,
          mergedWith: [...(t.mergedWith || []), targetTableCode]
        };
      }
      if (t.code === targetTableCode) {
        return {
          ...t,
          status: 'OCCUPIED',
          isMergedChild: true,
          masterTableCode: primaryTableCode,
          currentSessionId: primaryTable.currentSessionId
        };
      }
      return t;
    }));

    setToToast({
      show: true,
      title: isLao ? 'ຮວມໂຕະສຳເລັດ' : 'Tables Merged',
      message: isLao ? `ຮວມບິນໂຕະ ${targetTableCode} ເຂົ້າກັບ ${primaryTableCode} ແລ້ວ` : `Merged Table ${targetTableCode} into Master Table ${primaryTableCode}`,
      type: 'success'
    });
  };

  // 5. Send Care Alert for Delayed Order
  const handleSendCareAlert = (tableCode: string) => {
    setOrders(prev => prev.map(o => o.tableCode === tableCode ? { ...o, careAlertSent: true } : o));
    setTables(prev => prev.map(t => t.code === tableCode ? { ...t, status: 'DELAYED_ALERT' } : t));
    setToToast({
      show: true,
      title: isLao ? 'ສົ່ງແຈ້ງເຕືອນສຳເລັດ' : 'Care Alert Dispatched',
      message: isLao ? `ສົ່ງພະນັກງານໄປດູແລໂຕະ ${tableCode} ຮຽບຮ້ອຍແລ້ວ` : `Floor staff dispatched to attend Table ${tableCode}`,
      type: 'success'
    });
  };

  // 6. Kitchen Item Status Update
  const handleUpdateItemStatus = (orderId: string, itemId: string, newStatus: 'PENDING' | 'COOKING' | 'READY' | 'SERVED') => {
    let nextOrderStatus: 'PENDING' | 'COOKING' | 'READY' | 'SERVED' = 'COOKING';
    
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedItems = o.items.map(item => item.id === itemId ? { ...item, status: newStatus } : item);
        const allServed = updatedItems.every(i => i.status === 'SERVED');
        const allReady = updatedItems.every(i => i.status === 'READY' || i.status === 'SERVED');
        const anyCooking = updatedItems.some(i => i.status === 'COOKING');
        const allPending = updatedItems.every(i => i.status === 'PENDING');

        if (allServed) nextOrderStatus = 'SERVED';
        else if (allReady) nextOrderStatus = 'READY';
        else if (allPending) nextOrderStatus = 'PENDING';
        else if (anyCooking) nextOrderStatus = 'COOKING';

        return {
          ...o,
          items: updatedItems,
          status: nextOrderStatus,
          isDelayed: (allReady || allServed) ? false : o.isDelayed
        };
      }
      return o;
    }));

    // Keep sessions orders in sync
    setSessions(prev => {
      let changed = false;
      const nextSessions = { ...prev };
      Object.keys(nextSessions).forEach(key => {
        const s = nextSessions[key];
        if (s.orders && s.orders.some(o => o.id === orderId)) {
          changed = true;
          nextSessions[key] = {
            ...s,
            orders: s.orders.map(o => {
              if (o.id === orderId) {
                const upItems = o.items.map(it => it.id === itemId ? { ...it, status: newStatus } : it);
                return {
                  ...o,
                  items: upItems,
                  status: nextOrderStatus,
                  isDelayed: (nextOrderStatus === 'READY' || nextOrderStatus === 'SERVED') ? false : o.isDelayed
                };
              }
              return o;
            })
          };
        }
      });
      return changed ? nextSessions : prev;
    });
  };

  // 6b. Kitchen Whole Ticket Batch Status Update
  const handleUpdateOrderStatus = (orderId: string, newStatus: 'PENDING' | 'COOKING' | 'READY' | 'SERVED') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          isDelayed: (newStatus === 'READY' || newStatus === 'SERVED') ? false : o.isDelayed,
          items: o.items.map(item => ({ ...item, status: newStatus }))
        };
      }
      return o;
    }));

    // Keep sessions orders in sync
    setSessions(prev => {
      let changed = false;
      const nextSessions = { ...prev };
      Object.keys(nextSessions).forEach(key => {
        const s = nextSessions[key];
        if (s.orders && s.orders.some(o => o.id === orderId)) {
          changed = true;
          nextSessions[key] = {
            ...s,
            orders: s.orders.map(o => {
              if (o.id === orderId) {
                return {
                  ...o,
                  status: newStatus,
                  isDelayed: (newStatus === 'READY' || newStatus === 'SERVED') ? false : o.isDelayed,
                  items: o.items.map(item => ({ ...item, status: newStatus }))
                };
              }
              return o;
            })
          };
        }
      });
      return changed ? nextSessions : prev;
    });

    if (newStatus === 'COOKING') {
      setToToast({
        show: true,
        title: isLao ? '🛎️ ຂັ້ນຕອນ 1: ຮັບອໍເດີສຳເລັດ ➔ ກຳລັງປຸງ' : 'Step 1: Order Accepted ➔ Cooking',
        message: isLao 
          ? `ຄົວໄດ້ກົດຮັບອໍເດີແລ້ວ! ສະຖານະປ່ຽນເປັນ "ກຳລັງປຸງ" ພ້ອມບອກເວລາປຸງແຕ່ງປະມານ` 
          : `Kitchen accepted ticket! Status is now Cooking with estimated time.`,
        type: 'info'
      });
    } else if (newStatus === 'READY') {
      setToToast({
        show: true,
        title: isLao ? '✨ ຂັ້ນຕອນ 2: ປຸງແລ້ວ ➔ ແລ້ວພ້ອມເສີມ!' : 'Step 2: Cooked ➔ Ready to Serve!',
        message: isLao 
          ? `ອໍເດີປຸງສຳເລັດແລ້ວ! ບອກສະຖານະວ່າ "ແລ້ວພ້ອມເສີມ" ຕາມຂັ້ນຕອນ` 
          : `Dishes completed! Status updated to 'Ready to Serve'.`,
        type: 'success'
      });
    }
  };

  // 7. Kitchen Complete Order
  const handleCompleteOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'SERVED',
          isDelayed: false,
          items: o.items.map(i => ({ ...i, status: 'SERVED' }))
        };
      }
      return o;
    }));

    setSessions(prev => {
      let changed = false;
      const nextSessions = { ...prev };
      Object.keys(nextSessions).forEach(key => {
        const s = nextSessions[key];
        if (s.orders && s.orders.some(o => o.id === orderId)) {
          changed = true;
          nextSessions[key] = {
            ...s,
            orders: s.orders.map(o => o.id === orderId ? {
              ...o,
              status: 'SERVED',
              isDelayed: false,
              items: o.items.map(i => ({ ...i, status: 'SERVED' }))
            } : o)
          };
        }
      });
      return changed ? nextSessions : prev;
    });

    setToToast({
      show: true,
      title: isLao ? '🍽️ ຂັ້ນຕອນ 3: ເສີບເຖິງໂຕະຮຽບຮ້ອຍ' : 'Step 3: Served to Table',
      message: isLao ? `ອໍເດີ ${orderId} ຖືກເສີບເຖິງໂຕະຄົບຖ້ວນຮຽບຮ້ອຍແລ້ວ` : `Order ${orderId} marked as completed and served.`,
      type: 'success'
    });
  };

  // 7b. Helper to generate test incoming order for KDS demonstration
  const handleAddTestIncomingOrder = () => {
    const randomTable = tables.find(t => t.status === 'OCCUPIED')?.code || 'T-01';
    const testOrder: Order = {
      id: `ORD-DEMO-${Date.now()}`,
      orderNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      sessionId: `SESS-${randomTable}`,
      tableCode: randomTable,
      orderTime: new Date().toISOString(),
      status: 'PENDING',
      isDelayed: false,
      delayedMinutes: 0,
      items: [
        {
          id: `ITM-${Date.now()}-1`,
          menuItemId: 'ITEM-1',
          nameLao: 'ຊີ້ນງົວລາຍພິເສດ Wagyu Karubi',
          nameEn: 'Wagyu Karubi Beef',
          category: 'beef',
          quantity: 2,
          specialNotes: 'ສະໄລ້ບາງ ສຳລັບປີ້ງ',
          status: 'PENDING',
          prepTimeMinutes: 5,
          priceLAK: 0
        },
        {
          id: `ITM-${Date.now()}-2`,
          menuItemId: 'ITEM-2',
          nameLao: 'ຊີ້ນໝູສາມຊັ້ນໝັກ ຊອດເກົາຫຼີ Gochujang',
          nameEn: 'Marinated Pork Belly Gochujang',
          category: 'meat_pork',
          quantity: 1,
          specialNotes: '',
          status: 'PENDING',
          prepTimeMinutes: 4,
          priceLAK: 0
        },
        {
          id: `ITM-${Date.now()}-3`,
          menuItemId: 'ITEM-3',
          nameLao: 'ຊຸດຜັກສົດລວມ ແລະ ເຫັດເຂັມທອງ',
          nameEn: 'Fresh Veggies & Enoki Mushroom',
          category: 'vegetables',
          quantity: 1,
          specialNotes: '',
          status: 'PENDING',
          prepTimeMinutes: 3,
          priceLAK: 0
        }
      ]
    };

    setOrders(prev => [testOrder, ...prev]);

    // 🔊 Audio alert in Lao voice: "ອໍເດີເຂົ້າແລ້ວ! ໂຕະ..."
    playLaoOrderVoiceAlert(randomTable);

    setToToast({
      show: true,
      title: isLao ? `⚡ ອໍເດີໃໝ່ເຂົ້າມາແລ້ວ! (${randomTable})` : `⚡ New Incoming Order (${randomTable})`,
      message: isLao 
        ? 'ລຳດັບແລກ: ໃຫ້ກົດປຸ່ມ "🛎️ ກົດຮັບອໍເດີ" ເພື່ອເລີ່ມປຸງແຕ່ງ (ມີສຽງເຕືອນ: "ອໍເດີເຂົ້າແລ້ວ")' 
        : 'First step: Click "Accept Order" to start cooking (Lao voice alert played).',
      type: 'info'
    });
  };

  // 8. Trigger Delayed Alert
  const handleTriggerDelayedAlert = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isDelayed: true } : o));
  };

  // 9. Customer Mobile Order Send (Instant Sync to Kitchen KDS)
  const handleSendMobileOrder = (tableCode: string, cartItems: { menuItem: MenuItem; qty: number; note: string }[]) => {
    const table = tables.find(t => t.code === tableCode);
    let targetSessionId = table?.currentSessionId;

    // If table has no session yet, auto-open standard session so order is preserved
    if (!targetSessionId) {
      targetSessionId = `SESS-${Date.now()}`;
      const newSession: TableSession = {
        id: targetSessionId,
        branchId: currentBranchId,
        tableCodes: [tableCode],
        packageTier: 'STANDARD',
        status: 'ACTIVE_EATING',
        guestCount: table?.defaultCapacity || 2,
        guests: [
          { id: `G-${Date.now()}-1`, type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) }
        ],
        startTime: new Date().toISOString(),
        durationMinutes: 90,
        remainingMinutes: 90,
        extraCharges: [],
        orders: [],
      };
      setSessions(prev => ({ ...prev, [targetSessionId!]: newSession }));
      setTables(prev => prev.map(t => t.code === tableCode ? {
        ...t,
        status: 'OCCUPIED',
        currentSessionId: targetSessionId,
        currentGuests: t.defaultCapacity
      } : t));
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      orderNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      sessionId: targetSessionId,
      tableCode,
      orderTime: new Date().toISOString(),
      status: 'PENDING',
      isDelayed: false,
      delayedMinutes: 0,
      items: cartItems.map((c: any, idx: number) => {
        const itemObj = c.menuItem || c.item || {};
        return {
          id: `ITM-${Date.now()}-${idx}`,
          menuItemId: itemObj.id || `ITEM-${idx}`,
          nameLao: itemObj.nameLao || 'ເມນູອາຫານ',
          nameEn: itemObj.nameEn || 'Food Item',
          category: itemObj.category || 'BEEF',
          quantity: c.qty || 1,
          specialNotes: c.note || '',
          status: 'PENDING',
          prepTimeMinutes: itemObj.prepEstMinutes || 5,
          priceLAK: itemObj.priceLAK || 0
        };
      })
    };

    // 1. Immediately prepend to global orders (KDS screen live sync)
    setOrders(prev => [newOrder, ...prev]);

    // 🔊 Audio alert in Lao voice: "ອໍເດີເຂົ້າແລ້ວ! ໂຕະ..."
    playLaoOrderVoiceAlert(tableCode);

    // 2. Append to table session orders (Billing & Customer History live sync)
    if (targetSessionId) {
      setSessions(prev => {
        const sess = prev[targetSessionId!];
        if (!sess) return prev;
        return {
          ...prev,
          [targetSessionId!]: {
            ...sess,
            orders: [newOrder, ...(sess.orders || [])]
          }
        };
      });
    }

    // 4. Real-time Inventory Deduct: Subtract ordered quantities from stock
    setMenuItems(prev => prev.map(m => {
      const match = cartItems.find((c: any) => {
        const itemId = c.menuItem?.id || c.item?.id || c.id;
        return itemId === m.id;
      });
      if (match) {
        const nextStock = Math.max(0, (m.stockQty ?? 0) - (match.qty || 1));
        return {
          ...m,
          stockQty: nextStock,
          isAvailable: nextStock > 0 ? m.isAvailable : false
        };
      }
      return m;
    }));

    // 5. High-visibility Toast with quick link to KDS
    setToToast({
      show: true,
      title: isLao ? '⚡ ໄດ້ຮັບອໍເດີໃໝ່ຈາກໂຕະ!' : '⚡ New QR Order Received!',
      message: isLao 
        ? `ໂຕະ ${tableCode} ສັ່ງ ${cartItems.length} ລາຍການ • ຕັດສະຕັອກ ແລະ ສົ່ງເຂົ້າຈໍຄົວ KDS ແບບ Real-time ແລ້ວ` 
        : `Table ${tableCode} ordered ${cartItems.length} items • Deducted stock & dispatched to KDS.`,
      type: 'success'
    });
  };

  // Stock Management Handlers
  const handleUpdateStock = (itemId: string, newStock: number, logNote?: string, amountAdded?: number) => {
    const item = menuItems.find(m => m.id === itemId);
    const prevStock = item?.stockQty ?? 0;
    const added = amountAdded !== undefined ? amountAdded : (newStock - prevStock);

    // Update item stock
    setMenuItems(prev => prev.map(m => {
      if (m.id === itemId) {
        return {
          ...m,
          stockQty: newStock,
          isAvailable: newStock > 0,
          lastRestockedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
      }
      return m;
    }));

    // Add restock log record
    if (added !== 0) {
      const newLog: StockRestockLog = {
        id: `LOG-${Date.now()}`,
        menuItemId: itemId,
        menuItemNameLao: item?.nameLao || itemId,
        amountAdded: added,
        previousStock: prevStock,
        newStock: newStock,
        timestamp: `${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
        staffName: `${currentUser.fullName} (${currentUser.role})`,
        note: logNote
      };
      setStockLogs(prev => [newLog, ...prev]);
    }
  };

  const handleToggleItemAvailability = (itemId: string, isAvailable: boolean) => {
    setMenuItems(prev => prev.map(m => m.id === itemId ? { ...m, isAvailable } : m));
    const targetItem = menuItems.find(m => m.id === itemId);
    setToToast({
      show: true,
      title: isLao ? 'ປ່ຽນສະຖານະເມນູ' : 'Item Status Changed',
      message: isLao 
        ? `ເມນູ "${targetItem?.nameLao}": ${isAvailable ? 'ເປີດຂາຍປົກກະຕິ' : 'ປິດຂາຍຊົ່ວຄາວ'}`
        : `${targetItem?.nameEn} is now ${isAvailable ? 'Available' : 'Paused'}`,
      type: 'info'
    });
  };

  const handleBatchRestockLow = (amountToAdd: number = 20) => {
    const lowItems = menuItems.filter(m => (m.stockQty ?? 0) <= (m.minStockAlert ?? 15));
    if (lowItems.length === 0) return;

    setMenuItems(prev => prev.map(m => {
      if ((m.stockQty ?? 0) <= (m.minStockAlert ?? 15)) {
        const nextStock = (m.stockQty ?? 0) + amountToAdd;
        return {
          ...m,
          stockQty: nextStock,
          isAvailable: true,
          lastRestockedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
      }
      return m;
    }));

    // Add batch logs
    const nowTimestamp = `${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    const newLogs: StockRestockLog[] = lowItems.map((item, idx) => ({
      id: `LOG-BATCH-${Date.now()}-${idx}`,
      menuItemId: item.id,
      menuItemNameLao: item.nameLao,
      amountAdded: amountToAdd,
      previousStock: item.stockQty ?? 0,
      newStock: (item.stockQty ?? 0) + amountToAdd,
      timestamp: nowTimestamp,
      staffName: `${currentUser.fullName} (${currentUser.role})`,
      note: isLao ? `ເຕີມດ່ວນພ້ອມກັນ +${amountToAdd} ຈານ` : `Batch restocked +${amountToAdd}`
    }));

    setStockLogs(prev => [...newLogs, ...prev]);

    setToToast({
      show: true,
      title: isLao ? 'ເຕີມສະຕັອກລາຍການໃກ້ໝົດສຳເລັດ' : 'Batch Restocked Low Items',
      message: isLao 
        ? `ເຕີມສະຕັອກ +${amountToAdd} ຈານ ໃຫ້ທັງ ${lowItems.length} ລາຍການທີ່ໃກ້ໝົດຮຽບຮ້ອຍແລ້ວ!` 
        : `Replenished +${amountToAdd} units for all ${lowItems.length} low-stock items!`,
      type: 'success'
    });
  };

  // 10. Cashier Checkout Success (Records into Daily Overview Dashboard)
  const handleCheckoutSuccess = (tableCode: string, bill: BillReceipt) => {
    // 1. Save to Daily Dashboard Ledger
    setPaidBills(prev => [bill, ...prev]);

    // 2. Clear and release table
    setTables(prev => prev.map(t => {
      if (t.code === tableCode || t.mergedWithTableCode === tableCode || t.masterTableCode === tableCode) {
        return {
          ...t,
          status: 'VACANT',
          currentSessionId: undefined,
          currentGuests: 0,
          isMerged: false,
          mergedWithTableCode: undefined,
          masterTableCode: undefined,
          isMergedChild: false,
          extraChairs: 0
        };
      }
      return t;
    }));

    // 3. Clear session
    const targetSessionId = tables.find(t => t.code === tableCode)?.currentSessionId;
    if (targetSessionId) {
      setSessions(prev => {
        const copy = { ...prev };
        if (copy[targetSessionId]) {
          copy[targetSessionId] = {
            ...copy[targetSessionId],
            status: 'BILLED'
          };
        }
        return copy;
      });
    }

    setToToast({
      show: true,
      title: isLao ? 'ຊຳລະເງິນສຳເລັດ • ບັນທຶກລົງແດັສບອດ' : 'Payment Saved to Dashboard',
      message: isLao 
        ? `ບິນເລກທີ ${bill.billNumber} (ໂຕະ ${tableCode}) ຍອດຊຳລະ ₭${bill.netTotalLAK.toLocaleString()} ຖືກບັນທຶກເຂົ້າພາບລວມແດັສບອດປະຈຳວັນແລ້ວ!` 
        : `Bill ${bill.billNumber} for Table ${tableCode} (₭${bill.netTotalLAK.toLocaleString()}) recorded into daily dashboard!`,
      type: 'success'
    });
  };

  // 11. Seat a Reservation
  const handleSeatReservation = (reservationId: string, tableCode: string) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;

    handleOpenTable(tableCode, res.packageTier, { full: res.guestCount, half: 0, free: 0 }, `From Booking: ${res.customerName} (${res.customerPhone})`);
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status: 'SEATED' } : r));
    setActiveTab('DASHBOARD');
  };

  // 12. Adjust Table Remaining Minutes (Timer Controls & Expired Trigger)
  const handleAdjustRemainingMinutes = (tableCode: string, remainingMin: number) => {
    const table = tables.find(t => t.code === tableCode);
    if (!table || !table.currentSessionId) return;
    const sessId = table.currentSessionId;
    setSessions(prev => {
      const sess = prev[sessId];
      if (!sess) return prev;
      return {
        ...prev,
        [sessId]: {
          ...sess,
          remainingMinutes: remainingMin
        }
      };
    });
    if (remainingMin <= 0) {
      setToToast({
        show: true,
        title: isLao ? `🚨 ໂຕະ ${tableCode} ເບິດເວລາແລ້ວ!` : `🚨 Table ${tableCode} Time is Expired!`,
        message: isLao 
          ? `ສະຖານະປ່ຽນເປັນໄອຄອນສີແດງ "ເບິດເວລາແລ້ວ". ກົດທີ່ໄອຄອນເພື່ອທຳການຊຳລະເງິນໃຫ້ລູກຄ້າທັນທີ` 
          : `Status changed to Red icon "Time Expired". Click the icon to process customer payment immediately.`,
        type: 'warning'
      });
    }
  };

  // If not authenticated, render LoginPortal (Matching Image 1)
  if (!isAuthenticated) {
    return (
      <LoginPortal
        onLoginSuccess={handleLoginSuccess}
        language={language}
        onToggleLanguage={() => setLanguage(l => l === 'la' ? 'en' : 'la')}
      />
    );
  }

  // Filtered tables if searching
  const matchingTable = searchQuery.trim() 
    ? tables.find(t => t.code.toLowerCase() === searchQuery.trim().toLowerCase()) 
    : null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Toast Notification Banner (Exact replica of Image 2 top-right notification!) */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {toast.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToToast(prev => ({ ...prev, show: false }))}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main App Layout: Sidebar + Main Content (Matching Image 2) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ======================================================== */}
        {/* LEFT SIDEBAR NAVIGATION (Matching Image 2) */}
        {/* ======================================================== */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0a1128] dark:bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          
          <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
            
            {/* Brand Logo & System Name (Modern J BBQ Mascot Logo) */}
            <div className="px-2">
              <JBBQLogo size="md" isLao={isLao} />
            </div>

            {/* Section 1: CORE MODULES */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
                {isLao ? 'ລະບົບຫຼັກ (CORE MODULES)' : 'CORE MODULES'}
              </p>
              <nav className="space-y-1">
                
                {/* 1. Executive Operations Dashboard */}
                <button
                  onClick={() => {
                    setActiveTab('DASHBOARD');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === 'DASHBOARD'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{isLao ? 'ພາບລວມ (Dashboard)' : 'Dashboard'}</span>
                </button>

                {/* 2. Floor Plan & Live Tables */}
                <button
                  onClick={() => {
                    setActiveTab('FLOOR_PLAN');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === 'FLOOR_PLAN'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{isLao ? 'ຜັງໂຕະສົດ (Floor Plan)' : 'Floor Plan & Tables'}</span>
                </button>

                {/* 3. Kitchen Display System (KDS) */}
                <button
                  onClick={() => {
                    setActiveTab('KDS');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer relative ${
                    activeTab === 'KDS'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ChefHat className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{isLao ? 'ຈໍໃນຄົວ (Kitchen KDS)' : 'Kitchen Display (KDS)'}</span>
                  {delayedOrdersCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-bold text-[10px] animate-pulse">
                      {delayedOrdersCount}
                    </span>
                  )}
                </button>

                {/* 4. Cashier Billing & LAO QR */}
                <button
                  onClick={() => {
                    setActiveTab('BILLING');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === 'BILLING'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Receipt className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{isLao ? 'ຄິດໄລ່ເງິນ & LAO QR' : 'Billing & Invoices'}</span>
                </button>

                {/* 5. Customer Mobile QR Ordering Simulator */}
                <button
                  onClick={() => {
                    setActiveTab('MOBILE_SIMULATOR');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === 'MOBILE_SIMULATOR'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{isLao ? 'ມືຖືລູກຄ້າ (Mobile QR)' : 'Customer Mobile QR'}</span>
                </button>

                {/* 6. Table Reservations */}
                <button
                  onClick={() => {
                    setActiveTab('RESERVATIONS');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === 'RESERVATIONS'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <CalendarClock className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{isLao ? 'ການຈອງໂຕະ (Bookings)' : 'Reservations'}</span>
                </button>

                {/* 7. Menu Stock & Inventory Management */}
                <button
                  onClick={() => {
                    setActiveTab('INVENTORY');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer relative ${
                    activeTab === 'INVENTORY'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Boxes className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{isLao ? 'ສະຕັອກເມນູ (Inventory)' : 'Menu Stock & Inventory'}</span>
                  {lowStockAlertCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
                      {lowStockAlertCount}
                    </span>
                  )}
                </button>

                {/* 8. Staff & Roles (RBAC) */}
                <button
                  onClick={() => {
                    setActiveTab('AUTH_MGMT');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    activeTab === 'AUTH_MGMT'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{isLao ? 'ພະນັກງານ & ສິດທິ' : 'Staff & Roles'}</span>
                </button>
              </nav>
            </div>

          </div>

          {/* User Profile & Sign Out (Matching Image 2 bottom-left!) */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-500/30 shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser.fullName}
                </p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold inline-block truncate max-w-full">
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLao ? 'ອອກຈາກລະບົບ (Sign Out)' : 'Sign Out Session'}</span>
            </button>
          </div>

        </aside>

        {/* Backdrop for Mobile Drawer */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ======================================================== */}
        {/* RIGHT MAIN CONTENT AREA & TOPBAR */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          
          {/* Top Bar Header (Matching Image 2) */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs backdrop-blur-md">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
              
              {/* Left: Mobile hamburger & Search bar */}
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Global Search Input */}
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isLao ? 'ຄົ້ນຫາໂຕະ, ອໍເດີ, ລູກຄ້າ...' : 'Search table no., order ID, phone...'}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  {matchingTable && (
                    <div 
                      onClick={() => {
                        setCashierSelectedTable(matchingTable.code);
                        setActiveTab('FLOOR_PLAN');
                        setSearchQuery('');
                      }}
                      className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2.5 z-30 flex items-center justify-between cursor-pointer hover:bg-amber-50 dark:hover:bg-slate-700/50"
                    >
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        ໂຕະ {matchingTable.code} ({matchingTable.zone})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                        {matchingTable.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status indicator pill */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>API v1.0 (Live)</span>
                </div>
              </div>

              {/* Right: Actions, Branch Switcher, Language & Quick Open Table */}
              <div className="flex items-center gap-2">
                
                {/* Branch Switcher Dropdown */}
                <div className="relative hidden md:block">
                  <select
                    value={currentBranchId}
                    onChange={(e) => {
                      setCurrentBranchId(e.target.value);
                      setToToast({
                        show: true,
                        title: isLao ? 'ປ່ຽນສາຂາສຳເລັດ' : 'Branch Switched',
                        message: isLao ? `ປ່ຽນໄປຍັງ: ${branches.find(b => b.id === e.target.value)?.nameLao}` : `Switched to ${branches.find(b => b.id === e.target.value)?.nameEn}`,
                        type: 'info'
                      });
                    }}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-3 py-2 pr-7 font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {isLao ? b.nameLao.split(':')[0] : b.nameEn.split(':')[0]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>

                {/* Language Toggle */}
                <button
                  onClick={() => setLanguage(l => l === 'la' ? 'en' : 'la')}
                  className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-500 transition flex items-center gap-1.5 cursor-pointer"
                  title="Switch Language"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">{isLao ? 'LA' : 'EN'}</span>
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition cursor-pointer"
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Share System Link Button */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-2.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-400 transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  title={isLao ? 'ເອັກພອດ / ແຊຣ໌ລິ້ງລະບົບໃຫ້ໝູ່ກວດສອບ' : 'Export & Share System Link'}
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden md:inline">{isLao ? 'ແຊຣ໌ລິ້ງ' : 'Share'}</span>
                </button>

                {/* Table QR Stands Button */}
                <button
                  onClick={() => setIsGlobalQrModalOpen(true)}
                  className="px-2.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-500 transition flex items-center gap-1.5 cursor-pointer"
                  title={isLao ? 'ປ້າຍ QR Code ສັ່ງອາຫານປະຈຳໂຕະ' : 'Table QR Code Stands'}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{isLao ? 'ປ້າຍ QR ໂຕະ' : 'Table QR'}</span>
                </button>

                {/* + Quick Open Table Button */}
                <button
                  onClick={() => setIsQuickOpenModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-900 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-slate-950/20 dark:shadow-amber-500/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{isLao ? 'ເປີດໂຕະໃໝ່' : 'Quick Open Table'}</span>
                  <span className="sm:hidden">{isLao ? 'ເປີດໂຕະ' : 'Open'}</span>
                </button>

              </div>

            </div>
          </header>

          {/* Main Workspace Body */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
            
            {/* View 1: Executive Operations Dashboard (Image 2) */}
            {activeTab === 'DASHBOARD' && (
              <ExecutiveDashboard
                tables={tables}
                sessions={sessions}
                orders={orders}
                paidBills={paidBills}
                language={language}
                onOpenQuickModal={() => setIsQuickOpenModalOpen(true)}
                onSelectTableForBilling={(tableCode) => {
                  setCashierSelectedTable(tableCode);
                  setActiveTab('BILLING');
                }}
                onNavigateToFloorPlan={() => setActiveTab('FLOOR_PLAN')}
                onNavigateToKds={() => setActiveTab('KDS')}
                onAddExtraChairs={(code) => handleAddExtraChairs(code, 1)}
                onAddMidMealGuest={(code, type, count) => handleAddMidMealGuest(code, type, count)}
                onSendCareAlert={(code) => handleSendCareAlert(code)}
                onResetToCleanShift={handleResetToCleanShift}
                onLoadDemoBusyShift={handleLoadDemoBusyShift}
              />
            )}

            {/* View 2: Floor Plan & Live Tables */}
            {activeTab === 'FLOOR_PLAN' && (
              <FloorPlanDashboard
                tables={tables}
                sessions={sessions}
                orders={orders}
                language={language}
                onOpenTable={handleOpenTable}
                onAddExtraChairs={handleAddExtraChairs}
                onAddMidMealGuest={handleAddMidMealGuest}
                onMergeTables={handleMergeTables}
                onSelectTableForBilling={(tableCode) => {
                  setCashierSelectedTable(tableCode);
                  setActiveTab('BILLING');
                }}
                onNavigateToBilling={(tableCode) => {
                  setCashierSelectedTable(tableCode);
                  setActiveTab('BILLING');
                }}
                onNavigateToKds={() => setActiveTab('KDS')}
                onNavigateToMobileSimulator={(tableCode) => {
                  if (tableCode) setMobileSimulatorSelectedTable(tableCode);
                  setActiveTab('MOBILE_SIMULATOR');
                }}
                onResetToCleanShift={handleResetToCleanShift}
                onLoadDemoBusyShift={handleLoadDemoBusyShift}
                onAdjustRemainingMinutes={handleAdjustRemainingMinutes}
              />
            )}

            {/* View 3: Kitchen Display System (KDS) */}
            {activeTab === 'KDS' && (
              <KitchenDisplaySystem
                orders={orders}
                language={language}
                onUpdateItemStatus={handleUpdateItemStatus}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onCompleteOrder={handleCompleteOrder}
                onTriggerDelayedAlert={handleTriggerDelayedAlert}
                onNavigateToMobileSimulator={() => setActiveTab('MOBILE_SIMULATOR')}
                onNavigateToFloorPlan={() => setActiveTab('FLOOR_PLAN')}
                onAddTestOrder={handleAddTestIncomingOrder}
              />
            )}

            {/* View 4: Cashier Billing Screen */}
            {activeTab === 'BILLING' && (
              <CashierBillingScreen
                tables={tables}
                sessions={sessions}
                currentBranch={currentBranch}
                language={language}
                selectedTableCode={cashierSelectedTable}
                onTableSelect={(code) => setCashierSelectedTable(code)}
                onCheckoutSuccess={handleCheckoutSuccess}
                onNavigateToDashboard={() => setActiveTab('DASHBOARD')}
              />
            )}

            {/* View 5: Customer Mobile Simulator */}
            {activeTab === 'MOBILE_SIMULATOR' && (
              <CustomerMobileSimulator
                tables={tables}
                sessions={sessions}
                language={language}
                initialTableCode={mobileSimulatorSelectedTable}
                menuItems={menuItems}
                onSendMobileOrder={handleSendMobileOrder}
                onNavigateToKds={() => setActiveTab('KDS')}
                onNavigateToBilling={(tableCode) => {
                  setCashierSelectedTable(tableCode);
                  setActiveTab('BILLING');
                }}
              />
            )}

            {/* View 6: Reservations */}
            {activeTab === 'RESERVATIONS' && (
              <ReservationsManager
                reservations={reservations}
                tables={tables}
                language={language}
                onAddReservation={(newRes) => setReservations(prev => [{ ...newRes, id: `RES-${Date.now()}` }, ...prev])}
                onSeatReservation={handleSeatReservation}
              />
            )}

            {/* View 7: Menu Stock & Inventory Management */}
            {activeTab === 'INVENTORY' && (
              <MenuStockManager
                menuItems={menuItems}
                stockLogs={stockLogs}
                language={language}
                onUpdateStock={handleUpdateStock}
                onToggleAvailability={handleToggleItemAvailability}
                onBatchRestockLow={handleBatchRestockLow}
              />
            )}

            {/* View 7: Staff & Roles (RBAC) */}
            {activeTab === 'AUTH_MGMT' && (
              <AuthUserManagement
                users={users}
                branches={branches}
                currentUser={currentUser}
                language={language}
                onSwitchUser={(user) => {
                  setCurrentUser(user);
                  setToToast({
                    show: true,
                    title: isLao ? 'ປ່ຽນບັນຊີສຳເລັດ' : 'User Switched',
                    message: isLao ? `ປ່ຽນໄປຍັງ: ${user.fullName} (${user.role})` : `Switched active profile to ${user.fullName}`,
                    type: 'success'
                  });
                }}
                onCreateUser={(newUser) => setUsers(prev => [{ ...newUser, id: `USR-${Date.now()}`, createdAt: new Date().toISOString() }, ...prev])}
                onMoveUserBranch={(userId, newBranchId) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, branchId: newBranchId } : u))}
                onChangeUserRole={(userId, newRole) => setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))}
                onUpdateUserAvatar={(userId, newAvatar) => {
                  setUsers(prev => prev.map(u => u.id === userId ? { ...u, avatar: newAvatar } : u));
                  setCurrentUser(prev => prev.id === userId ? { ...prev, avatar: newAvatar } : prev);
                  setToToast({
                    show: true,
                    title: isLao ? 'ອັບເດດຮູບໂປຣໄຟລ໌ສຳເລັດ' : 'Profile Photo Updated',
                    message: isLao ? 'ປ່ຽນຮູບໂປຣໄຟລ໌ຂອງທ່ານຮຽບຮ້ອຍແລ້ວ' : 'Profile photo updated successfully',
                    type: 'success'
                  });
                }}
              />
            )}

          </main>

        </div>

      </div>

      {/* Global Quick Open Table Modal */}
      <QuickOpenTableModal
        isOpen={isQuickOpenModalOpen}
        onClose={() => setIsQuickOpenModalOpen(false)}
        tables={tables}
        language={language}
        onConfirmOpen={handleQuickOpenTable}
      />

      {/* Global Table QR Stand Modal */}
      <TableQrModal
        isOpen={isGlobalQrModalOpen}
        onClose={() => setIsGlobalQrModalOpen(false)}
        tables={tables}
        language={language}
        onOpenMobileSimulator={() => {
          setActiveTab('MOBILE_SIMULATOR');
        }}
      />

      {/* Share System Link Modal */}
      <ShareSystemModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        language={language}
      />

    </div>
  );
}

export default App;
