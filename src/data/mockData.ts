import { BuffetPackage, Branch, MenuItem, RestaurantTable, TableSession, Reservation, User, Promotion, Order, BillReceipt, StockRestockLog } from '../types';
import standardTierImg from '../assets/images/buffet_standard_tier_1791537508342.jpg';
import premiumTierImg from '../assets/images/buffet_premium_tier_1791537527421.jpg';
import vipTierImg from '../assets/images/buffet_vip_tier_1791537553893.jpg';

export const BUFFET_PACKAGES: Record<string, BuffetPackage> = {
  STANDARD: {
    id: 'STANDARD',
    nameLao: 'ຊຸດມາດຕະຖານ (Standard Pork & Chicken)',
    nameEn: 'Standard Buffet Package',
    priceLAK: 149000,
    durationMinutes: 90,
    imageUrl: standardTierImg,
    highlightDish: 'ຊີ້ນໝູສະໄລ້, ໄກ່ໝັກ, ຊຸບໃສ/ໝ່າລ່າ',
    descriptionLao: 'ຊີ້ນໝູສະໄລ້, ໄກ່ໝັກຊອດພິເສດ, ຜັກສົດ, ຊຸບ, ຂອງຫວານ ແລະ ນ້ຳດື່ມບໍ່ອັ້ນ',
    descriptionEn: 'Sliced pork collar & belly, marinated chicken, organic greens, soup & soft drinks',
    color: 'emerald',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    features: ['Sliced Pork Collar & Belly', 'Marinated Chicken', 'Organic Greens & Mushrooms', 'Clear & Mala Soup', 'Free Ice Cream & Soda']
  },
  PREMIUM: {
    id: 'PREMIUM',
    nameLao: 'ຊຸດພຣີມຽມ ຊີ້ນງົວ & ອາຫານທະເລ (Premium Beef & Seafood)',
    nameEn: 'Premium Beef & Seafood Package',
    priceLAK: 219000,
    durationMinutes: 105,
    imageUrl: premiumTierImg,
    highlightDish: 'ຊີ້ນງົວອົດສະຕຣາລີ, ກຸ້ງແມ່ນ້ຳ, ປາມຶກ, ຄຸໂຣບູຕະ',
    descriptionLao: 'ຊີ້ນງົວອົດສະຕຣາລີ, ກຸ້ງແມ່ນ້ຳສົດ, ປາມຶກກ້ວຍ, ຊີ້ນໝູຄຸໂຣບູຕະ ແລະ ເມນູມາດຕະຖານທັງໝົດ',
    descriptionEn: 'Australian Chuck Eye beef, fresh river prawns, squid, Kurobuta pork + Standard items',
    color: 'blue',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-700 dark:text-blue-300',
    features: ['Australian Marbled Beef', 'Fresh River Prawns', 'Fresh Squid & New Zealand Mussels', 'Kurobuta Pork', 'Free Mocktails & Cheese Dip']
  },
  VIP: {
    id: 'VIP',
    nameLao: 'ຊຸດວີໄອພີ ວາກິວ & ປາແຊວມອນ (VIP Wagyu & Salmon Feast)',
    nameEn: 'VIP Wagyu & Salmon Feast',
    priceLAK: 329000,
    durationMinutes: 120,
    imageUrl: vipTierImg,
    highlightDish: 'ວາກິວ A4/A5, ຊາຊິມິແຊວມອນ, ຫອຍເຊວ, ລິ້ນງົວ',
    descriptionLao: 'ຊີ້ນງົວວາກິວ A4/A5, ຊາຊິມິແຊວມອນນອກແວ, ຫອຍເຊວຮອກໄກໂດ, ຊີ້ນງົວລິ້ນ ແລະ ເຄື່ອງດື່ມພຣີມຽມ',
    descriptionEn: 'Japanese Wagyu MB7+, Norwegian Salmon Sashimi, Hokkaido Scallops, Beef Tongue & Premium Craft Drinks',
    color: 'amber',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-700 dark:text-amber-300',
    features: ['Miyazaki Wagyu Striploin', 'Norwegian Salmon Sashimi (Unlimited)', 'Hokkaido Scallops', 'Premium Grilled Beef Tongue', 'VIP Private Dipping Bar & Desserts']
  }
};

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'BR-VTE-01',
    code: 'VTE-HQ',
    nameLao: 'ສາຂາ 1: ນະຄອນຫຼວງ ວຽງຈັນ (ສຳນັກງານໃຫຍ່ ຈັນທະບູລີ)',
    nameEn: 'Branch 1: Vientiane Flagship (Chanthabouly)',
    addressLao: 'ຖະໜົນ ສາມແສນໄທ, ບ້ານ ຊຽງເຢິນ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ',
    addressEn: 'Samsenthai Rd, Xiengyeun Village, Chanthabouly Dist, Vientiane Capital',
    phone: '+856 20 5551 2345',
    managerName: 'ທ່ານ ສົມສັກ ວົງວິໄລ (Somsak V.)',
    tableCount: 24,
    currency: 'LAK',
    vatRate: 0.07,
    serviceChargeRate: 0.05,
    pricingOverrideMultiplier: 1.0,
    syncStatus: 'SYNCED'
  },
  {
    id: 'BR-LPB-02',
    code: 'LPB-02',
    nameLao: 'ສາຂາ 2: ຫຼວງພະບາງ ມໍລະດົກໂລກ (ຖະໜົນຄົນຍ່າງ)',
    nameEn: 'Branch 2: Luang Prabang Heritage (Night Market)',
    addressLao: 'ຖະໜົນ ສີສະຫວ່າງວົງ, ບ້ານ ປ່າຂາມ, ນະຄອນ ຫຼວງພະບາງ',
    addressEn: 'Sisavangvong Rd, Pakham Village, Luang Prabang City',
    phone: '+856 20 5566 7890',
    managerName: 'ທ່ານ ນາງ ມາລີ ພົມມະຈັນ (Maly P.)',
    tableCount: 16,
    currency: 'LAK',
    vatRate: 0.07,
    serviceChargeRate: 0.05,
    pricingOverrideMultiplier: 1.05,
    syncStatus: 'SYNCED'
  },
  {
    id: 'BR-PKS-03',
    code: 'PKS-03',
    nameLao: 'ສາຂາ 3: ປາກເຊ ແຄມຂອງ (ຈຳປາສັກ)',
    nameEn: 'Branch 3: Pakse Riverside (Champasak)',
    addressLao: 'ຖະໜົນ ແຄມຂອງ 11, ເມືອງ ປາກເຊ, ແຂວງ ຈຳປາສັກ',
    addressEn: 'Riverside 11 Rd, Pakse City, Champasak Province',
    phone: '+856 20 5588 9911',
    managerName: 'ທ່ານ ຄຳຫຼ້າ ໄຊຍະສານ (Khamla S.)',
    tableCount: 18,
    currency: 'LAK',
    vatRate: 0.07,
    serviceChargeRate: 0.05,
    pricingOverrideMultiplier: 0.98,
    syncStatus: 'SYNCED'
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'USR-001',
    username: 'admin.souk',
    fullName: 'ທ ສຸກພະຈັນ ຈັນທະປະເສີດ',
    email: 'mrsoukphac@gmail.com',
    phone: '+856 20 5555 8899',
    role: 'SUPER_ADMIN',
    branchId: 'BR-VTE-01',
    avatar: '/src/assets/images/soukphachan_profile_1791170877776.jpg',
    isActive: true,
    createdAt: '2025-01-10T08:00:00Z',
    lastLogin: '2026-08-19T00:15:00Z'
  }
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  // Pork & Meat
  {
    id: 'M-01',
    nameLao: 'ສັນຄໍໝູສະໄລ້ ບາງພິເສດ (Pork Collar)',
    nameEn: 'Thinly Sliced Pork Collar',
    category: 'meat_pork',
    tierRequired: 'STANDARD',
    priceLAK: 45000,
    unit: 'ຈານ',
    descriptionLao: 'ສັນຄໍໝູອ່ອນສະໄລ້ບາງໆ ນຸ້ມລະລາຍໃນປາກ ເໝາະສຳລັບປິ້ງຍ່າງ',
    descriptionEn: 'Tender thinly sliced pork collar, meltingly tender for grilling',
    prepEstMinutes: 4,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 220,
    stockQty: 48,
    minStockAlert: 15,
    maxStock: 60,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 10:30'
  },
  {
    id: 'M-02',
    nameLao: 'ສາມຊັ້ນໝູສະໄລ້ ໝັກນ້ຳມັນງາ (Pork Belly)',
    nameEn: 'Marinated Pork Belly Slices',
    category: 'meat_pork',
    tierRequired: 'STANDARD',
    priceLAK: 49000,
    unit: 'ຈານ',
    descriptionLao: 'ສາມຊັ້ນຕິດມັນກຳລັງດີ ໝັກນ້ຳມັນງາຫອມໆ ສູດສະເພາະ',
    descriptionEn: 'Pork belly slices infused with roasted sesame aromatic sauce',
    prepEstMinutes: 4,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 290,
    stockQty: 35,
    minStockAlert: 15,
    maxStock: 50,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 11:00'
  },
  {
    id: 'M-03',
    nameLao: 'ສັນນອກໝູຄຸໂຣບູຕະ (Kurobuta Pork)',
    nameEn: 'Premium Kurobuta Pork Loin',
    category: 'meat_pork',
    tierRequired: 'PREMIUM',
    priceLAK: 69000,
    unit: 'ຈານ',
    descriptionLao: 'ໝູດຳຄຸໂຣບູຕະສາຍພັນຍີ່ປຸ່ນ ຊີ້ນນຸ້ມຊຸ່ມສ່ຳ ບໍ່ແຫ້ງກະດ້າງ',
    descriptionEn: 'Japanese breed Kurobuta pork loin, extremely juicy and tender',
    prepEstMinutes: 5,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 210,
    stockQty: 18,
    minStockAlert: 10,
    maxStock: 35,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 09:45'
  },
  // Beef
  {
    id: 'M-04',
    nameLao: 'ຊີ້ນງົວອົດສະຕຣາລີ ມາດຕະຖານ (AUS Beef Slice)',
    nameEn: 'Australian Grain-Fed Beef Slices',
    category: 'beef',
    tierRequired: 'PREMIUM',
    priceLAK: 89000,
    unit: 'ຈານ',
    descriptionLao: 'ຊີ້ນງົວອອສເຕຣເລຍ ຂຸນດ້ວຍທັນຍາພືດ 120 ວັນ ຫອມຫວານກິ່ນຊີ້ນງົວແທ້',
    descriptionEn: 'Australian 120-day grain fed beef, rich flavor and tenderness',
    prepEstMinutes: 5,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 240,
    stockQty: 12,
    minStockAlert: 15,
    maxStock: 40,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 08:30'
  },
  {
    id: 'M-05',
    nameLao: 'ຊີ້ນງົວວາກິວ ລາຍຫີນອ່ອນ A5 (Wagyu MB7+)',
    nameEn: 'Miyazaki Wagyu Marbled Cut A5',
    category: 'beef',
    tierRequired: 'VIP',
    priceLAK: 159000,
    unit: 'ຈານ',
    descriptionLao: 'ວາກິວແທ້ລາຍຫີນອ່ອນລະດັບພຣີມຽມ ມັນແຊກສວຍງາມ ນຸ້ມລະລາຍທັນທີ',
    descriptionEn: 'Authentic A5 marbled wagyu, luxurious buttery texture',
    prepEstMinutes: 6,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 320,
    stockQty: 6,
    minStockAlert: 10,
    maxStock: 25,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 11:15'
  },
  {
    id: 'M-06',
    nameLao: 'ລິ້ນງົວພຣີມຽມ ສະໄລ້ບາງພ້ອມໝາກນາວ (Beef Tongue)',
    nameEn: 'Premium Sliced Beef Tongue',
    category: 'beef',
    tierRequired: 'VIP',
    priceLAK: 95000,
    unit: 'ຈານ',
    descriptionLao: 'ລິ້ນງົວຄັດພິເສດ ກອບກອບນຸ້ມ ຍ່າງພໍສຸກບີບໝາກນາວແຊບສຸດຍອດ',
    descriptionEn: 'Thinly sliced tender beef tongue, delicious with fresh lemon',
    prepEstMinutes: 6,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&auto=format&fit=crop&q=80',
    isAvailable: false,
    calories: 190,
    stockQty: 0,
    minStockAlert: 8,
    maxStock: 20,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ວານ 18:00'
  },
  // Seafood
  {
    id: 'M-07',
    nameLao: 'ກຸ້ງແມ່ນ້ຳສົດ ໂຕໃຫຍ່ (Giant River Prawns)',
    nameEn: 'Fresh Giant River Prawns',
    category: 'seafood',
    tierRequired: 'PREMIUM',
    priceLAK: 89000,
    unit: 'ຈານ (3 ໂຕ)',
    descriptionLao: 'ກຸ້ງແມ່ນ້ຳໂຕໃຫຍ່ ສົດໆ ຊີ້ນແໜ້ນ ຫົວມີມັນກຸ້ງເຍິ້ມໆ',
    descriptionEn: 'Large river prawns, firm sweet meat and creamy head butter',
    prepEstMinutes: 7,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 140,
    stockQty: 24,
    minStockAlert: 12,
    maxStock: 45,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 10:00'
  },
  {
    id: 'M-08',
    nameLao: 'ຊາຊິມິແຊວມອນ ນອກແວສົດ (Salmon Sashimi)',
    nameEn: 'Norwegian Salmon Sashimi Platter',
    category: 'seafood',
    tierRequired: 'VIP',
    priceLAK: 129000,
    unit: 'ຈານ',
    descriptionLao: 'ແຊວມອນສົດສົ່ງກົງຈາກນອກແວ ຊີ້ນສົດຫວານ ພ້ອມວາຊາບິ ແລະ ໂຊຢຸ',
    descriptionEn: 'Fresh air-flown Norwegian salmon sashimi with wasabi and shoyu',
    prepEstMinutes: 5,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 180,
    stockQty: 8,
    minStockAlert: 12,
    maxStock: 30,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 11:30'
  },
  {
    id: 'M-09',
    nameLao: 'ຫອຍເຊວຮອກໄກໂດ ສົດ (Hokkaido Scallops)',
    nameEn: 'Fresh Hokkaido Scallops',
    category: 'seafood',
    tierRequired: 'VIP',
    priceLAK: 139000,
    unit: 'ຈານ (4 ໂຕ)',
    descriptionLao: 'ຫອຍເຊວຂະໜາດໃຫຍ່ຈາກຮອກໄກໂດ ຍ່າງເນີຍຫອມໆ ຊີ້ນຫວານທຳມະຊາດ',
    descriptionEn: 'Jumbo Hokkaido scallops, pan-seared with garlic butter',
    prepEstMinutes: 6,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 110,
    stockQty: 16,
    minStockAlert: 10,
    maxStock: 30,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 09:00'
  },
  {
    id: 'M-10',
    nameLao: 'ປາມຶກກ້ວຍສົດ ບັ້ງດອກ (Fresh Squid Flowers)',
    nameEn: 'Fresh Squid with Calamari Cuts',
    category: 'seafood',
    tierRequired: 'PREMIUM',
    priceLAK: 59000,
    unit: 'ຈານ',
    descriptionLao: 'ປາມຶກກ້ວຍສົດບັ້ງລາຍດອກ ຍ່າງແລ້ວກອບເດັ້ງ ຈິ້ມແຈ່ວຊີຟູ້ດແຊບເດັດ',
    descriptionEn: 'Calamari diamond-cut squid, delightfully crunchy with seafood sauce',
    prepEstMinutes: 5,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 95,
    stockQty: 28,
    minStockAlert: 10,
    maxStock: 40,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 10:15'
  },
  // Vegetables
  {
    id: 'M-11',
    nameLao: 'ຊຸດຜັກອໍແກນິກລວມ & ເຫັດ (Mixed Veggies & Mushrooms)',
    nameEn: 'Assorted Organic Vegetables & Mushrooms',
    category: 'vegetables',
    tierRequired: 'STANDARD',
    priceLAK: 29000,
    unit: 'ຊຸດ',
    descriptionLao: 'ຜັກກາດຂາວ, ຜັກບົ້ງ, ສາລີຫວານ, ເຫັດເຂັມທອງ, ເຫັດອໍຣິນຈິ ສົດສະອາດ',
    descriptionEn: 'Crisp seasonal greens, king oyster & enoki mushrooms, sweet corn',
    prepEstMinutes: 3,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 60,
    stockQty: 52,
    minStockAlert: 20,
    maxStock: 80,
    stockUnit: 'ຊຸດ',
    lastRestockedAt: 'ມື້ນີ້ 07:30'
  },
  // Drinks & Dessert
  {
    id: 'M-12',
    nameLao: 'ໄອສຄຣີມຊາຂຽວ ມັດຊະ & ໝາກມ່ວງ (Green Tea & Mango Ice Cream)',
    nameEn: 'Artisan Matcha & Fresh Mango Ice Cream',
    category: 'drinks_dessert',
    tierRequired: 'STANDARD',
    priceLAK: 25000,
    unit: 'ຖ້ວຍ',
    descriptionLao: 'ໄອສຄຣີມໂຮມເມດ ມັດຊະແທ້ຈາກອຸຈິ ແລະ ໝາກມ່ວງສຸກຫວານຫອມ',
    descriptionEn: 'Artisan Uji matcha scoop & sweet Alphonso mango ice cream',
    prepEstMinutes: 2,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 150,
    stockQty: 38,
    minStockAlert: 15,
    maxStock: 60,
    stockUnit: 'ຖ້ວຍ',
    lastRestockedAt: 'ມື້ນີ້ 09:30'
  },
  // Extra additions for variety and rich menu
  {
    id: 'M-13',
    nameLao: 'ຊີ້ນງົວ US ຊອດເພຼດ ສະໄລ້ (US Beef Short Plate)',
    nameEn: 'US Angus Beef Short Plate Slice',
    category: 'beef',
    tierRequired: 'PREMIUM',
    priceLAK: 79000,
    unit: 'ຈານ',
    descriptionLao: 'ຊີ້ນງົວແອງກັສນຳເຂົ້າ ລາຍໄຂມັນແຊກກຳລັງດີ ປິ້ງແລ້ວຫອມກຣຸ່ນ',
    descriptionEn: 'US Angus beef short plate with wonderful balance of lean and fat',
    prepEstMinutes: 4,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 260,
    stockQty: 25,
    minStockAlert: 12,
    maxStock: 40,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 10:45'
  },
  {
    id: 'M-14',
    nameLao: 'ເຫັດເຂັມທອງພັນເບຄອນ (Enoki Bacon Rolls)',
    nameEn: 'Crispy Bacon Wrapped Enoki Rolls',
    category: 'meat_pork',
    tierRequired: 'STANDARD',
    priceLAK: 42000,
    unit: 'ຈານ (4 ໄມ້)',
    descriptionLao: 'ເບຄອນລົມຄວັນຫອມໆ ພັນເຫັດເຂັມທອງກອບໆ ຍ່າງແລ້ວກອບນອກນຸ້ມໃນ',
    descriptionEn: 'Smoked bacon tightly wrapped around crisp enoki mushrooms',
    prepEstMinutes: 4,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 230,
    stockQty: 30,
    minStockAlert: 10,
    maxStock: 45,
    stockUnit: 'ຈານ',
    lastRestockedAt: 'ມື້ນີ້ 09:00'
  },
  {
    id: 'M-15',
    nameLao: 'ຊຸດນ້ຳຈິ້ມແຈ່ວສຸກີ້ & ຊີຟູ້ດຣີຟິວ (Signature Sauce Set)',
    nameEn: 'Signature Lao Jaew & Suki Sauces',
    category: 'soup_condiment',
    tierRequired: 'STANDARD',
    priceLAK: 15000,
    unit: 'ຊຸດ',
    descriptionLao: 'ນ້ຳຈິ້ມສຸກີ້ໂຮມເມດ, ແຈ່ວຊີຟູ້ດໝາກນາວແທ້ ແລະ ພິກກະທຽມສົດ',
    descriptionEn: 'House-blend spicy suki sauce, lime seafood dip & fresh garlic chili',
    prepEstMinutes: 1,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 45,
    stockQty: 85,
    minStockAlert: 25,
    maxStock: 100,
    stockUnit: 'ຊຸດ',
    lastRestockedAt: 'ມື້ນີ້ 08:00'
  },
  {
    id: 'M-16',
    nameLao: 'ຊາເກັກຮວຍເຢັນ & ຊາຂຽວຣີຟິວ (Refill Iced Teas)',
    nameEn: 'Refill Chrysanthemum & Green Tea',
    category: 'drinks_dessert',
    tierRequired: 'STANDARD',
    priceLAK: 19000,
    unit: 'ຈອກ (ຣີຟິວ)',
    descriptionLao: 'ຊາເກັກຮວຍຕົ້ມສົດຫອມຊື່ນໃຈ ແລະ ຊາຂຽວເຢັນ ດື່ມໄດ້ບໍ່ອັ້ນຕະຫຼອດງານ',
    descriptionEn: 'Fresh brewed chrysanthemum & cold Japanese green tea with unlimited refills',
    prepEstMinutes: 1,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&auto=format&fit=crop&q=80',
    isAvailable: true,
    calories: 35,
    stockQty: 90,
    minStockAlert: 30,
    maxStock: 120,
    stockUnit: 'ຈອກ',
    lastRestockedAt: 'ມື້ນີ້ 08:30'
  }
];

export const INITIAL_STOCK_LOGS: StockRestockLog[] = [
  {
    id: 'LOG-01',
    menuItemId: 'M-01',
    menuItemNameLao: 'ສັນຄໍໝູສະໄລ້ ບາງພິເສດ',
    amountAdded: 25,
    previousStock: 23,
    newStock: 48,
    timestamp: '2026-10-09 10:30',
    staffName: 'ທ່ານ ສົມສັກ ວົງວິໄລ (ຜູ້ຈັດການ)',
    note: 'ຮັບສິນຄ້າປະຈຳເຊົ້າຈາກຟາມ CP'
  },
  {
    id: 'LOG-02',
    menuItemId: 'M-05',
    menuItemNameLao: 'ຊີ້ນງົວວາກິວ ລາຍຫີນອ່ອນ A5',
    amountAdded: 6,
    previousStock: 0,
    newStock: 6,
    timestamp: '2026-10-09 11:15',
    staffName: 'ທ່ານ ສົມສັກ ວົງວິໄລ (ຜູ້ຈັດການ)',
    note: 'ຕັດແຕ່ງວາກິວສົດຈາກຕູ້ເຢັນແຊ່ແຂງ'
  },
  {
    id: 'LOG-03',
    menuItemId: 'M-07',
    menuItemNameLao: 'ກຸ້ງແມ່ນ້ຳສົດ ໂຕໃຫຍ່',
    amountAdded: 15,
    previousStock: 9,
    newStock: 24,
    timestamp: '2026-10-09 10:00',
    staffName: 'ນາງ ນ້ອຍ ແກ້ວມະນີ (ແຄັດເຊຍ)',
    note: 'ຮັບກຸ້ງແມ່ນ້ຳສົດຈາກຕະຫຼາດທົ່ງຂັນຄຳ'
  }
];

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'PROMO-01',
    code: 'BUFFET10',
    titleLao: 'ສ່ວນຫຼຸດ 10% ສຳລັບໂຕະ 4 ທ່ານຂຶ້ນໄປ',
    titleEn: '10% Discount for Tables with 4+ Guests',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    validFrom: '2026-08-01',
    validTo: '2026-08-31',
    minSpendLAK: 500000,
    isActive: true,
    usageCount: 142
  },
  {
    id: 'PROMO-02',
    code: 'BCEL50K',
    titleLao: 'ຈ່າຍຜ່ານ BCEL OnePay ຫຼຸດ 50,000 ກີບ',
    titleEn: 'BCEL OnePay Instant 50,000 LAK Off',
    discountType: 'FIXED',
    discountValue: 50000,
    validFrom: '2026-08-10',
    validTo: '2026-09-30',
    minSpendLAK: 400000,
    isActive: true,
    usageCount: 89
  },
  {
    id: 'PROMO-03',
    code: 'VIPWEEKEND',
    titleLao: 'ໂປຣໂມຊັ່ນ VIP ສຸດສັບປະດາ ຫຼຸດ 15%',
    titleEn: 'VIP Weekend Special 15% Off',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    validFrom: '2026-08-15',
    validTo: '2026-08-25',
    minSpendLAK: 800000,
    isActive: true,
    usageCount: 35
  }
];

export const CLEAN_FRESH_TABLES: RestaurantTable[] = [
  // Indoor Zone A (8 tables)
  { id: 'T-A01', code: 'A-01', zone: 'Indoor Zone A', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 3, status: 'VACANT', currentGuests: 0 },
  { id: 'T-A02', code: 'A-02', zone: 'Indoor Zone A', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-A03', code: 'A-03', zone: 'Indoor Zone A', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 },
  { id: 'T-A04', code: 'A-04', zone: 'Indoor Zone A', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-A05', code: 'A-05', zone: 'Indoor Zone A', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-A06', code: 'A-06', zone: 'Indoor Zone A', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 },
  { id: 'T-A07', code: 'A-07', zone: 'Indoor Zone A', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-A08', code: 'A-08', zone: 'Indoor Zone A', defaultCapacity: 8, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 },
  
  // Indoor Zone B (6 tables)
  { id: 'T-B01', code: 'B-01', zone: 'Indoor Zone B', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-B02', code: 'B-02', zone: 'Indoor Zone B', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-B03', code: 'B-03', zone: 'Indoor Zone B', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 3, status: 'VACANT', currentGuests: 0 },
  { id: 'T-B04', code: 'B-04', zone: 'Indoor Zone B', defaultCapacity: 8, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 },
  { id: 'T-B05', code: 'B-05', zone: 'Indoor Zone B', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-B06', code: 'B-06', zone: 'Indoor Zone B', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 3, status: 'VACANT', currentGuests: 0 },
  
  // VIP Terrace (4 tables)
  { id: 'T-VIP1', code: 'VIP-01', zone: 'VIP Terrace', defaultCapacity: 8, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 },
  { id: 'T-VIP2', code: 'VIP-02', zone: 'VIP Terrace', defaultCapacity: 10, extraChairs: 0, maxExtraChairs: 6, status: 'VACANT', currentGuests: 0 },
  { id: 'T-VIP3', code: 'VIP-03', zone: 'VIP Terrace', defaultCapacity: 8, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 },
  { id: 'T-VIP4', code: 'VIP-04', zone: 'VIP Terrace', defaultCapacity: 12, extraChairs: 0, maxExtraChairs: 6, status: 'VACANT', currentGuests: 0 },
  
  // Outdoor Garden (6 tables)
  { id: 'T-OUT1', code: 'OUT-01', zone: 'Outdoor Garden', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-OUT2', code: 'OUT-02', zone: 'Outdoor Garden', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-OUT3', code: 'OUT-03', zone: 'Outdoor Garden', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 3, status: 'VACANT', currentGuests: 0 },
  { id: 'T-OUT4', code: 'OUT-04', zone: 'Outdoor Garden', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 3, status: 'VACANT', currentGuests: 0 },
  { id: 'T-OUT5', code: 'OUT-05', zone: 'Outdoor Garden', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-OUT6', code: 'OUT-06', zone: 'Outdoor Garden', defaultCapacity: 8, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 }
];

export const DEMO_BUSY_TABLES: RestaurantTable[] = [
  // Indoor Zone A
  { id: 'T-A01', code: 'A-01', zone: 'Indoor Zone A', defaultCapacity: 4, extraChairs: 1, maxExtraChairs: 3, status: 'OCCUPIED', currentSessionId: 'SESS-101', currentGuests: 5 },
  { id: 'T-A02', code: 'A-02', zone: 'Indoor Zone A', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'NEAR_LIMIT', currentSessionId: 'SESS-102', currentGuests: 3 },
  { id: 'T-A03', code: 'A-03', zone: 'Indoor Zone A', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 4, status: 'DELAYED_ALERT', currentSessionId: 'SESS-103', currentGuests: 4 },
  { id: 'T-A04', code: 'A-04', zone: 'Indoor Zone A', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-A05', code: 'A-05', zone: 'Indoor Zone A', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'RESERVED', currentGuests: 0 },
  { id: 'T-A06', code: 'A-06', zone: 'Indoor Zone A', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 },
  { id: 'T-A07', code: 'A-07', zone: 'Indoor Zone A', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-A08', code: 'A-08', zone: 'Indoor Zone A', defaultCapacity: 8, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 },
  
  // Indoor Zone B
  { id: 'T-B01', code: 'B-01', zone: 'Indoor Zone B', defaultCapacity: 4, extraChairs: 2, maxExtraChairs: 2, status: 'OCCUPIED', currentSessionId: 'SESS-201', currentGuests: 6 },
  { id: 'T-B02', code: 'B-02', zone: 'Indoor Zone B', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-B03', code: 'B-03', zone: 'Indoor Zone B', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 3, status: 'OCCUPIED', currentSessionId: 'SESS-203', currentGuests: 3 },
  { id: 'T-B04', code: 'B-04', zone: 'Indoor Zone B', defaultCapacity: 8, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 },
  { id: 'T-B05', code: 'B-05', zone: 'Indoor Zone B', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-B06', code: 'B-06', zone: 'Indoor Zone B', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 3, status: 'VACANT', currentGuests: 0 },
  
  // VIP Terrace
  { id: 'T-VIP1', code: 'VIP-01', zone: 'VIP Terrace', defaultCapacity: 8, extraChairs: 0, maxExtraChairs: 4, status: 'OCCUPIED', currentSessionId: 'SESS-VIP1', currentGuests: 6 },
  { id: 'T-VIP2', code: 'VIP-02', zone: 'VIP Terrace', defaultCapacity: 10, extraChairs: 0, maxExtraChairs: 6, status: 'RESERVED', currentGuests: 0 },
  { id: 'T-VIP3', code: 'VIP-03', zone: 'VIP Terrace', defaultCapacity: 8, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 },
  { id: 'T-VIP4', code: 'VIP-04', zone: 'VIP Terrace', defaultCapacity: 12, extraChairs: 0, maxExtraChairs: 6, status: 'VACANT', currentGuests: 0 },
  
  // Outdoor Garden
  { id: 'T-OUT1', code: 'OUT-01', zone: 'Outdoor Garden', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-OUT2', code: 'OUT-02', zone: 'Outdoor Garden', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'OCCUPIED', currentSessionId: 'SESS-OUT2', currentGuests: 2 },
  { id: 'T-OUT3', code: 'OUT-03', zone: 'Outdoor Garden', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 3, status: 'VACANT', currentGuests: 0 },
  { id: 'T-OUT4', code: 'OUT-04', zone: 'Outdoor Garden', defaultCapacity: 6, extraChairs: 0, maxExtraChairs: 3, status: 'VACANT', currentGuests: 0 },
  { id: 'T-OUT5', code: 'OUT-05', zone: 'Outdoor Garden', defaultCapacity: 4, extraChairs: 0, maxExtraChairs: 2, status: 'VACANT', currentGuests: 0 },
  { id: 'T-OUT6', code: 'OUT-06', zone: 'Outdoor Garden', defaultCapacity: 8, extraChairs: 0, maxExtraChairs: 4, status: 'VACANT', currentGuests: 0 }
];

export const INITIAL_TABLES = CLEAN_FRESH_TABLES;
export const MOCK_TABLES = CLEAN_FRESH_TABLES;

export const INITIAL_SESSIONS: Record<string, TableSession> = {
  'SESS-101': {
    id: 'SESS-101',
    tableCode: 'A-01',
    tableCodes: ['A-01'],
    branchId: 'BR-VTE-01',
    packageTier: 'PREMIUM',
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    plannedEndTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    durationMinutes: 105,
    remainingMinutes: 60,
    guestCount: 5,
    guests: [
      { id: 'G-1', type: 'FULL', discountPercent: 0, priceCharged: 219000, addedAt: '23:33' },
      { id: 'G-2', type: 'FULL', discountPercent: 0, priceCharged: 219000, addedAt: '23:33' },
      { id: 'G-3', type: 'HALF', discountPercent: 50, priceCharged: 109500, addedAt: '23:33', note: 'ເດັກນ້ອຍ ອາຍຸ 7 ປີ (Child 7yo)' },
      { id: 'G-4', type: 'FREE', discountPercent: 100, priceCharged: 0, addedAt: '23:33', note: 'ເດັກນ້ອຍ ອາຍຸ 2 ປີ (Toddler 2yo)' },
      { id: 'G-5', type: 'FULL', discountPercent: 0, priceCharged: 219000, addedAt: '23:55', note: 'ເພີ່ມກາງຄາບ (Mid-meal add)' }
    ],
    orders: [],
    status: 'ACTIVE'
  },
  'SESS-102': {
    id: 'SESS-102',
    tableCode: 'A-02',
    tableCodes: ['A-02'],
    branchId: 'BR-VTE-01',
    packageTier: 'STANDARD',
    startTime: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    plannedEndTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    remainingMinutes: 10,
    guestCount: 3,
    guests: [
      { id: 'G-201', type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: '22:58' },
      { id: 'G-202', type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: '22:58' },
      { id: 'G-203', type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: '22:58' }
    ],
    orders: [],
    status: 'ACTIVE'
  },
  'SESS-103': {
    id: 'SESS-103',
    tableCode: 'A-03',
    tableCodes: ['A-03'],
    branchId: 'BR-VTE-01',
    packageTier: 'VIP',
    startTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    plannedEndTime: new Date(Date.now() + 85 * 60 * 1000).toISOString(),
    durationMinutes: 120,
    remainingMinutes: 85,
    guestCount: 4,
    guests: [
      { id: 'G-301', type: 'FULL', discountPercent: 0, priceCharged: 329000, addedAt: '23:43' },
      { id: 'G-302', type: 'FULL', discountPercent: 0, priceCharged: 329000, addedAt: '23:43' },
      { id: 'G-303', type: 'FULL', discountPercent: 0, priceCharged: 329000, addedAt: '23:43' },
      { id: 'G-304', type: 'FULL', discountPercent: 0, priceCharged: 329000, addedAt: '23:43' }
    ],
    orders: [],
    status: 'ACTIVE'
  },
  'SESS-201': {
    id: 'SESS-201',
    tableCode: 'B-01',
    tableCodes: ['B-01'],
    branchId: 'BR-VTE-01',
    packageTier: 'STANDARD',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    plannedEndTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    remainingMinutes: 60,
    guestCount: 6,
    guests: [
      { id: 'G-401', type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: '23:48' },
      { id: 'G-402', type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: '23:48' },
      { id: 'G-403', type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: '23:48' },
      { id: 'G-404', type: 'HALF', discountPercent: 50, priceCharged: 74500, addedAt: '23:48' },
      { id: 'G-405', type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: '00:05', note: 'ເກົ້າອີ້ເສີມ 1 ບ່ອນ (Extra chair #1)' },
      { id: 'G-406', type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: '00:05', note: 'ເກົ້າອີ້ເສີມ 2 ບ່ອນ (Extra chair #2)' }
    ],
    orders: [],
    status: 'ACTIVE'
  },
  'SESS-203': {
    id: 'SESS-203',
    tableCode: 'B-03',
    tableCodes: ['B-03'],
    branchId: 'BR-VTE-01',
    packageTier: 'PREMIUM',
    startTime: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    plannedEndTime: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
    durationMinutes: 105,
    remainingMinutes: 55,
    guestCount: 3,
    guests: [
      { id: 'G-501', type: 'FULL', discountPercent: 0, priceCharged: 219000, addedAt: '23:28' },
      { id: 'G-502', type: 'FULL', discountPercent: 0, priceCharged: 219000, addedAt: '23:28' },
      { id: 'G-503', type: 'FULL', discountPercent: 0, priceCharged: 219000, addedAt: '23:28' }
    ],
    orders: [],
    status: 'ACTIVE'
  },
  'SESS-VIP1': {
    id: 'SESS-VIP1',
    tableCode: 'VIP-01',
    tableCodes: ['VIP-01'],
    branchId: 'BR-VTE-01',
    packageTier: 'VIP',
    startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    plannedEndTime: new Date(Date.now() + 95 * 60 * 1000).toISOString(),
    durationMinutes: 120,
    remainingMinutes: 95,
    guestCount: 6,
    guests: [
      { id: 'G-601', type: 'FULL', discountPercent: 0, priceCharged: 329000, addedAt: '23:53' },
      { id: 'G-602', type: 'FULL', discountPercent: 0, priceCharged: 329000, addedAt: '23:53' },
      { id: 'G-603', type: 'FULL', discountPercent: 0, priceCharged: 329000, addedAt: '23:53' },
      { id: 'G-604', type: 'FULL', discountPercent: 0, priceCharged: 329000, addedAt: '23:53' },
      { id: 'G-605', type: 'FULL', discountPercent: 0, priceCharged: 329000, addedAt: '23:53' },
      { id: 'G-606', type: 'FREE', discountPercent: 100, priceCharged: 0, addedAt: '23:53', note: 'VIP Guest of Honor' }
    ],
    orders: [],
    status: 'ACTIVE'
  },
  'SESS-OUT2': {
    id: 'SESS-OUT2',
    tableCode: 'OUT-02',
    tableCodes: ['OUT-02'],
    branchId: 'BR-VTE-01',
    packageTier: 'STANDARD',
    startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    plannedEndTime: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    remainingMinutes: 75,
    guestCount: 2,
    guests: [
      { id: 'G-701', type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: '00:03' },
      { id: 'G-702', type: 'FULL', discountPercent: 0, priceCharged: 149000, addedAt: '00:03' }
    ],
    orders: [],
    status: 'ACTIVE'
  }
};

export const DEMO_BUSY_SESSIONS = INITIAL_SESSIONS;

export const DEMO_BUSY_ORDERS: Order[] = [
  {
    id: 'ORD-101-1',
    orderNumber: '#0891',
    sessionId: 'SESS-101',
    tableCode: 'A-01',
    orderTime: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    status: 'SERVED',
    isDelayed: false,
    delayedMinutes: 0,
    items: [
      { id: 'OI-1', menuItemId: 'M-01', nameLao: 'ສັນຄໍໝູສະໄລ້', nameEn: 'Pork Collar', category: 'meat_pork', quantity: 3, status: 'SERVED', prepTimeMinutes: 4 },
      { id: 'OI-2', menuItemId: 'M-04', nameLao: 'ຊີ້ນງົວອົດສະຕຣາລີ', nameEn: 'AUS Beef Slice', category: 'beef', quantity: 2, status: 'SERVED', prepTimeMinutes: 5 },
      { id: 'OI-3', menuItemId: 'M-07', nameLao: 'ກຸ້ງແມ່ນ້ຳສົດ', nameEn: 'Giant River Prawns', category: 'seafood', quantity: 2, status: 'SERVED', prepTimeMinutes: 7 }
    ]
  },
  {
    id: 'ORD-101-2',
    orderNumber: '#0898',
    sessionId: 'SESS-101',
    tableCode: 'A-01',
    orderTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: 'COOKING',
    isDelayed: false,
    delayedMinutes: 0,
    items: [
      { id: 'OI-4', menuItemId: 'M-02', nameLao: 'ສາມຊັ້ນໝູສະໄລ້', nameEn: 'Pork Belly', category: 'meat_pork', quantity: 2, status: 'COOKING', prepTimeMinutes: 4 },
      { id: 'OI-5', menuItemId: 'M-10', nameLao: 'ປາມຶກກ້ວຍສົດ', nameEn: 'Fresh Squid', category: 'seafood', quantity: 2, status: 'COOKING', prepTimeMinutes: 5 }
    ]
  },
  {
    id: 'ORD-103-1',
    orderNumber: '#0895',
    sessionId: 'SESS-103',
    tableCode: 'A-03',
    orderTime: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    status: 'COOKING',
    isDelayed: true,
    delayedMinutes: 12,
    careAlertSent: true,
    items: [
      { id: 'OI-301', menuItemId: 'M-05', nameLao: 'ຊີ້ນງົວວາກິວ A5', nameEn: 'Wagyu MB7+', category: 'beef', quantity: 4, status: 'COOKING', prepTimeMinutes: 6 },
      { id: 'OI-302', menuItemId: 'M-08', nameLao: 'ຊາຊິມິແຊວມອນ', nameEn: 'Salmon Sashimi', category: 'seafood', quantity: 3, status: 'COOKING', prepTimeMinutes: 5 },
      { id: 'OI-303', menuItemId: 'M-09', nameLao: 'ຫອຍເຊວຮອກໄກໂດ', nameEn: 'Hokkaido Scallops', category: 'seafood', quantity: 2, status: 'PENDING', prepTimeMinutes: 6 }
    ]
  },
  {
    id: 'ORD-VIP1-1',
    orderNumber: '#0901',
    sessionId: 'SESS-VIP1',
    tableCode: 'VIP-01',
    orderTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: 'READY',
    isDelayed: false,
    delayedMinutes: 0,
    items: [
      { id: 'OI-601', menuItemId: 'M-05', nameLao: 'ຊີ້ນງົວວາກິວ A5', nameEn: 'Wagyu MB7+', category: 'beef', quantity: 6, status: 'READY', prepTimeMinutes: 6 },
      { id: 'OI-602', menuItemId: 'M-08', nameLao: 'ຊາຊິມິແຊວມອນ', nameEn: 'Salmon Sashimi', category: 'seafood', quantity: 4, status: 'READY', prepTimeMinutes: 5 }
    ]
  }
];

// Clean Start Default (0 Occupied Tables)
export const MOCK_SESSIONS: Record<string, TableSession> = {};
export const MOCK_ORDERS: Order[] = [];

export const MOCK_PAID_BILLS: BillReceipt[] = [
  {
    id: 'BILL-INIT-01',
    billNumber: 'INV-20261006-1042',
    branchId: 'BR-001',
    branchNameLao: 'ສາຂາ 1: ສີຫ້ອມ ວຽງຈັນ (Flagship)',
    tableCodes: ['A-02'],
    sessionId: 'SESS-PAID-01',
    cashierName: 'ນາງ ນ້ອຍ ແກ້ວມະນີ',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    packageTier: 'PREMIUM',
    guestsBreakdown: {
      fullPriceCount: 4,
      fullPriceUnit: 219000,
      halfPriceCount: 0,
      halfPriceUnit: 109500,
      freeCount: 0,
      freeUnit: 0
    },
    extraCharges: [],
    subtotalLAK: 876000,
    discountLAK: 0,
    vatTaxLAK: 61320,
    serviceChargeLAK: 43800,
    netTotalLAK: 981120,
    paymentMethod: 'LAO_QR_BCEL',
    paymentStatus: 'PAID',
    bcelRef: 'BCEL-TXN-88291044'
  },
  {
    id: 'BILL-INIT-02',
    billNumber: 'INV-20261006-2091',
    branchId: 'BR-001',
    branchNameLao: 'ສາຂາ 1: ສີຫ້ອມ ວຽງຈັນ (Flagship)',
    tableCodes: ['B-01'],
    sessionId: 'SESS-PAID-02',
    cashierName: 'ນາງ ນ້ອຍ ແກ້ວມະນີ',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    packageTier: 'STANDARD',
    guestsBreakdown: {
      fullPriceCount: 2,
      fullPriceUnit: 149000,
      halfPriceCount: 1,
      halfPriceUnit: 74500,
      freeCount: 0,
      freeUnit: 0
    },
    extraCharges: [],
    subtotalLAK: 372500,
    discountLAK: 0,
    vatTaxLAK: 26075,
    serviceChargeLAK: 18625,
    netTotalLAK: 417200,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID'
  },
  {
    id: 'BILL-INIT-03',
    billNumber: 'INV-20261006-3819',
    branchId: 'BR-001',
    branchNameLao: 'ສາຂາ 1: ສີຫ້ອມ ວຽງຈັນ (Flagship)',
    tableCodes: ['VIP-03'],
    sessionId: 'SESS-PAID-03',
    cashierName: 'ນາງ ນ້ອຍ ແກ້ວມະນີ',
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    packageTier: 'VIP',
    guestsBreakdown: {
      fullPriceCount: 6,
      fullPriceUnit: 349000,
      halfPriceCount: 0,
      halfPriceUnit: 174500,
      freeCount: 1,
      freeUnit: 0
    },
    extraCharges: [],
    subtotalLAK: 2094000,
    discountLAK: 100000,
    promoCode: 'VIP100K',
    vatTaxLAK: 139580,
    serviceChargeLAK: 99700,
    netTotalLAK: 2233280,
    paymentMethod: 'LAO_QR_BCEL',
    paymentStatus: 'PAID',
    bcelRef: 'BCEL-TXN-91823711'
  }
];

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-001',
    tableCode: 'A-05',
    customerName: 'ທ່ານ ສົມພອນ ແກ້ວສຸວັນ (Somphone K.)',
    customerPhone: '+856 20 5512 8844',
    guestCount: 4,
    packageTier: 'PREMIUM',
    date: '2026-10-08',
    timeSlot: '19:00',
    status: 'CONFIRMED',
    depositAmountLAK: 200000,
    specialNotes: 'ຕ້ອງການໝໍ້ແຍກຊຸບໝ່າລ່າ + ຊຸບໃສ (Separate Mala/Clear soup pot)'
  },
  {
    id: 'RES-002',
    tableCode: 'VIP-02',
    customerName: 'ທ່ານ ນາງ ດາວອນ ສຸລິຍະວົງ (Davone S.)',
    customerPhone: '+856 20 5588 3311',
    guestCount: 10,
    packageTier: 'VIP',
    date: '2026-10-08',
    timeSlot: '19:30',
    status: 'CONFIRMED',
    depositAmountLAK: 500000,
    specialNotes: 'ງານລ້ຽງວັນເກີດຄອບຄົວ - ຂໍຕັ້ງປ້າຍ Happy Birthday (Family Birthday)'
  },
  {
    id: 'RES-003',
    tableCode: 'A-06',
    customerName: 'ທ່ານ ອາລຸນ ສີປະເສີດ (Aloun S.)',
    customerPhone: '+856 20 5999 1100',
    guestCount: 6,
    packageTier: 'STANDARD',
    date: '2026-10-09',
    timeSlot: '20:00',
    status: 'CONFIRMED',
    depositAmountLAK: 150000
  }
];
