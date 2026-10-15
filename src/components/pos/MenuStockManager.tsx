import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  PackageCheck, 
  PackagePlus, 
  Layers, 
  History, 
  X, 
  Save, 
  ChefHat, 
  Sparkles, 
  RotateCcw, 
  Download, 
  Printer, 
  Filter, 
  ArrowUpRight,
  Flame,
  Check
} from 'lucide-react';
import { MenuItem, Language, StockRestockLog, BuffetPackageTier } from '../../types';

interface MenuStockManagerProps {
  menuItems: MenuItem[];
  stockLogs: StockRestockLog[];
  language: Language;
  onUpdateStock: (itemId: string, newStock: number, logNote?: string, amountAdded?: number) => void;
  onToggleAvailability: (itemId: string, isAvailable: boolean) => void;
  onBatchRestockLow: (amountToAdd: number) => void;
}

export const MenuStockManager: React.FC<MenuStockManagerProps> = ({
  menuItems,
  stockLogs,
  language,
  onUpdateStock,
  onToggleAvailability,
  onBatchRestockLow,
}) => {
  const isLao = language === 'la';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'LOW' | 'OUT'>('ALL');
  const [activeViewTab, setActiveViewTab] = useState<'ITEMS' | 'HISTORY'>('ITEMS');

  // Modal State for Custom Restock
  const [restockModalItem, setRestockModalItem] = useState<MenuItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(20);
  const [restockNote, setRestockNote] = useState<string>('');
  const [customStockValue, setCustomStockValue] = useState<string>('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Stock Analytics Calculations
  const totalItems = menuItems.length;
  const outOfStockItems = menuItems.filter(m => (m.stockQty ?? 0) <= 0);
  const lowStockItems = menuItems.filter(m => {
    const qty = m.stockQty ?? 0;
    const minAlert = m.minStockAlert ?? 15;
    return qty > 0 && qty <= minAlert;
  });
  const healthyStockItems = menuItems.filter(m => {
    const qty = m.stockQty ?? 0;
    const minAlert = m.minStockAlert ?? 15;
    return qty > minAlert;
  });
  const totalStockUnits = menuItems.reduce((sum, m) => sum + (m.stockQty ?? 0), 0);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Category match
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      
      // Search match
      const matchSearch = searchQuery.trim() === '' || 
        item.nameLao.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase().trim());

      // Status match
      const qty = item.stockQty ?? 0;
      const minAlert = item.minStockAlert ?? 15;
      let matchStatus = true;
      if (statusFilter === 'OUT') matchStatus = qty <= 0;
      else if (statusFilter === 'LOW') matchStatus = qty > 0 && qty <= minAlert;
      else if (statusFilter === 'HEALTHY') matchStatus = qty > minAlert;

      return matchCat && matchSearch && matchStatus;
    });
  }, [menuItems, selectedCategory, searchQuery, statusFilter]);

  // Handle Quick Add (+5, +10, +20, +50)
  const handleQuickAdd = (item: MenuItem, amount: number) => {
    const current = item.stockQty ?? 0;
    const nextStock = current + amount;
    onUpdateStock(
      item.id, 
      nextStock, 
      isLao ? `ເຕີມສະຕັອກດ່ວນ +${amount} ${item.stockUnit || 'ຈານ'}` : `Quick restock +${amount}`,
      amount
    );
    showToast(isLao 
      ? `✅ ເພີ່ມສະຕັອກ ${item.nameLao} +${amount} ສຳເລັດ! (ຍອດໃໝ່: ${nextStock})` 
      : `Restocked ${item.nameEn} +${amount} (New stock: ${nextStock})`
    );
  };

  // Handle Direct Increment / Decrement
  const handleStepAdjust = (item: MenuItem, delta: number) => {
    const current = item.stockQty ?? 0;
    const nextStock = Math.max(0, current + delta);
    onUpdateStock(
      item.id, 
      nextStock, 
      isLao ? `ປັບສະຕັອກ ${delta > 0 ? '+' : ''}${delta} ${item.stockUnit || 'ຈານ'}` : `Adjusted stock ${delta}`,
      delta
    );
  };

  // Handle Custom Restock Submit
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;

    let targetStock: number;
    let addedCount = restockAmount;

    if (customStockValue.trim() !== '') {
      targetStock = Math.max(0, parseInt(customStockValue, 10) || 0);
      addedCount = targetStock - (restockModalItem.stockQty ?? 0);
    } else {
      targetStock = (restockModalItem.stockQty ?? 0) + restockAmount;
    }

    onUpdateStock(
      restockModalItem.id,
      targetStock,
      restockNote.trim() || (isLao ? `ເຕີມສະຕັອກປົກກະຕິ (+${addedCount})` : `Restocked +${addedCount}`),
      addedCount
    );

    showToast(isLao 
      ? `✅ ບັນທຶກສະຕັອກ ${restockModalItem.nameLao} ເປັນ ${targetStock} ຮຽບຮ້ອຍແລ້ວ!` 
      : `Updated ${restockModalItem.nameEn} stock to ${targetStock}!`
    );

    setRestockModalItem(null);
    setRestockNote('');
    setCustomStockValue('');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-200 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* TOP HEADER & ANALYTICS BAR */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
        
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Boxes className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {isLao ? 'ລະບົບຄຸ້ມຄອງສະຕັອກເມນູ & ວັດຖຸດິບ' : 'Menu Inventory & Stock Management'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[11px] font-extrabold border border-emerald-500/30">
                  Real-time
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isLao 
                  ? 'ກວດເບິ່ງສະຕັອກຄົງເຫຼືອ, ເພີ່ມສະຕັອກດ່ວນ, ແຈ້ງເຕືອນເມນູໃກ້ໝົດ ແລະ ເຊື່ອມຕໍ່ກັບລະບົບສັ່ງ QR' 
                  : 'Monitor remaining stock, quick replenishment, low stock alerts & synced with QR orders'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {lowStockItems.length > 0 && (
              <button
                onClick={() => onBatchRestockLow(20)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer"
                title={isLao ? 'ເຕີມສະຕັອກ +20 ຈານ ໃຫ້ທຸກລາຍການທີ່ໃກ້ໝົດ' : 'Restock +20 for all low items'}
              >
                <PackagePlus className="w-4 h-4" />
                <span>{isLao ? `⚡ ເຕີມລາຍການໃກ້ໝົດທັງໝົດ (${lowStockItems.length})` : `Restock Low Items (${lowStockItems.length})`}</span>
              </button>
            )}

            {/* View Tab Switcher: Items vs History */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveViewTab('ITEMS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeViewTab === 'ITEMS'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isLao ? 'ລາຍການສະຕັອກ' : 'Stock List'}</span>
              </button>
              <button
                onClick={() => setActiveViewTab('HISTORY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeViewTab === 'HISTORY'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>{isLao ? `ປະຫວັດເຕີມ (${stockLogs.length})` : `Logs (${stockLogs.length})`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPI SUMMARY STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
          
          {/* 1. Total Menu Items */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-750">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isLao ? 'ເມນູທັງໝົດ' : 'Total Items'}
              </span>
              <Boxes className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalItems}</span>
              <span className="text-xs text-slate-500 font-semibold">{isLao ? 'ລາຍການ' : 'items'}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {isLao ? `ຍອດສະຕັອກລວມ: ${totalStockUnits.toLocaleString()} ຈານ` : `Total Units: ${totalStockUnits.toLocaleString()}`}
            </div>
          </div>

          {/* 2. Healthy / In Stock */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {isLao ? 'ສະຕັອກປົກກະຕິ' : 'In Stock'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{healthyStockItems.length}</span>
              <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-semibold">{isLao ? 'ເມນູ' : 'items'}</span>
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {isLao ? 'ພ້ອມເສີບບໍ່ຂາດສາຍ' : 'Adequate supply'}
            </div>
          </div>

          {/* 3. Low Stock Alert */}
          <div className={`p-4 rounded-2xl border transition ${
            lowStockItems.length > 0 
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 shadow-sm shadow-amber-500/10' 
              : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-750'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {isLao ? 'ສະຕັອກໃກ້ໝົດ' : 'Low Stock Alert'}
              </span>
              <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{lowStockItems.length}</span>
              <span className="text-xs text-amber-600/80 dark:text-amber-400/80 font-semibold">{isLao ? 'ເມນູ' : 'items'}</span>
            </div>
            <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              {isLao ? 'ຄວນເຕີມເພີ່ມດ່ວນ' : 'Needs replenishment'}
            </div>
          </div>

          {/* 4. Out of Stock */}
          <div className={`p-4 rounded-2xl border transition ${
            outOfStockItems.length > 0 
              ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 shadow-sm shadow-red-500/10' 
              : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-750'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 dark:text-red-400">
                {isLao ? 'ໝົດສະຕັອກ (0 ຈານ)' : 'Out of Stock'}
              </span>
              <XCircle className={`w-4 h-4 ${outOfStockItems.length > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-red-600 dark:text-red-400">{outOfStockItems.length}</span>
              <span className="text-xs text-red-600/80 dark:text-red-400/80 font-semibold">{isLao ? 'ເມນູ' : 'items'}</span>
            </div>
            <div className="mt-1 text-[11px] text-red-700 dark:text-red-400 font-medium">
              {isLao ? 'ປິດຂາຍຊົ່ວຄາວໃນມືຖື' : 'Auto-paused in mobile ordering'}
            </div>
          </div>

        </div>

      </div>

      {/* VIEW 1: ITEMS STOCK MANAGEMENT */}
      {activeViewTab === 'ITEMS' && (
        <div className="space-y-4">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isLao ? 'ຄົ້ນຫາເມນູ... (ເຊັ່ນ: ວາກິວ, ສັນຄໍ, ແຊວມອນ, M-01)' : 'Search menu item by name or code...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isLao ? 'ທັງໝົດ' : 'All'} ({totalItems})
                </button>
                <button
                  onClick={() => setStatusFilter('LOW')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'LOW'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isLao ? 'ໃກ້ໝົດ' : 'Low'}</span>
                  <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full">
                    {lowStockItems.length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('OUT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'OUT'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isLao ? 'ໝົດແລ້ວ' : 'Out'}</span>
                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-full">
                    {outOfStockItems.length}
                  </span>
                </button>
                <button
                  onClick={() => setStatusFilter('HEALTHY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    statusFilter === 'HEALTHY'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {isLao ? 'ປົກກະຕິ' : 'Normal'} ({healthyStockItems.length})
                </button>
              </div>

            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isLao ? cat.nameLao : cat.nameEn}
                </button>
              ))}
            </div>

          </div>

          {/* MENU ITEMS STOCK GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const currentStock = item.stockQty ?? 0;
              const minAlert = item.minStockAlert ?? 15;
              const maxCapacity = item.maxStock ?? 50;
              const percentage = Math.min(100, Math.round((currentStock / maxCapacity) * 100));
              const isOut = currentStock <= 0;
              const isLow = !isOut && currentStock <= minAlert;
              const unit = item.stockUnit || item.unit || (isLao ? 'ຈານ' : 'plates');

              return (
                <div 
                  key={item.id}
                  className={`bg-white dark:bg-slate-800 rounded-3xl p-5 border transition flex flex-col justify-between shadow-sm relative overflow-hidden ${
                    isOut 
                      ? 'border-red-300 dark:border-red-800/80 bg-red-50/20 dark:bg-red-950/10'
                      : isLow
                      ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Status Ribbon / Top Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={item.image} 
                        alt={item.nameEn}
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {item.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.tierRequired === 'VIP' 
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              : item.tierRequired === 'PREMIUM'
                              ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                          }`}>
                            {item.tierRequired}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1 leading-snug">
                          {isLao ? item.nameLao : item.nameEn}
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {item.priceLAK.toLocaleString()} ₭ • {unit}
                        </p>
                      </div>
                    </div>

                    {/* Stock Alert Status Pill */}
                    <div>
                      {isOut ? (
                        <span className="px-2 py-1 rounded-xl text-[10px] font-black bg-red-600 text-white flex items-center gap-1 shadow-sm animate-pulse">
                          <XCircle className="w-3 h-3" />
                          <span>{isLao ? 'ໝົດສະຕັອກ' : 'Out of Stock'}</span>
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-1 rounded-xl text-[10px] font-black bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{isLao ? 'ໃກ້ໝົດ' : 'Low Stock'}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isLao ? 'ພ້ອມເສີບ' : 'In Stock'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* REMAINING STOCK DISPLAY & PROGRESS GAUGE */}
                  <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-750 my-2 space-y-2">
                    
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {isLao ? 'ສະຕັອກຄົງເຫຼືອ:' : 'Remaining Stock:'}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-xl font-black ${
                          isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {currentStock}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          / {maxCapacity} {unit}
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOut 
                            ? 'bg-red-500' 
                            : isLow 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${Math.max(4, percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>{isLao ? `ເຕືອນເມື່ອ < ${minAlert}` : `Alert at < ${minAlert}`}</span>
                      <span>{percentage}% {isLao ? 'ຄົງເຫຼືອ' : 'level'}</span>
                    </div>

                  </div>

                  {/* QUICK RESTOCK BUTTONS (+5, +10, +20, +50) */}
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>{isLao ? 'ເພີ່ມສະຕັອກດ່ວນ:' : 'Quick Add Stock:'}</span>
                      {item.lastRestockedAt && (
                        <span className="text-[10px] text-slate-400">
                          {isLao ? `ເຕີມຫຼ້າສຸດ: ${item.lastRestockedAt}` : `Last: ${item.lastRestockedAt}`}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => handleQuickAdd(item, 5)}
                        className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition active:scale-95 cursor-pointer shadow-sm text-center"
                        title={isLao ? 'ເພີ່ມ +5 ຈານ' : 'Add +5'}
                      >
                        +5
                      </button>
                      <button
                        onClick={() => handleQuickAdd(item, 10)}
                        className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition active:scale-95 cursor-pointer shadow-sm text-center"
                        title={isLao ? 'ເພີ່ມ +10 ຈານ' : 'Add +10'}
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleQuickAdd(item, 20)}
                        className="py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-400 border border-amber-500/40 text-xs font-black transition active:scale-95 cursor-pointer shadow-sm text-center"
                        title={isLao ? 'ເພີ່ມ +20 ຈານ' : 'Add +20'}
                      >
                        +20
                      </button>
                      <button
                        onClick={() => handleQuickAdd(item, 50)}
                        className="py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 text-xs font-black transition active:scale-95 cursor-pointer shadow-sm text-center"
                        title={isLao ? 'ເພີ່ມ +50 ຈານ' : 'Add +50'}
                      >
                        +50
                      </button>
                    </div>

                    {/* Stepper + Custom Restock Button */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {/* Step Minus */}
                      <button
                        onClick={() => handleStepAdjust(item, -1)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold transition active:scale-95 cursor-pointer shrink-0"
                        title={isLao ? 'ຫຼຸດ 1' : 'Decrease 1'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      {/* Step Plus */}
                      <button
                        onClick={() => handleStepAdjust(item, 1)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold transition active:scale-95 cursor-pointer shrink-0"
                        title={isLao ? 'ເພີ່ມ 1' : 'Increase 1'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {/* Custom Restock Modal Trigger */}
                      <button
                        onClick={() => {
                          setRestockModalItem(item);
                          setRestockAmount(20);
                          setCustomStockValue('');
                          setRestockNote('');
                        }}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>{isLao ? 'ເຕີມສະຕັອກລະອຽດ' : 'Custom Restock'}</span>
                      </button>

                      {/* Availability Toggle */}
                      <button
                        onClick={() => onToggleAvailability(item.id, !item.isAvailable)}
                        className={`px-2 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer shrink-0 ${
                          item.isAvailable 
                            ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25' 
                            : 'bg-red-500/15 text-red-500 hover:bg-red-500/25'
                        }`}
                        title={item.isAvailable ? (isLao ? 'ກົດເພື່ອປິດເມນູ' : 'Toggle off') : (isLao ? 'ກົດເພື່ອເປີດເມນູ' : 'Toggle on')}
                      >
                        {item.isAvailable ? (isLao ? 'ເປີດຂາຍ' : 'Active') : (isLao ? 'ປິດຂາຍ' : 'Off')}
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
              <Boxes className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white">
                {isLao ? 'ບໍ່ພົບເມນູຕາມເງື່ອນໄຂທີ່ຄົ້ນຫາ' : 'No menu items match criteria'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isLao ? 'ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເລືອກແທັບ "ທັງໝົດ" ເພື່ອເບິ່ງລາຍການສະຕັອກທັງໝົດ' : 'Try adjusting search keywords or selecting "All" tab'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setStatusFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                {isLao ? 'ລ້າງຕົວກັ່ນຕອງ' : 'Reset Filters'}
              </button>
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: RESTOCK LOGS / AUDIT HISTORY */}
      {activeViewTab === 'HISTORY' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-500" />
                <span>{isLao ? 'ປະຫວັດການເຕີມ ແລະ ປັບປຸງສະຕັອກ' : 'Restock & Inventory Audit Logs'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isLao ? 'ບັນທຶກທຸກຄັ້ງທີ່ມີການເພີ່ມສະຕັອກ, ຜູ້ຮັບຜິດຊອບ ແລະ ເວລາ' : 'Detailed restock transaction records'}
              </p>
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {stockLogs.length} {isLao ? 'ລາຍການບັນທຶກ' : 'Entries'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">{isLao ? 'ວັນທີ & ເວລາ' : 'Timestamp'}</th>
                  <th className="py-3 px-4">{isLao ? 'ລາຍການເມນູ' : 'Menu Item'}</th>
                  <th className="py-3 px-4">{isLao ? 'ຈຳນວນທີ່ເພີ່ມ' : 'Quantity Added'}</th>
                  <th className="py-3 px-4">{isLao ? 'ສະຕັອກກ່ອນ → ໃໝ່' : 'Prev → New'}</th>
                  <th className="py-3 px-4">{isLao ? 'ພະນັກງານ' : 'Staff Member'}</th>
                  <th className="py-3 px-4 rounded-r-xl">{isLao ? 'ໝາຍເຫດ / ແຫຼ່ງທີ່ມາ' : 'Note / Source'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-semibold">
                {stockLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/50 transition">
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {log.menuItemNameLao}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                        log.amountAdded > 0 
                          ? 'bg-emerald-500/20 text-emerald-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {log.amountAdded > 0 ? `+${log.amountAdded}` : log.amountAdded}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">{log.previousStock}</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className="font-black text-amber-500">{log.newStock}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {log.staffName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic text-[11px]">
                      {log.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stockLogs.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-xs">
              {isLao ? 'ຍັງບໍ່ມີປະຫວັດການເຕີມສະຕັອກ' : 'No restock logs yet'}
            </div>
          )}
        </div>
      )}

      {/* CUSTOM RESTOCK MODAL */}
      {restockModalItem && (
        <div 
          onClick={() => setRestockModalItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl p-6 space-y-5 animate-slideUp"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={restockModalItem.image} 
                  alt={restockModalItem.nameEn}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/40" 
                />
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isLao ? 'ເຕີມສະຕັອກເມນູ' : 'Restock Menu Item'}
                  </h3>
                  <p className="text-xs font-bold text-amber-400">
                    {isLao ? restockModalItem.nameLao : restockModalItem.nameEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestockModalItem(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              
              {/* Current Status Box */}
              <div className="p-3 bg-slate-850 rounded-2xl border border-slate-750 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{isLao ? 'ສະຕັອກປັດຈຸບັນ' : 'Current Stock'}</span>
                  <div className="text-lg font-black text-white">
                    {restockModalItem.stockQty ?? 0} {restockModalItem.stockUnit || (isLao ? 'ຈານ' : 'plates')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{isLao ? 'ສະຖານະ' : 'Status'}</span>
                  <div className={`text-xs font-black ${
                    (restockModalItem.stockQty ?? 0) <= 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {(restockModalItem.stockQty ?? 0) <= 0 
                      ? (isLao ? '🚨 ໝົດແລ້ວ' : 'Out of Stock') 
                      : (isLao ? '🟢 ພ້ອມບໍລິການ' : 'Active')}
                  </div>
                </div>
              </div>

              {/* Option 1: Add by Quantity (+Amount) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  {isLao ? 'ຈຳນວນທີ່ຕ້ອງການເພີ່ມ (+):' : 'Amount to Add (+):'}
                </label>
                
                {/* Stepper */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRestockAmount(Math.max(1, restockAmount - 5))}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-black text-base active:scale-95"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="flex-1 py-2 rounded-xl text-center font-mono font-black text-lg bg-slate-950 border border-slate-700 text-amber-400 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setRestockAmount(restockAmount + 5)}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-black text-base active:scale-95"
                  >
                    +5
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[10, 20, 30, 50].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRestockAmount(val)}
                      className={`py-1.5 rounded-xl text-xs font-black transition ${
                        restockAmount === val 
                          ? 'bg-amber-500 text-slate-950' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Set Exact Total Stock Override */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  {isLao ? 'ຫຼື ລະບຸຍອດສະຕັອກໃໝ່ທັງໝົດໂດຍກົງ (ເລືອກໃສ່):' : 'Or set exact total stock value:'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={customStockValue}
                  onChange={(e) => setCustomStockValue(e.target.value)}
                  placeholder={isLao ? `ຕົວຢ່າງ: 50 (${restockModalItem.stockUnit || 'ຈານ'})` : 'e.g. 50'}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Restock Note / Vendor / Source */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isLao ? 'ໝາຍເຫດ / ແຫຼ່ງທີ່ມາສິນຄ້າ:' : 'Restock Note / Supplier:'}
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder={isLao ? 'ເຊັ່ນ: ຮັບຈາກຟາມ CP, ຕຽມຮັບຊ່ວງແລງ, ຕັດແຕ່ງສົດ' : 'e.g. Received from fresh vendor'}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  {isLao ? 'ຍົກເລີກ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLao ? 'ຢືນຢັນການເຕີມສະຕັອກ' : 'Confirm Restock'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
