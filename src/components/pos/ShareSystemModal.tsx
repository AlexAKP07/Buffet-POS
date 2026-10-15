import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Smartphone, 
  Laptop, 
  Users, 
  ShieldCheck, 
  Download,
  Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';
import { Language } from '../../types';

interface ShareSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const ShareSystemModal: React.FC<ShareSystemModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const isLao = language === 'la';
  const [copied, setCopied] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  // Prefer Shared App URL for external testing, fallback to current origin
  const sharedUrl = 'https://ais-pre-uzau6obxa23cxfshmtidun-405142995488.asia-southeast1.run.app';
  const appUrl = (typeof window !== 'undefined' && window.location.origin.includes('asia-southeast1.run.app'))
    ? sharedUrl
    : (typeof window !== 'undefined' ? window.location.origin : sharedUrl);

  useEffect(() => {
    if (isOpen && appUrl) {
      QRCode.toDataURL(appUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `j-buffet-pos-system-share-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-amber-500/30 dark:border-amber-500/20 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {isLao ? 'ສົ່ງລິ້ງໃຫ້ໝູ່ກວດສອບ' : 'Shareable Link'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online Live
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight mt-0.5">
                {isLao ? 'ເອັກພອດລິ້ງລະບົບໃຫ້ໝູ່ກວດສອບ (Share POS Link)' : 'Export System Link for Team Testing'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* URL Card with 1-Click Copy */}
        <div className="my-5 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>{isLao ? 'ລິ້ງລະບົບ (Shared App URL):' : 'System Public URL:'}</span>
            <span className="text-[11px] text-slate-400">{isLao ? 'ໝູ່ສາມາດກົດເຂົ້າໄດ້ທຸກອຸປະກອນ' : 'Accessible from any browser'}</span>
          </label>
          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-1 bg-transparent border-none text-xs font-mono text-slate-800 dark:text-slate-200 px-2 focus:outline-none select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isLao ? 'ຄັດລອກແລ້ວ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isLao ? 'ຄັດລອກລິ້ງ' : 'Copy Link'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code & Mobile Testing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 items-center">
          <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="System Share QR Code"
                className="w-40 h-40 object-contain rounded-xl"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400">
                <QrCode className="w-8 h-8 animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={handleDownloadQr}
              className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-amber-500 flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isLao ? 'ດາວໂຫຼດຮູບ QR Code' : 'Save QR Image'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>{isLao ? 'ສະແກນທົດສອບເທິງມືຖື' : 'Scan to Test on Mobile'}</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isLao 
                ? 'ໃຫ້ໝູ່ເອົາມືຖືມາສະແກນ QR Code ນີ້ ເພື່ອກວດສອບລະບົບ POS ເປີດໂຕະ, ລະບົບສັ່ງອາຫານ Mobile Simulator, ແລະ ລະບົບຄົວ KDS ໄດ້ທັນທີ.'
                : 'Your teammates can scan this QR code with their mobile cameras to inspect tables, POS ordering, and kitchen screens.'}
            </p>
            <div className="pt-1">
              <a
                href={appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                <span>{isLao ? 'ເປີດໃນແທັບໃໝ່ (Open in New Tab)' : 'Open in New Tab'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Roles & Features Guide for Testing */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{isLao ? 'ຂໍ້ມູນການທົດສອບສຳລັບໝູ່ຂອງທ່ານ (Testing Guide):' : 'Teammate Test Guidelines:'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-blue-500" />
                <span>{isLao ? '1. ຈັດການໂຕະ & ບຸບເຟ່' : '1. POS Floor Plan'}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isLao ? 'ເປີດໂຕະເລືອກ 3 ແພັກເກັດ (Standard, Premium, VIP) ພ້ອມຮູບພາບ' : 'Open tables with 3 buffet packages with real photos'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                <span>{isLao ? '2. ຈຳລອງລູກຄ້າສັ່ງອາຫານ' : '2. Mobile Ordering'}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isLao ? 'ເມນູ Mobile Simulator ສັ່ງອາຫານສົ່ງເຂົ້າຈໍຄົວ KDS ແທ້' : 'Test customer self-ordering sent to live KDS'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span>{isLao ? '3. ຊຳລະເງິນ & ພລຸ 0ms' : '3. Cashier Billing'}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isLao ? 'ກົດຊຳລະເງິນ BCEL OnePay, ພລຸສະຫຼອງທັນທີ 0ms ແລະ ບັນທຶກແດັສບອດ' : '0ms instant checkout with confetti fireworks'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isLao ? '4. ສະຕັອກເມນູ & ຈັດການສິດ' : '4. Inventory & Roles'}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isLao ? 'ກວດເບິ່ງສະຕັອກຄົງເຫຼືອ, ເຕີມສະຕັອກ ແລະ ບັນທຶກປະຫວັດ' : 'Check real-time stock, restock logs and user roles'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            {isLao ? 'ປິດໜ້າຕ່າງ (Close)' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
