/**
 * Buffet POS Enterprise System & Architecture Specification Types
 * Types, Enums & Interfaces (Lao / English)
 */

export type Language = 'la' | 'en';

export type SystemMode = 'POS_OPERATIONAL' | 'SPEC_DOCS';
export type AppMode = 'pos' | 'architecture_spec';

export type PosViewTab = 
  | 'DASHBOARD'
  | 'FLOOR_PLAN'
  | 'KDS'
  | 'BILLING'
  | 'MOBILE_SIMULATOR'
  | 'RESERVATIONS'
  | 'INVENTORY'
  | 'AUTH_MGMT';

export type PosModule = 
  | 'floor_plan'
  | 'kds'
  | 'cashier'
  | 'mobile_sim'
  | 'users'
  | 'reservations'
  | 'inventory';

export type SpecSection = 
  | 'SECTION_1_ARCHITECTURE'
  | 'SECTION_2_WIREFRAMES'
  | 'SECTION_3_BUSINESS_LOGIC'
  | 'SECTION_4_DATABASE_DDL'
  | 'SECTION_5_DBEAVER_GUIDE';

export type TableStatus = 
  | 'VACANT'          // ຫວ່າງ (Available)
  | 'OCCUPIED'        // ມີແຂກນັ່ງ (Eating / Ordering)
  | 'RESERVED'        // ຈອງແລ້ວ (Pre-booked)
  | 'NEAR_LIMIT'      // ໃກ້ໝົດເວລາ (< 15 mins remaining)
  | 'DELAYED_ALERT';  // ແຈ້ງເຕືອນອາຫານຊັກຊ້າ (Care Alert > 10m)

export type BuffetPackageTier = 'STANDARD' | 'PREMIUM' | 'VIP';

export interface BuffetPackage {
  id: BuffetPackageTier;
  nameLao: string;
  nameEn: string;
  priceLAK: number;
  durationMinutes: number;
  descriptionLao: string;
  descriptionEn: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  features: string[];
  imageUrl?: string;
  highlightDish?: string;
}

export type GuestType = 'FULL' | 'HALF' | 'FREE';

export interface SessionGuest {
  id: string;
  type: GuestType;
  discountPercent: number; // 0 for FULL, 50 for HALF, 100 for FREE
  priceCharged: number;
  addedAt: string; // ISO or time string
  note?: string;
}

export interface MenuItem {
  id: string;
  nameLao: string;
  nameEn: string;
  category: 'meat_pork' | 'beef' | 'seafood' | 'vegetables' | 'soup_condiment' | 'drinks_dessert';
  tierRequired: BuffetPackageTier;
  prepEstMinutes: number;
  image: string;
  isAvailable: boolean;
  calories?: number;
  priceLAK: number; // Lao Kip price shown to customers
  unit?: string; // e.g. ຈານ, ຊຸດ, ຖ້ວຍ, ຈອກ
  descriptionLao?: string;
  descriptionEn?: string;
  // Inventory & Stock Tracking
  stockQty?: number; // Current remaining stock
  minStockAlert?: number; // Low stock alert threshold
  maxStock?: number; // Maximum batch capacity
  stockUnit?: string; // Unit e.g. ຈານ, ຊຸດ, ຖ້ວຍ, ກິໂລ
  lastRestockedAt?: string; // Timestamp of last restock
}

export interface StockRestockLog {
  id: string;
  menuItemId: string;
  menuItemNameLao: string;
  amountAdded: number;
  previousStock: number;
  newStock: number;
  timestamp: string;
  staffName: string;
  note?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  nameLao: string;
  nameEn: string;
  category: string;
  quantity: number;
  status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED';
  prepTimeMinutes: number;
  priceLAK?: number; // Price per item
  specialNotes?: string;
  specialNote?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  sessionId: string;
  tableCode: string;
  orderTime: string; // ISO
  status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED';
  items: OrderItem[];
  isDelayed: boolean;
  delayedMinutes: number;
  careAlertSent?: boolean;
}

export interface RestaurantTable {
  id: string;
  code: string;
  zone: 'Indoor Zone A' | 'Indoor Zone B' | 'VIP Terrace' | 'Outdoor Garden';
  defaultCapacity: number;
  extraChairs: number;
  maxExtraChairs: number;
  status: TableStatus;
  currentSessionId?: string;
  currentGuests?: number;
  isMerged?: boolean;
  mergedWithTableCode?: string;
  mergedWith?: string[];
  isMergedChild?: boolean;
  masterTableCode?: string;
}

export interface TableSession {
  id: string;
  tableCode?: string;
  tableCodes?: string[];
  branchId: string;
  packageTier: BuffetPackageTier;
  startTime: string;
  plannedEndTime?: string;
  durationMinutes: number;
  remainingMinutes?: number;
  guestCount?: number;
  guests: SessionGuest[];
  orders: Order[];
  status: 'ACTIVE' | 'MERGED' | 'COMPLETED' | 'ACTIVE_EATING';
  extraCharges?: { name: string; amountLAK: number }[];
  masterSessionId?: string;
  mergedSessionIds?: string[];
  specialNotes?: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  tableCode: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  packageTier: BuffetPackageTier;
  date: string;
  timeSlot: string;
  status: 'CONFIRMED' | 'SEATED' | 'CANCELLED';
  depositAmountLAK: number;
  specialNotes?: string;
}

export interface Branch {
  id: string;
  code: string;
  nameLao: string;
  nameEn: string;
  addressLao: string;
  addressEn: string;
  phone: string;
  managerName: string;
  tableCount: number;
  currency: 'LAK';
  vatRate: number;
  serviceChargeRate: number;
  pricingOverrideMultiplier: number;
  syncStatus: 'SYNCED' | 'SYNCING' | 'OFFLINE_READY';
}

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'BRANCH_MANAGER' 
  | 'CASHIER' 
  | 'KITCHEN_CHEF' 
  | 'SERVICE_WAITER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface Promotion {
  id: string;
  code: string;
  titleLao: string;
  titleEn: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  validFrom: string;
  validTo: string;
  minSpendLAK: number;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
}

export interface BillReceipt {
  id: string;
  billNumber: string;
  branchId: string;
  branchNameLao: string;
  tableCodes: string[];
  sessionId: string;
  cashierName: string;
  createdAt: string;
  packageTier: BuffetPackageTier;
  guestsBreakdown: {
    fullPriceCount: number;
    fullPriceUnit: number;
    halfPriceCount: number;
    halfPriceUnit: number;
    freeCount: number;
    freeUnit: number;
  };
  extraCharges: {
    name: string;
    amountLAK: number;
  }[];
  subtotalLAK: number;
  discountLAK: number;
  promoCode?: string;
  vatTaxLAK: number;
  serviceChargeLAK: number;
  netTotalLAK: number;
  paymentMethod: 'LAO_QR_BCEL' | 'LDB_TRUST' | 'CASH' | 'CREDIT_CARD';
  paymentStatus: 'PAID' | 'PENDING';
  laoQrString?: string;
  bcelRef?: string;
}
