import React, { useState } from 'react';
import { 
  X, Utensils, Armchair, 
  CheckCircle2, Check, Crown,
  ArrowLeft, XCircle
} from 'lucide-react';
import { RestaurantTable, BuffetPackageTier, Language } from '../../types';
import { BUFFET_PACKAGES } from '../../data/mockData';

interface QuickOpenTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: RestaurantTable[];
  language: Language;
  onConfirmOpen: (
    tableCode: string, 
    pkgTier: BuffetPackageTier, 
    guestCounts: { full: number; half: number; free: number }, 
    extraChairs: number,
    notes?: string
  ) => void;
}

export const QuickOpenTableModal: React.FC<QuickOpenTableModalProps> = ({
  isOpen,
  onClose,
  tables,
  language,
  onConfirmOpen,
}) => {
  const isLao = language === 'la';
  const vacantTables = tables.filter(t => t.status === 'VACANT');

  const [selectedTableCode, setSelectedTableCode] = useState<string>(vacantTables[0]?.code || 'A-01');
  const [selectedPackage, setSelectedPackage] = useState<BuffetPackageTier>('STANDARD');
  const [fullCount, setFullCount] = useState<number>(2);
  const [halfCount, setHalfCount] = useState<number>(0);
  const [freeCount, setFreeCount] = useState<number>(0);
  const [extraChairs, setExtraChairs] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const currentPkg = BUFFET_PACKAGES[selectedPackage];
  const totalGuests = fullCount + halfCount + freeCount;
  const estimatedTotalLAK = (fullCount * currentPkg.priceLAK) + (halfCount * currentPkg.priceLAK * 0.5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalGuests <= 0) return;
    onConfirmOpen(
      selectedTableCode,
      selectedPackage,
      { full: fullCount, half: halfCount, free: freeCount },
      extraChairs,
      notes
    );
    onClose();
  };

    const handleCancel = () => {
      setSelectedTableCode(vacantTables[0]?.code || 'A-01');
      setSelectedPackage('STANDARD');
      setFullCount(2);
      setHalfCount(0);
      setFreeCount(0);
      setExtraChairs(0);
      setNotes('');
      // no onClose() here, so the modal stays open
    };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-lg max-h-[92dvh] flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isLao ? 'ເປີດໂຕະໃໝ່ (Open New Buffet Table)' : 'Open New Buffet Table'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isLao ? 'ເລືອກໂຕະ, ຊຸດບຸບເຟ່ ແລະ ຈຳນວນແຂກ' : 'Select vacant table, buffet package, and guest counts.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

          {/* Scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

            {/* 1. Select Table */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {isLao ? '1. ເລືອກໂຕະຫວ່າງ (Available Tables)' : '1. Select Vacant Table'}
              </label>
              {vacantTables.length === 0 ? (
                <p className="text-xs text-red-500 font-bold p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
                  {isLao ? 'ໂຕະເຕັມທັງໝົດ! ກະລຸນາເຊັກບິນເພື່ອປ່ອຍໂຕະ.' : 'All tables are currently occupied! Please clear a table first.'}
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {vacantTables.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTableCode(t.code)}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition border ${
                        selectedTableCode === t.code
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm shadow-amber-500/30 scale-105'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      {t.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Select Package */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isLao ? '2. ເລືອກແພັກເກດບຸບເຟ່ (Buffet Tier)' : '2. Select Buffet Tier'}
                </label>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  {isLao ? '✨ ຮູບພາບເມນູຕົວຢ່າງ' : '✨ Menu preview'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {(['STANDARD', 'PREMIUM', 'VIP'] as BuffetPackageTier[]).map(tier => {
                  const pkg = BUFFET_PACKAGES[tier];
                  const isSelected = selectedPackage === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedPackage(tier)}
                      className={`group relative p-2 sm:p-2.5 rounded-2xl border text-left transition flex flex-col justify-between overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 ring-2 ring-amber-500/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${pkg.badgeBg} ${pkg.badgeText}`}>
                            {tier}
                          </span>
                          {isSelected ? (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            tier === 'VIP' && <Crown className="w-3 h-3 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-tight line-clamp-1">
                          {pkg.nameEn.split(' ')[0]}
                        </p>
                      </div>

                      {/* Food image under each package */}
                      <div className="relative mt-2 rounded-xl overflow-hidden aspect-[4/3] bg-slate-900/10 border border-slate-200/80 dark:border-slate-700/80">
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.nameLao}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1">
                          <span className="text-[9px] font-bold text-white line-clamp-1 drop-shadow">
                            {pkg.highlightDish || (tier === 'STANDARD' ? 'ໝູ & ໄກ່' : tier === 'PREMIUM' ? 'ງົວ & ຊີຟູດ' : 'ວາກິວ & ແຊວມອນ')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                          ₭{pkg.priceLAK.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {pkg.durationMinutes} {isLao ? 'ນາທີ' : 'mins'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Tier Banner */}
              {selectedPackage && BUFFET_PACKAGES[selectedPackage] && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2.5 items-center">
                  <img
                    src={BUFFET_PACKAGES[selectedPackage].imageUrl}
                    alt="Package preview"
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-amber-500/30"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {BUFFET_PACKAGES[selectedPackage].nameLao}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {BUFFET_PACKAGES[selectedPackage].descriptionLao}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Guest Pricing Matrix */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {isLao ? '3. ຈັດການປະເພດແຂກ (Guest Breakdown)' : '3. Guest Breakdown & Dynamic Pricing'}
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {/* Full Price */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    {isLao ? 'ລາຄາເຕັມ (100%)' : 'Full (100%)'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setFullCount(Math.max(1, fullCount - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm">{fullCount}</span>
                    <button
                      type="button"
                      onClick={() => setFullCount(fullCount + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Half Price */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">
                    {isLao ? 'ເຄິ່ງລາຄາ (50%)' : 'Half (50%)'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setHalfCount(Math.max(0, halfCount - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm">{halfCount}</span>
                    <button
                      type="button"
                      onClick={() => setHalfCount(halfCount + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Free VIP */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">
                    {isLao ? 'ຟຣີ (0% VIP)' : 'Free (VIP)'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setFreeCount(Math.max(0, freeCount - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm">{freeCount}</span>
                    <button
                      type="button"
                      onClick={() => setFreeCount(freeCount + 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold flex items-center justify-center hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Extra Chairs */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Armchair className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {isLao ? 'ເພີ່ມຕັ່ງພິເສດ (Extra Chairs)' : 'Extra Chairs (Dynamic Seating)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {[0, 1, 2].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setExtraChairs(num)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold border transition ${
                      extraChairs === num
                        ? 'bg-amber-500 text-slate-950 border-amber-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

          </div>
          {/* End scrollable area */}

          {/* Pinned footer */}
          <div className="shrink-0 p-4 sm:p-6 pt-3 space-y-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">

            {/* Summary Banner */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {isLao ? 'ລວມແຂກທັງໝົດ:' : 'Total Guests:'} {totalGuests} {isLao ? 'ທ່ານ' : 'pax'}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentPkg.durationMinutes}m {isLao ? 'ເວລາຮັບປະທານ' : 'dining timer starts immediately'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                  {isLao ? 'ປະເມີນຍອດເບື້ອງຕົ້ນ' : 'Estimated Base'}
                </span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                  ₭{estimatedTotalLAK.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Confirm */}
            <button
              type="submit"
              disabled={vacantTables.length === 0 || totalGuests <= 0}
              className="w-full py-3 bg-slate-950 dark:bg-amber-500 hover:bg-slate-900 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-950/20 dark:shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLao ? `ຢືນຢັນເປີດໂຕະ ${selectedTableCode}` : `Confirm & Open Table ${selectedTableCode}`}</span>
            </button>

            {/* Back & Cancel */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isLao ? 'ກັບຄືນ' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="py-2.5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>{isLao ? 'ຍົກເລີກໂອໍເດີ' : 'Cancel Order'}</span>
              </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};