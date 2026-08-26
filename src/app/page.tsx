'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navigation, TabType } from '@/components/Navigation';
import { TokoModal } from '@/components/TokoModal';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer, CartItem } from '@/components/CartDrawer';
import { DeliveryLoadSummaryModal } from '@/components/DeliveryLoadSummaryModal';
import { TokoPerformanceCard } from '@/components/TokoPerformanceCard';
import { NotaModal } from '@/components/NotaModal';
import { EditNotaModal } from '@/components/EditNotaModal';
import { ConfirmDeliveryModal } from '@/components/ConfirmDeliveryModal';
import { SuratJalanModal } from '@/components/SuratJalanModal';
import { SettingsModal } from '@/components/SettingsModal';
import { PurchaseModal } from '@/components/PurchaseModal';
import { FifoStockDashboardModal } from '@/components/FifoStockDashboardModal';
import { ExpenseModal } from '@/components/ExpenseModal';
import { OwnerDrawModal } from '@/components/OwnerDrawModal';
import { SoloFinancialDashboardModal } from '@/components/SoloFinancialDashboardModal';
import { ReturnModal } from '@/components/ReturnModal';
import { NotaReturModal } from '@/components/NotaReturModal';
import { TokoDetailModal } from '@/components/TokoDetailModal';
import { StoreManager, DEFAULT_SETTINGS, getLocalTodayStr } from '@/lib/store';
import {
  Toko,
  Product,
  Order,
  OrderItem,
  TokoPerformance,
  DeliveryLoadItem,
  StatusPengiriman,
  JenisPembayaran,
  StatusPembayaran,
  StoreSettings,
  Purchase,
  Expense,
  OwnerDraw,
  ExpenseKategori,
  ProductReturn,
} from '@/types';
import {
  Plus,
  Search,
  PackageCheck,
  Layers,
  Filter,
  Truck,
  CheckCircle2,
  Calendar,
  Wallet,
  Fuel,
  ArrowDownRight,
  Store as StoreIcon,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Edit2,
  FileText,
  Printer,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Award,
  Settings as SettingsIcon,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('order');

  // Data states
  const [tokos, setTokos] = useState<Toko[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTokoId, setSelectedTokoId] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Settings state
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<string>('SEMUA');

  // Delivery Tab Filters (Presisi Tanggal Lokal YYYY-MM-DD)
  const todayStr = getLocalTodayStr();
  const [deliveryDate, setDeliveryDate] = useState<string>(todayStr);
  const [deliveryPasarFilter, setDeliveryPasarFilter] = useState<string>('SEMUA');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<string>('SEMUA');

  // Modals
  const [isTokoModalOpen, setIsTokoModalOpen] = useState<boolean>(false);
  const [editingToko, setEditingToko] = useState<Toko | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoadSummaryOpen, setIsLoadSummaryOpen] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);

  // Nota, Surat Jalan & Confirm Modals
  const [selectedNota, setSelectedNota] = useState<Order | null>(null);
  const [selectedSuratJalan, setSelectedSuratJalan] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);

  // Edit Product & Restock Modal State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isFifoDashboardOpen, setIsFifoDashboardOpen] = useState(false);

  // Expenses, Owner Draws, Returns & Solo Finance States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ownerDraws, setOwnerDraws] = useState<OwnerDraw[]>([]);
  const [productReturns, setProductReturns] = useState<ProductReturn[]>([]);
  const [selectedNotaRetur, setSelectedNotaRetur] = useState<ProductReturn | null>(null);
  const [selectedTokoDetail, setSelectedTokoDetail] = useState<TokoPerformance | null>(null);
  const [stockSubTab, setStockSubTab] = useState<'produk' | 'histori_retur'>('produk');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isOwnerDrawModalOpen, setIsOwnerDrawModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isSoloFinanceOpen, setIsSoloFinanceOpen] = useState(false);
  const [financeSubTab, setFinanceSubTab] = useState<'kantong' | 'statistik' | 'histori' | 'kalender' | 'tutup_buku'>('kantong');
  const [financePeriod, setFinancePeriod] = useState<import('@/types').TimePeriod>('monthly');
  const [dashboardOrdersPeriod, setDashboardOrdersPeriod] = useState<import('@/types').TimePeriod>('all');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = (
    e: React.TouchEvent,
    onSwipeLeft: () => void,
    onSwipeRight: () => void
  ) => {
    if (!touchStartPos || e.changedTouches.length === 0) return;

    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStartPos.x;
    const deltaY = touchEnd.clientY - touchStartPos.y;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
    setTouchStartPos(null);
  };

  const financeSubTabsList: Array<'kantong' | 'statistik' | 'histori' | 'kalender' | 'tutup_buku'> = [
    'kantong',
    'statistik',
    'histori',
    'kalender',
    'tutup_buku',
  ];

  const handleFinanceSwipeLeft = () => {
    const currentIdx = financeSubTabsList.indexOf(financeSubTab);
    if (currentIdx < financeSubTabsList.length - 1) {
      setFinanceSubTab(financeSubTabsList[currentIdx + 1]);
    }
  };

  const handleFinanceSwipeRight = () => {
    const currentIdx = financeSubTabsList.indexOf(financeSubTab);
    if (currentIdx > 0) {
      setFinanceSubTab(financeSubTabsList[currentIdx - 1]);
    }
  };

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = async () => {
        setIsOnline(true);
        setSyncMessage('⚡ Sinyal Terhubung! Menyingkronkan transaksi offline...');
        const res = await StoreManager.syncOfflineQueue();
        await refreshData();

        const totalSynced = res.syncedOrders + res.syncedExpenses + res.syncedDraws + res.syncedPurchases;
        if (totalSynced > 0) {
          setSyncMessage(`✅ ${res.syncedOrders} Nota & ${res.syncedExpenses + res.syncedDraws + res.syncedPurchases} Transaksi Offline Disinkronkan ke Cloud!`);
        } else {
          setSyncMessage('⚡ Sinyal Terhubung! Data aplikasi up-to-date.');
        }
        setTimeout(() => setSyncMessage(null), 5000);
      };

      const handleOffline = () => {
        setIsOnline(false);
        setSyncMessage('🔴 Modus Offline: Transaksi & nota tetap aman tersimpan di HP.');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Initial mount check
      if (navigator.onLine) {
        StoreManager.syncOfflineQueue().then((res) => {
          if (res.syncedOrders > 0 || res.syncedExpenses > 0 || res.syncedDraws > 0 || res.syncedPurchases > 0) {
            setSyncMessage(`✅ Data Offline Berhasil Disinkronkan (${res.syncedOrders} Nota)!`);
            refreshData();
            setTimeout(() => setSyncMessage(null), 4000);
          }
        });
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const [isMounted, setIsMounted] = useState(false);

  // Load data 100% from Supabase DB
  const refreshData = async () => {
    setIsLoadingData(true);
    try {
      const [
        loadedTokos,
        loadedProducts,
        loadedOrders,
        loadedSettings,
        loadedPurchases,
        loadedExpenses,
        loadedOwnerDraws,
        loadedReturns,
      ] = await Promise.all([
        StoreManager.fetchTokos(),
        StoreManager.fetchProducts(),
        StoreManager.fetchOrders(),
        StoreManager.fetchSettings(),
        StoreManager.fetchPurchases(),
        StoreManager.fetchExpenses(),
        StoreManager.fetchOwnerDraws(),
        StoreManager.fetchReturns(),
      ]);

      setTokos(loadedTokos);
      setProducts(loadedProducts);
      setOrders(loadedOrders);
      setStoreSettings(loadedSettings);
      setPurchases(loadedPurchases);
      setExpenses(loadedExpenses);
      setOwnerDraws(loadedOwnerDraws);
      setProductReturns(loadedReturns);

      if (loadedTokos.length > 0 && !selectedTokoId) {
        setSelectedTokoId(loadedTokos[0].id);
      }
    } catch (err) {
      console.warn('Error refreshing data from Supabase:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSaveReturn = async (returnData: Omit<ProductReturn, 'id' | 'created_at'>) => {
    const saved = await StoreManager.saveReturn(returnData);
    await refreshData();
    setSelectedNotaRetur(saved);
  };

  const handleSavePurchase = async (purchaseData: {
    product_id: string;
    supplier_nama: string;
    jumlah_masuk: number;
    harga_modal_beli: number;
    tanggal_beli: string;
  }) => {
    await StoreManager.savePurchase(purchaseData);
    await refreshData();
  };

  const handleSaveExpense = async (expenseData: {
    kategori: ExpenseKategori;
    nominal: number;
    keterangan: string;
    tanggal: string;
  }) => {
    await StoreManager.saveExpense(expenseData);
    await refreshData();
  };

  const handleSaveOwnerDraw = async (drawData: {
    nominal: number;
    catatan: string;
    tanggal: string;
  }) => {
    await StoreManager.saveOwnerDraw(drawData);
    await refreshData();
  };

  useEffect(() => {
    setIsMounted(true);
    setStoreSettings(StoreManager.getSettings());
    refreshData();
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, qty: number, dealPrice: number) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].qty += qty;
        updated[existingIdx].dealPrice = dealPrice;
        return updated;
      }
      return [...prev, { product, qty, dealPrice }];
    });
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, qty: newQty } : i))
      );
    }
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleCheckoutOrder = async (
    orderData: Omit<Order, 'id' | 'no_nota' | 'created_at'>
  ) => {
    const created = await StoreManager.createOrder(orderData);
    await refreshData();
    return created;
  };

  const handleSaveToko = async (
    tokoData: Omit<Toko, 'id' | 'created_at'>,
    editingId?: string
  ) => {
    if (editingId) {
      await StoreManager.updateToko(editingId, tokoData);
    } else {
      const newToko = await StoreManager.saveToko(tokoData);
      setSelectedTokoId(newToko.id);
    }
    await refreshData();
    setEditingToko(null);
    setIsTokoModalOpen(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.nama_produk || !editingProduct?.satuan) return;

    await StoreManager.saveProduct(editingProduct);
    await refreshData();
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveEditNota = async (
    orderId: string,
    updatedData: {
      total_bayar?: number;
      jenis_pembayaran?: JenisPembayaran;
      status_pembayaran?: StatusPembayaran;
      tanggal_pengiriman?: string;
      catatan_pengiriman?: string;
      items?: OrderItem[];
    },
    logMessage: string
  ) => {
    await StoreManager.updateOrderWithLog(orderId, updatedData, logMessage);
    await refreshData();
  };

  const handleConfirmDelivery = async (
    orderId: string,
    penerimaNama: string,
    catatan?: string
  ) => {
    await StoreManager.confirmDelivery(orderId, penerimaNama, catatan);
    await refreshData();
  };

  // Derived values & Hooks
  const uniqueMarkets = useMemo(() => {
    const markets = new Set(tokos.map((t) => t.lokasi_pasar));
    return Array.from(markets);
  }, [tokos]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['SEMUA', ...Array.from(cats)];
  }, [products]);

  const selectedToko = useMemo(() => {
    return tokos.find((t) => t.id === selectedTokoId) || null;
  }, [tokos, selectedTokoId]);

  const tokoPerformances: TokoPerformance[] = useMemo(() => {
    return StoreManager.getTokoPerformancesFromData(tokos, orders, productReturns);
  }, [tokos, orders, productReturns]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kode_sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'SEMUA' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Filtered Tokos for Toko Tab
  const filteredTokoPerformances = useMemo(() => {
    return tokoPerformances.filter((t) => {
      const matchSearch =
        t.nama_toko.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nama_pemilik.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.no_hp.includes(searchQuery);
      const matchMarket =
        selectedMarketFilter === 'SEMUA' || t.lokasi_pasar === selectedMarketFilter;
      return matchSearch && matchMarket;
    });
  }, [tokoPerformances, searchQuery, selectedMarketFilter]);

  // Filtered Orders for Pengiriman Tab
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchDate =
        !deliveryDate ||
        (o.tanggal_pengiriman && o.tanggal_pengiriman.substring(0, 10) === deliveryDate.substring(0, 10));
      const toko = tokos.find((t) => t.id === o.toko_id);
      const matchPasar =
        deliveryPasarFilter === 'SEMUA' || toko?.lokasi_pasar === deliveryPasarFilter;
      const matchStatus =
        deliveryStatusFilter === 'SEMUA'
          ? true
          : deliveryStatusFilter === 'BELUM_TERKIRIM'
          ? o.status_pengiriman !== 'Terkirim'
          : o.status_pengiriman === deliveryStatusFilter;

      return matchDate && matchPasar && matchStatus;
    });
  }, [orders, tokos, deliveryDate, deliveryPasarFilter, deliveryStatusFilter]);

  // Delivery Load Items for Modal
  const loadItems: DeliveryLoadItem[] = useMemo(() => {
    return StoreManager.getDeliveryLoadItemsFromData(
      orders,
      tokos,
      products,
      deliveryDate,
      deliveryPasarFilter
    );
  }, [orders, tokos, products, deliveryDate, deliveryPasarFilter]);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const handleExportExcel = () => {
    const filteredOrders = StoreManager.filterByPeriod(orders, financePeriod, 'tanggal_pengiriman');
    const filteredExpenses = StoreManager.filterByPeriod(expenses, financePeriod, 'tanggal');

    let csv = "\uFEFF";
    csv += `LAPORAN KEUANGAN - ${storeSettings.nama_usaha.toUpperCase()}\n`;
    csv += `Periode Filter: ${financePeriod.toUpperCase()}\n`;
    csv += `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}\n\n`;

    csv += "--- PENJUALAN NOTA LUNAS & TEMPO ---\n";
    csv += "No Nota,Toko,Tanggal,Jenis Bayar,Status,Total Bayar (Rp)\n";
    filteredOrders.forEach((o) => {
      const tokoNama = tokos.find((t) => t.id === o.toko_id)?.nama_toko || o.toko?.nama_toko || 'Toko';
      csv += `"${o.no_nota}","${tokoNama}","${o.tanggal_pengiriman}","${o.jenis_pembayaran}","${o.status_pembayaran}",${o.total_bayar}\n`;
    });

    csv += "\n--- PENGELUARAN OPERASIONAL LAPANGAN ---\n";
    csv += "Kategori,Keterangan,Tanggal,Nominal (Rp)\n";
    filteredExpenses.forEach((e) => {
      csv += `"${e.kategori}","${e.keterangan || '-'}","${e.tanggal}",${e.nominal}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_TutupBuku_${storeSettings.nama_usaha.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareWhatsApp = () => {
    const buckets = StoreManager.getSoloFinancialBuckets(orders, purchases, expenses, ownerDraws);
    const text = `*REKAP LAPORAN KEUANGAN ${storeSettings.nama_usaha.toUpperCase()}*
----------------------------------------
💰 Total Omset Penjualan Lunas: ${formatIDR(buckets.totalOmsetLunas)}

📦 *Pos Belanja Stok (80%)*: ${formatIDR(buckets.posModalBelanjaStok)}
⛽ *Pos Operasional (5%)*: ${formatIDR(buckets.posOperasional)}
💵 *Pos Gaji Saya (15%)*: ${formatIDR(buckets.posGajiOwner)}

--- PENGGUNAAN SALDO ---
📦 Restock Supplier: ${formatIDR(buckets.totalPembelianRestock)}
⛽ Pengeluaran Operasional: ${formatIDR(buckets.totalPengeluaranOperasional)}
💵 Penarikan Gaji Pribadi: ${formatIDR(buckets.totalPenarikanGaji)}
----------------------------------------
_Sistem Kasir Distributor POS Canvassing_`;

    navigator.clipboard.writeText(text);
    alert('Ringkasan laporan berhasil disalin ke clipboard! Membuka WhatsApp...');
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const isSameDate = (d1?: string, d2?: string) => {
    if (!d1 || !d2) return false;
    return d1.substring(0, 10) === d2.substring(0, 10);
  };

  const todayDeliveryCount = useMemo(() => {
    return orders.filter(
      (o) => isSameDate(o.tanggal_pengiriman, todayStr) && o.status_pengiriman !== 'Terkirim'
    ).length;
  }, [orders, todayStr]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-700">Memuat Sales Canvasser...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-20 md:pb-8">
      {/* Navigation Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.reduce((sum, item) => sum + item.qty, 0)}
        deliveryCount={todayDeliveryCount}
        openCart={() => setIsCartOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={storeSettings}
      />

      {/* Offline / Online Status & Auto-Sync Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-[11px] font-extrabold py-1.5 px-3 text-center flex items-center justify-center gap-1.5 shadow-xs sticky top-12 z-35">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-200 animate-ping"></span>
          <span>🔴 Modus Offline: Sinyal pasar terputus. Transaksi & nota tetap aman tersimpan di HP.</span>
        </div>
      )}

      {syncMessage && isOnline && (
        <div className="bg-emerald-600 text-white text-[11px] font-extrabold py-1.5 px-3 text-center flex items-center justify-center gap-1.5 animate-fade-in shadow-xs sticky top-12 z-35">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-2 sm:px-4 pt-2">
        {/* TAB 1: ORDER SALES */}
        {activeTab === 'order' && (
          <div className="space-y-2">
            {/* Sticky Compact Header for Toko Select & Search */}
            <div className="bg-white border-b border-slate-200 p-3 rounded-xl shadow-xs sticky top-[53px] z-20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                {/* Toko Selector */}
                <div className="flex-1 flex items-center gap-2">
                  <StoreIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                  <select
                    value={selectedTokoId}
                    onChange={(e) => setSelectedTokoId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    {tokos.length === 0 ? (
                      <option value="">Belum Ada Toko Terdaftar</option>
                    ) : (
                      tokos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nama_toko} ({t.lokasi_pasar})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <button
                  onClick={() => setIsTokoModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold shadow-xs active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Toko Baru</span>
                </button>
              </div>

              {/* Toko Info Subbar */}
              {selectedToko && (
                <div className="flex items-center justify-between text-[11px] text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <span>Pasar: <strong className="text-emerald-800 font-extrabold">{selectedToko.lokasi_pasar}</strong></span>
                  <span>Pemilik: <strong className="text-slate-900 font-bold">{selectedToko.nama_pemilik}</strong> ({selectedToko.no_hp})</span>
                </div>
              )}

              {/* Search Input & Category Pills */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari produk / SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Category Pills Horizontal Scroll */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-[180px] sm:max-w-xs scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products List (Divided by horizontal lines ___) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-200">
              {isLoadingData ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold">Memuat katalog produk...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-1">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Tidak ada produk ditemukan</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PENGIRIMAN & MUATAN BARANG */}
        {activeTab === 'pengiriman' && (
          <div className="space-y-4">
            {/* Top Summary Stats Bar (Presisi Sinkron dengan Filter Tanggal) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-xs">
                <span className="text-[10px] font-bold opacity-80 block">💰 Setoran Cash {deliveryDate ? 'Tanggal Ini' : 'Semua'}</span>
                <h4 className="text-sm sm:text-base font-black">
                  {(() => {
                    const grossCash = orders
                      .filter(
                        (o) =>
                          (!deliveryDate || isSameDate(o.tanggal_pengiriman, deliveryDate)) &&
                          o.status_pembayaran === 'Lunas' &&
                          o.status_pengiriman === 'Terkirim'
                      )
                      .reduce((sum, o) => sum + o.total_bayar, 0);

                    const cashRefunds = productReturns
                      .filter(
                        (r) =>
                          (!deliveryDate || isSameDate(r.tanggal, deliveryDate)) &&
                          r.tindakan === 'Potong Tagihan Cash'
                      )
                      .reduce((sum, r) => sum + r.total_nilai, 0);

                    return formatIDR(Math.max(0, grossCash - cashRefunds));
                  })()}
                </h4>
              </div>

              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 block">📦 Status Terkirim</span>
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  {orders.filter((o) => (!deliveryDate || isSameDate(o.tanggal_pengiriman, deliveryDate)) && o.status_pengiriman === 'Terkirim').length} / {orders.filter((o) => !deliveryDate || isSameDate(o.tanggal_pengiriman, deliveryDate)).length} Toko
                </h4>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-amber-50 border border-amber-200 p-3 rounded-xl shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-900 block">⌛ Belum Terkirim</span>
                  <h4 className="text-sm sm:text-base font-black text-amber-900">
                    {orders.filter((o) => (!deliveryDate || isSameDate(o.tanggal_pengiriman, deliveryDate)) && o.status_pengiriman !== 'Terkirim' && o.status_pengiriman !== 'Batal').length} Order
                  </h4>
                </div>
                <button
                  onClick={() => setIsLoadSummaryOpen(true)}
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-extrabold rounded-lg shadow-xs flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Rekap</span>
                </button>
              </div>
            </div>

            {/* Flat Filter Bar (Horizontal Line Divider) */}
            <div className="pb-3 border-b border-slate-300 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-tight">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  Jadwal & Filter Pengiriman Lapangan
                </h2>

                {/* Quick Date Filter Toggles */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDeliveryDate('')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
                      deliveryDate === ''
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Semua Order
                  </button>
                  <button
                    onClick={() => setDeliveryDate(todayStr)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
                      deliveryDate === todayStr
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Hari Ini ({todayStr})
                  </button>
                </div>
              </div>

              {/* Compact Filters Inputs */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Tanggal Delivery</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Filter Pasar</label>
                  <select
                    value={deliveryPasarFilter}
                    onChange={(e) => setDeliveryPasarFilter(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="SEMUA">Semua Pasar</option>
                    {uniqueMarkets.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Filter Status</label>
                  <select
                    value={deliveryStatusFilter}
                    onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="SEMUA">Semua Status</option>
                    <option value="BELUM_TERKIRIM">📦 Belum Terkirim</option>
                    <option value="Terkirim">✅ Terkirim Selesai</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery List - Flat Design with Horizontal Separator Lines (___) */}
            <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              {isLoadingData ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold">Mengambil data pengiriman...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Truck className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">Tidak ada pengiriman terdaftar pada tanggal/filter ini</p>
                  <button
                    onClick={() => setDeliveryDate('')}
                    className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-extrabold hover:bg-emerald-100"
                  >
                    Tampilkan Semua Order
                  </button>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const toko = tokos.find((t) => t.id === order.toko_id) || order.toko;
                  const isCOD = order.jenis_pembayaran?.toLowerCase().includes('cod');
                  const isTempo = order.jenis_pembayaran?.toLowerCase().includes('tempo');

                  return (
                    <div key={order.id} className="p-3.5 hover:bg-slate-50 transition-colors space-y-2">
                      <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 block">
                            {order.no_nota} • Tgl: {order.tanggal_pengiriman}
                          </span>
                          <h4 className="font-black text-sm text-slate-900 leading-tight">
                            {toko?.nama_toko || 'Toko Pelanggan'}
                          </h4>
                          <p className="text-[11px] font-bold text-emerald-800">
                            {toko?.lokasi_pasar} <span className="text-slate-500 font-normal">({toko?.nama_pemilik || '-'} - {toko?.no_hp || '-'})</span>
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black inline-block ${
                              order.status_pengiriman === 'Terkirim'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {order.status_pengiriman === 'Terkirim' ? '✓ Terkirim' : '📦 Dalam Proses'}
                          </span>

                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setSelectedSuratJalan(order)}
                              className="text-[11px] font-extrabold text-teal-700 hover:text-teal-900 underline"
                            >
                              🚚 Surat Jalan
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              onClick={() => setSelectedNota(order)}
                              className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-900 underline"
                            >
                              📄 Struk
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Items breakdown */}
                      <div className="text-xs space-y-1 bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                        {order.items?.map((item, idx) => {
                          const prod = products.find((p) => p.id === item.product_id) || item.product;
                          return (
                            <div key={idx} className="flex justify-between text-slate-800 text-[11px]">
                              <span className="font-bold">
                                {item.jumlah} {prod?.satuan || 'Pcs'} {prod?.nama_produk || 'Produk'}
                              </span>
                              <span className="font-extrabold text-slate-900">{formatIDR(item.subtotal)}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 flex-wrap gap-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              isCOD
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : isTempo
                                ? 'bg-rose-100 text-rose-800 font-bold'
                                : 'bg-emerald-100 text-emerald-800 font-bold'
                            }`}
                          >
                            {order.jenis_pembayaran}
                          </span>
                          <span className="text-[11px] font-extrabold text-slate-700">
                            ({order.status_pembayaran})
                          </span>
                        </div>

                        <span className="font-black text-emerald-800 text-sm">
                          {formatIDR(order.total_bayar)}
                        </span>
                      </div>

                      {/* Action Buttons: Konfirmasi Pengiriman & Ubah Nota */}
                      <div className="pt-2 flex items-center gap-2">
                        {order.status_pengiriman !== 'Terkirim' ? (
                          <button
                            onClick={() => setConfirmingOrder(order)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Konfirmasi Terkirim & Lunas</span>
                          </button>
                        ) : (
                          <span className="flex-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 px-2 rounded-xl text-center">
                            ✓ Diterima oleh: {order.penerima_nama || 'Pemilik Toko'}
                          </span>
                        )}

                        <button
                          onClick={() => setEditingOrder(order)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-extrabold rounded-xl text-xs flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Ubah Nota</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STOK BARANG */}
        {activeTab === 'stok' && (
          <div
            className="space-y-3"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) =>
              handleTouchEnd(
                e,
                () => setStockSubTab('histori_retur'),
                () => setStockSubTab('produk')
              )
            }
          >
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-tight">
                  <Package className="w-4 h-4 text-emerald-700" />
                  Stok & Batch FIFO Supplier
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">Restock Batch FIFO, Aset Uang Barang, & 3-Tier Harga</p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setIsFifoDashboardOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg text-xs shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aset & Laba FIFO</span>
                </button>

                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg text-xs shadow-xs"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>+ Restock Supplier</span>
                </button>

                <button
                  onClick={() => setIsReturnModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>+ Retur Barang</span>
                </button>

                <button
                  onClick={() => {
                    setEditingProduct({
                      nama_produk: '',
                      kode_sku: `SKU-${Date.now()}`,
                      satuan: 'Pcs',
                      harga_modal: 0,
                      harga_normal: 0,
                      harga_minimum: 0,
                      stok: 0,
                      category: 'Umum',
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Produk</span>
                </button>
              </div>
            </div>

            {/* Clean Underline Sub-tab Navigation for Tab Stok (Aligned with Sub-Tab Keuangan) */}
            <div className="flex items-center border-b border-slate-200 text-xs overflow-x-auto scrollbar-none mb-1 gap-1">
              <button
                onClick={() => setStockSubTab('produk')}
                className={`py-2 px-3 font-bold transition-all relative whitespace-nowrap text-center ${
                  stockSubTab === 'produk'
                    ? 'text-emerald-700 font-extrabold border-b-2 border-emerald-600 -mb-px'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📦 Katalog Produk ({products.length})
              </button>

              <button
                onClick={() => setStockSubTab('histori_retur')}
                className={`py-2 px-3 font-bold transition-all relative whitespace-nowrap text-center ${
                  stockSubTab === 'histori_retur'
                    ? 'text-emerald-700 font-extrabold border-b-2 border-emerald-600 -mb-px'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🔄 Histori Retur ({productReturns.length})
              </button>
            </div>

            {/* SUB-TAB 1: KATALOG & STOK PRODUK */}
            {stockSubTab === 'produk' && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-200">
                {isLoadingData ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs font-bold">Memuat data stok gudang...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-1">
                    <Package className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Belum ada data stok barang</p>
                  </div>
                ) : (
                  products.map((p) => (
                    <div key={p.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{p.nama_produk}</h4>
                          <p className="text-[11px] font-semibold text-slate-500">
                            SKU: <span className="font-mono text-slate-700">{p.kode_sku}</span> • Satuan: <span className="text-slate-900 font-bold">{p.satuan}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-black ${
                              p.stok > 10
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : p.stok > 0
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            Stok: {p.stok}
                          </span>

                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg border border-slate-200"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 3-Tier Price Badges Row */}
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-1">
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block">Modal:</span>
                          <span className="font-bold text-slate-700">{formatIDR(p.harga_modal)}</span>
                        </div>

                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block">Normal:</span>
                          <span className="font-bold text-slate-900">{formatIDR(p.harga_normal)}</span>
                        </div>

                        <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                          <span className="text-[10px] text-amber-800 font-bold block">Min Jual:</span>
                          <span className="font-black text-amber-900">{formatIDR(p.harga_minimum)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SUB-TAB 2: HISTORI RETUR BARANG & KLAIM PASAR */}
            {stockSubTab === 'histori_retur' && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 uppercase">
                      <RefreshCw className="w-4 h-4 text-amber-600" />
                      <span>Histori Retur & Klaim Barang Pasar ({productReturns.length})</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">Pencatatan barang bocor, expired, & tukar barang dari toko</p>
                  </div>

                  <span className="text-[11px] font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                    Total: {formatIDR(productReturns.reduce((sum, r) => sum + r.total_nilai, 0))}
                  </span>
                </div>

                {productReturns.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 space-y-1">
                    <RefreshCw className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">Belum ada riwayat transaksi retur barang</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 text-xs">
                    {productReturns.map((ret) => {
                      const toko = tokos.find((t) => t.id === ret.toko_id) || ret.toko;
                      const prod = products.find((p) => p.id === ret.product_id) || ret.product;
                      return (
                        <div key={ret.id} className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors rounded-lg px-1">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-sm">{toko?.nama_toko || 'Toko Pelanggan'}</span>
                              <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                                {ret.no_nota_retur || 'RET-001'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">Tgl: {ret.tanggal}</span>
                            </div>

                            <p className="text-xs font-extrabold text-slate-700">
                              {prod?.nama_produk || 'Produk'} • <strong className="text-slate-900">{ret.jumlah} {prod?.satuan || 'Pcs'}</strong> @ {formatIDR(ret.harga_nilai)}
                            </p>

                            <div className="flex items-center gap-2 text-[10px] flex-wrap pt-0.5">
                              <span className="px-2 py-0.5 rounded font-black bg-rose-100 text-rose-800 border border-rose-300">
                                Alasan: {ret.alasan}
                              </span>
                              <span className="px-2 py-0.5 rounded font-black bg-teal-100 text-teal-800 border border-teal-300">
                                Solusi: {ret.tindakan}
                              </span>
                            </div>

                            {ret.catatan && (
                              <p className="text-[11px] text-slate-500 italic">
                                Catatan: "{ret.catatan}"
                              </p>
                            )}
                          </div>

                          <div className="text-right space-y-1 shrink-0">
                            <span className="font-black text-amber-900 text-sm block">
                              {formatIDR(ret.total_nilai)}
                            </span>
                            <button
                              onClick={() => setSelectedNotaRetur(ret)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs flex items-center gap-1 ml-auto"
                            >
                              <span>📄 Struk Retur</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DAFTAR TOKO & PERFORMA */}
        {activeTab === 'toko' && (
          <div className="space-y-3">
            {/* Header & Filter */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <StoreIcon className="w-4 h-4 text-emerald-700" />
                  Daftar Toko & Performa Pelanggan
                </h2>

                <button
                  onClick={() => setIsTokoModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Toko Baru</span>
                </button>
              </div>

              {/* Search & Market Selector */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari toko / pemilik..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedMarketFilter}
                  onChange={(e) => setSelectedMarketFilter(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="SEMUA">Semua Pasar</option>
                  {uniqueMarkets.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List Toko Divided by horizontal lines ___ */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-200">
              {isLoadingData ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold">Mengambil data toko...</p>
                </div>
              ) : filteredTokoPerformances.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-1">
                  <StoreIcon className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Belum ada toko terdaftar</p>
                </div>
              ) : (
                filteredTokoPerformances.map((toko) => (
                  <TokoPerformanceCard
                    key={toko.id}
                    toko={toko}
                    tokoOrders={orders.filter((o) => o.toko_id === toko.id)}
                    onSelectForOrder={(t) => {
                      setSelectedTokoId(t.id);
                      setActiveTab('order');
                    }}
                    onEditToko={(t) => {
                      setEditingToko(t);
                      setIsTokoModalOpen(true);
                    }}
                    onOpenNota={(ord) => setSelectedNota(ord)}
                    onOpenReturnModal={(tokoId) => {
                      setSelectedTokoId(tokoId);
                      setIsReturnModalOpen(true);
                    }}
                    onOpenDetail={(t) => setSelectedTokoDetail(t)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: POS KEUANGAN SOLO (3 KANTONG, GRAFIK, HISTORI, KALENDER, TUTUP BUKU) */}
        {activeTab === 'keuangan' && (
          <div
            className="space-y-3"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) =>
              handleTouchEnd(e, handleFinanceSwipeLeft, handleFinanceSwipeRight)
            }
          >
            {/* Clean Underline Sub-Tabs Header (No Card) */}
            <div className="flex items-center border-b border-slate-200 text-xs overflow-x-auto scrollbar-none mb-1 gap-1">
              <button
                onClick={() => setFinanceSubTab('kantong')}
                className={`py-2 px-3 font-bold transition-all relative whitespace-nowrap text-center ${
                  financeSubTab === 'kantong'
                    ? 'text-emerald-700 font-extrabold border-b-2 border-emerald-600 -mb-px'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                3 Pos Kantong
              </button>

              <button
                onClick={() => setFinanceSubTab('statistik')}
                className={`py-2 px-3 font-bold transition-all relative whitespace-nowrap text-center ${
                  financeSubTab === 'statistik'
                    ? 'text-emerald-700 font-extrabold border-b-2 border-emerald-600 -mb-px'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Grafik & Analisis
              </button>

              <button
                onClick={() => setFinanceSubTab('histori')}
                className={`py-2 px-3 font-bold transition-all relative whitespace-nowrap text-center ${
                  financeSubTab === 'histori'
                    ? 'text-emerald-700 font-extrabold border-b-2 border-emerald-600 -mb-px'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Histori Transaksi
              </button>

              <button
                onClick={() => setFinanceSubTab('kalender')}
                className={`py-2 px-3 font-bold transition-all relative whitespace-nowrap text-center ${
                  financeSubTab === 'kalender'
                    ? 'text-emerald-700 font-extrabold border-b-2 border-emerald-600 -mb-px'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📅 Kalender Omset
              </button>

              <button
                onClick={() => setFinanceSubTab('tutup_buku')}
                className={`py-2 px-3 font-bold transition-all relative whitespace-nowrap text-center ${
                  financeSubTab === 'tutup_buku'
                    ? 'text-emerald-700 font-extrabold border-b-2 border-emerald-600 -mb-px'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📚 Tutup Buku & Export
              </button>
            </div>

            {/* Filter Periode Waktu (Hari Ini, Mingguan, Bulanan, Tahunan, Semua) */}
            {(financeSubTab === 'statistik' || financeSubTab === 'histori' || financeSubTab === 'tutup_buku') && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                <span className="font-extrabold text-slate-500 mr-1 shrink-0 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  Periode:
                </span>
                {[
                  { id: 'today', label: 'Hari Ini' },
                  { id: 'weekly', label: '7 Hari' },
                  { id: 'monthly', label: 'Bulan Ini' },
                  { id: 'yearly', label: 'Tahun Ini' },
                  { id: 'all', label: 'Semua' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setFinancePeriod(p.id as import('@/types').TimePeriod)}
                    className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition-all border ${
                      financePeriod === p.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* SUB-TAB 1: 3 POS KANTONG */}
            {financeSubTab === 'kantong' && (
              <div className="space-y-2.5 animate-fade-in">
                {/* Header Banner */}
                <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                      Kas Usaha Solo (Penjualan Lunas)
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {formatIDR(StoreManager.getSoloFinancialBuckets(orders, purchases, expenses, ownerDraws).totalOmsetLunas)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                      Solo Operator
                    </span>
                  </div>
                </div>

                {/* 3 Compact Pos Cards */}
                {(() => {
                  const buckets = StoreManager.getSoloFinancialBuckets(orders, purchases, expenses, ownerDraws);
                  return (
                    <div className="space-y-2">
                      {/* Pos 1: Belanja Stok */}
                      <div className="bg-white border border-emerald-300 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs uppercase">
                            <Package className="w-4 h-4 text-emerald-600" />
                            <span>1. Belanja Stok (80%)</span>
                          </div>
                          <h4 className="font-black text-lg text-slate-900 leading-tight">
                            {formatIDR(buckets.posModalBelanjaStok)}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Terpakai: {formatIDR(buckets.totalPembelianRestock)}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsPurchaseModalOpen(true)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Restock Supplier</span>
                        </button>
                      </div>

                      {/* Pos 2: Operasional Lapangan */}
                      <div className="bg-white border border-amber-300 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-xs uppercase">
                            <Fuel className="w-4 h-4 text-amber-600" />
                            <span>2. Operasional Lapangan (5%)</span>
                          </div>
                          <h4 className="font-black text-lg text-slate-900 leading-tight">
                            {formatIDR(buckets.posOperasional)}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Terpakai: {formatIDR(buckets.totalPengeluaranOperasional)}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsExpenseModalOpen(true)}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Catat Operasional</span>
                        </button>
                      </div>

                      {/* Pos 3: Gaji Pribadi Owner */}
                      <div className="bg-white border border-blue-300 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-xs uppercase">
                            <Wallet className="w-4 h-4 text-blue-600" />
                            <span>3. Gaji Pribadi Saya (15%)</span>
                          </div>
                          <h4 className="font-black text-lg text-slate-900 leading-tight">
                            {formatIDR(buckets.posGajiOwner)}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Ditarik: {formatIDR(buckets.totalPenarikanGaji)}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsOwnerDrawModalOpen(true)}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all shrink-0"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>+ Tarik Gaji Saya</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUB-TAB 2: STATISTIK & GRAFIK */}
            {financeSubTab === 'statistik' && (
              <div className="space-y-3 animate-fade-in">
                {/* Visual Allocation Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    Proporsi Alokasi Kas Usaha (100%)
                  </h4>

                  {/* Progress Bar */}
                  <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200">
                    <div className="h-full bg-emerald-600 text-[9px] font-black text-white flex items-center justify-center" style={{ width: '80%' }}>
                      80% Stok
                    </div>
                    <div className="h-full bg-amber-500 text-[9px] font-black text-white flex items-center justify-center" style={{ width: '5%' }}>
                      5%
                    </div>
                    <div className="h-full bg-blue-600 text-[9px] font-black text-white flex items-center justify-center" style={{ width: '15%' }}>
                      15% Gaji
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px] font-extrabold text-center pt-1">
                    <div className="text-emerald-700 bg-emerald-50 py-1 rounded-lg border border-emerald-200">📦 Stok: 80%</div>
                    <div className="text-amber-700 bg-amber-50 py-1 rounded-lg border border-amber-200">⛽ Ops: 5%</div>
                    <div className="text-blue-700 bg-blue-50 py-1 rounded-lg border border-blue-200">💵 Gaji: 15%</div>
                  </div>
                </div>

                {/* % Growth Financial Trend Cards */}
                {(() => {
                  const finGrowth = StoreManager.getFinancialGrowthAnalytics(purchases, expenses, ownerDraws, financePeriod);
                  return (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white border border-emerald-200 rounded-xl p-2.5 shadow-xs text-center space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase truncate">📦 Belanja Stok</span>
                        <h5 className="font-black text-slate-900 text-xs">{formatIDR(finGrowth.totalCurrentStock)}</h5>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${
                          finGrowth.stockGrowth >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {finGrowth.stockGrowth >= 0 ? '+' : ''}{finGrowth.stockGrowth}%
                        </span>
                      </div>

                      <div className="bg-white border border-amber-200 rounded-xl p-2.5 shadow-xs text-center space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase truncate">⛽ Operasional</span>
                        <h5 className="font-black text-slate-900 text-xs">{formatIDR(finGrowth.totalCurrentOps)}</h5>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${
                          finGrowth.opsGrowth >= 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {finGrowth.opsGrowth >= 0 ? '+' : ''}{finGrowth.opsGrowth}%
                        </span>
                      </div>

                      <div className="bg-white border border-blue-200 rounded-xl p-2.5 shadow-xs text-center space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase truncate">💵 Tarik Gaji</span>
                        <h5 className="font-black text-slate-900 text-xs">{formatIDR(finGrowth.totalCurrentGaji)}</h5>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${
                          finGrowth.gajiGrowth >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {finGrowth.gajiGrowth >= 0 ? '+' : ''}{finGrowth.gajiGrowth}%
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Efficiency Stat Cards */}
                {(() => {
                  const filteredOrders = StoreManager.filterByPeriod(orders, financePeriod, 'tanggal_pengiriman');
                  const filteredExpenses = StoreManager.filterByPeriod(expenses, financePeriod, 'tanggal');
                  const filteredReturns = StoreManager.filterByPeriod(productReturns, financePeriod, 'tanggal');

                  const grossOmsetPeriod = filteredOrders.filter((o) => o.status_pembayaran === 'Lunas').reduce((sum, o) => sum + o.total_bayar, 0);
                  const nonExchangeReturnsPeriod = filteredReturns
                    .filter((r) => r.tindakan === 'Potong Piutang Tempo' || r.tindakan === 'Potong Tagihan Cash')
                    .reduce((sum, r) => sum + r.total_nilai, 0);

                  const totalOmsetPeriod = Math.max(0, grossOmsetPeriod - nonExchangeReturnsPeriod);
                  const totalOpsPeriod = filteredExpenses.reduce((sum, e) => sum + e.nominal, 0);

                  const expPercent = totalOmsetPeriod > 0
                    ? ((totalOpsPeriod / totalOmsetPeriod) * 100).toFixed(1)
                    : '0';

                  const bensinExpenses = filteredExpenses
                    .filter((e) => e.kategori.includes('Bensin') || e.kategori.includes('BBM'))
                    .reduce((sum, e) => sum + e.nominal, 0);

                  const makanExpenses = filteredExpenses
                    .filter((e) => e.kategori.includes('Makan'))
                    .reduce((sum, e) => sum + e.nominal, 0);

                  const tolExpenses = filteredExpenses
                    .filter((e) => e.kategori.includes('Tol') || e.kategori.includes('Parkir'))
                    .reduce((sum, e) => sum + e.nominal, 0);

                  return (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Rasio Operasional</span>
                          <h4 className="text-base font-black text-amber-700">{expPercent}% Omset</h4>
                          <p className="text-[10px] text-slate-500">Beban biaya jalan periode ini</p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Pengeluaran Ops</span>
                          <h4 className="text-base font-black text-rose-700">{formatIDR(totalOpsPeriod)}</h4>
                          <p className="text-[10px] text-slate-500">Bensin, makan & tol</p>
                        </div>
                      </div>

                      {/* Expense Breakdown Category Cards */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
                        <h5 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-1 uppercase">
                          Rincian Biaya Operasional Lapangan ({financePeriod.toUpperCase()})
                        </h5>

                        <div className="space-y-2 text-xs">
                          <div>
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-bold text-slate-700 flex items-center gap-1">
                                ⛽ Bensin & BBM Motor/Mobil
                              </span>
                              <span className="font-black text-slate-900">{formatIDR(bensinExpenses)}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full"
                                style={{
                                  width: `${totalOpsPeriod > 0 ? (bensinExpenses / totalOpsPeriod) * 100 : 0}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-bold text-slate-700 flex items-center gap-1">
                                🍱 Uang Makan & Minum Lapangan
                              </span>
                              <span className="font-black text-slate-900">{formatIDR(makanExpenses)}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full"
                                style={{
                                  width: `${totalOpsPeriod > 0 ? (makanExpenses / totalOpsPeriod) * 100 : 0}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-bold text-slate-700 flex items-center gap-1">
                                🅿️ Tol, Parkir & Retribusi Pasar
                              </span>
                              <span className="font-black text-slate-900">{formatIDR(tolExpenses)}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full"
                                style={{
                                  width: `${totalOpsPeriod > 0 ? (tolExpenses / totalOpsPeriod) * 100 : 0}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUB-TAB 3: HISTORI TRANSAKSI */}
            {financeSubTab === 'histori' && (
              <div className="space-y-2.5 animate-fade-in">
                {(() => {
                  const filteredExpenses = StoreManager.filterByPeriod(expenses, financePeriod, 'tanggal');
                  const filteredDraws = StoreManager.filterByPeriod(ownerDraws, financePeriod, 'tanggal');
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Histori Operasional */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
                        <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5 uppercase">
                          <Fuel className="w-3.5 h-3.5 text-amber-600" />
                          Histori Operasional ({filteredExpenses.length})
                        </h4>

                        {filteredExpenses.length === 0 ? (
                          <p className="text-center py-6 text-[11px] text-slate-400 font-bold">Belum ada pengeluaran operasional</p>
                        ) : (
                          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                            {filteredExpenses.map((e) => (
                              <div key={e.id} className="py-2 flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-bold text-slate-900">{e.kategori}</p>
                                  <p className="text-[10px] text-slate-500">{e.keterangan || '-'} ({e.tanggal})</p>
                                </div>
                                <span className="font-black text-amber-700">{formatIDR(e.nominal)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Histori Penarikan Gaji */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
                        <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1.5 uppercase">
                          <Wallet className="w-3.5 h-3.5 text-blue-600" />
                          Histori Tarik Gaji Saya ({filteredDraws.length})
                        </h4>

                        {filteredDraws.length === 0 ? (
                          <p className="text-center py-6 text-[11px] text-slate-400 font-bold">Belum ada penarikan gaji pribadi</p>
                        ) : (
                          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                            {filteredDraws.map((d) => (
                              <div key={d.id} className="py-2 flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-bold text-slate-900">{d.catatan || 'Tarik Gaji Owner'}</p>
                                  <p className="text-[10px] text-slate-500">{d.tanggal}</p>
                                </div>
                                <span className="font-black text-blue-800">{formatIDR(d.nominal)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUB-TAB 4: KALENDER OMSET */}
            {financeSubTab === 'kalender' && (
              <div className="space-y-3 animate-fade-in">
                {/* Month Navigator Header */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
                  <button
                    onClick={() => {
                      const prev = new Date(calendarMonth);
                      prev.setMonth(prev.getMonth() - 1);
                      setCalendarMonth(prev);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {calendarMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </h4>
                    <p className="text-[10px] text-slate-500">Klik tanggal untuk rincian nota omset hari tersebut</p>
                  </div>
                  <button
                    onClick={() => {
                      const next = new Date(calendarMonth);
                      next.setMonth(next.getMonth() + 1);
                      setCalendarMonth(next);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Calendar 7-Column Grid */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
                  {/* Days Header */}
                  <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[11px] text-slate-500 border-b border-slate-100 pb-1.5">
                    <span>Min</span>
                    <span>Sen</span>
                    <span>Sel</span>
                    <span>Rab</span>
                    <span>Kam</span>
                    <span>Jum</span>
                    <span>Sab</span>
                  </div>

                  {/* Days Cells */}
                  {(() => {
                    const year = calendarMonth.getFullYear();
                    const month = calendarMonth.getMonth();
                    const firstDayIndex = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();

                    const cells = [];
                    for (let i = 0; i < firstDayIndex; i++) {
                      cells.push(<div key={`empty-${i}`} className="h-14 bg-slate-50/40 rounded-lg border border-transparent"></div>);
                    }

                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayOrders = orders.filter(
                        (o) => (o.tanggal_pengiriman === dateStr || (o.created_at && o.created_at.startsWith(dateStr))) && o.status_pembayaran === 'Lunas'
                      );
                      const totalOmsetDay = dayOrders.reduce((sum, o) => sum + o.total_bayar, 0);
                      const isSelected = selectedCalendarDate === dateStr;

                      cells.push(
                        <button
                          key={dateStr}
                          onClick={() => setSelectedCalendarDate(dateStr)}
                          className={`h-14 p-1 rounded-lg border text-left flex flex-col justify-between transition-all ${
                            isSelected
                              ? 'border-emerald-600 ring-2 ring-emerald-400 bg-emerald-50'
                              : totalOmsetDay > 0
                              ? 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-400'
                              : 'border-slate-100 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className={`text-[10px] font-black ${totalOmsetDay > 0 ? 'text-emerald-900' : 'text-slate-600'}`}>
                            {day}
                          </span>

                          {totalOmsetDay > 0 ? (
                            <span className="text-[9px] font-black text-emerald-800 bg-emerald-200/80 px-1 py-0.5 rounded leading-tight truncate">
                              {totalOmsetDay >= 1000000 ? `${(totalOmsetDay / 1000000).toFixed(1)}jt` : `${(totalOmsetDay / 1000).toFixed(0)}k`}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-300 font-medium">-</span>
                          )}
                        </button>
                      );
                    }

                    return <div className="grid grid-cols-7 gap-1">{cells}</div>;
                  })()}
                </div>

                {/* Selected Date Orders Box */}
                {selectedCalendarDate && (
                  <div className="bg-white border border-emerald-300 rounded-xl p-3 shadow-md space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        Rincian Omset Tanggal {selectedCalendarDate}
                      </h4>
                      <button
                        onClick={() => setSelectedCalendarDate(null)}
                        className="text-[10px] text-slate-400 hover:text-slate-700 font-bold"
                      >
                        Tutup
                      </button>
                    </div>

                    {(() => {
                      const dayOrders = orders.filter(
                        (o) => o.tanggal_pengiriman === selectedCalendarDate || (o.created_at && o.created_at.startsWith(selectedCalendarDate))
                      );
                      if (dayOrders.length === 0) {
                        return <p className="text-center py-4 text-xs text-slate-400 font-bold">Tidak ada transaksi pada tanggal ini</p>;
                      }
                      return (
                        <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                          {dayOrders.map((o) => (
                            <div key={o.id} className="py-2 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-extrabold text-slate-900">{o.toko?.nama_toko || 'Toko'}</p>
                                <p className="text-[10px] text-slate-500">
                                  {o.no_nota} • {o.jenis_pembayaran} ({o.status_pembayaran})
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-emerald-700 block">{formatIDR(o.total_bayar)}</span>
                                <button
                                  onClick={() => setSelectedNota(o)}
                                  className="text-[10px] text-emerald-600 hover:underline font-bold"
                                >
                                  Lihat Nota
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 5: TUTUP BUKU & EXPORT */}
            {financeSubTab === 'tutup_buku' && (
              <div className="space-y-3 animate-fade-in">
                {/* Export & Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleExportExcel}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / PDF</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Kirim WA</span>
                  </button>
                </div>

                {/* Rekap Tutup Buku Sheet */}
                {(() => {
                  const filteredOrders = StoreManager.filterByPeriod(orders, financePeriod, 'tanggal_pengiriman');
                  const filteredExpenses = StoreManager.filterByPeriod(expenses, financePeriod, 'tanggal');
                  const filteredPurchases = StoreManager.filterByPeriod(purchases, financePeriod, 'tanggal_beli');
                  const filteredDraws = StoreManager.filterByPeriod(ownerDraws, financePeriod, 'tanggal');
                  const filteredReturns = StoreManager.filterByPeriod(productReturns, financePeriod, 'tanggal');

                  const grossOmsetPeriod = filteredOrders
                    .filter((o) => o.status_pembayaran === 'Lunas')
                    .reduce((sum, o) => sum + o.total_bayar, 0);

                  const returnsDeduction = filteredReturns
                    .filter((r) => r.tindakan === 'Potong Piutang Tempo' || r.tindakan === 'Potong Tagihan Cash')
                    .reduce((sum, r) => sum + r.total_nilai, 0);

                  const totalOmsetLunasPeriod = Math.max(0, grossOmsetPeriod - returnsDeduction);

                  const totalRestockPeriod = filteredPurchases.reduce((sum, p) => sum + p.total_belanja, 0);
                  const totalOpsPeriod = filteredExpenses.reduce((sum, e) => sum + e.nominal, 0);
                  const totalGajiPeriod = filteredDraws.reduce((sum, d) => sum + d.nominal, 0);

                  const totalPengeluaranTotal = totalRestockPeriod + totalOpsPeriod + totalGajiPeriod;
                  const sisaSaldoPeriod = totalOmsetLunasPeriod - totalPengeluaranTotal;

                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                      <div className="border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Rekap Laporan Tutup Buku ({financePeriod.toUpperCase()})
                        </span>
                        <h3 className="text-lg font-black text-slate-900">{storeSettings.nama_usaha}</h3>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                          <span className="font-bold text-slate-700">1. Total Omset Penjualan Lunas</span>
                          <span className="font-black text-emerald-700">{formatIDR(totalOmsetLunasPeriod)}</span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                          <span className="font-bold text-slate-700">2. Belanja Restock Supplier</span>
                          <span className="font-black text-rose-600">- {formatIDR(totalRestockPeriod)}</span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                          <span className="font-bold text-slate-700">3. Biaya Operasional Lapangan</span>
                          <span className="font-black text-amber-700">- {formatIDR(totalOpsPeriod)}</span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                          <span className="font-bold text-slate-700">4. Penarikan Gaji Saya</span>
                          <span className="font-black text-blue-700">- {formatIDR(totalGajiPeriod)}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 text-sm">
                          <span className="font-black text-slate-900 uppercase">Sisa Saldo Kas Usaha:</span>
                          <span className={`font-black text-base ${sisaSaldoPeriod >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {formatIDR(sisaSaldoPeriod)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: DASHBOARD UTAMA */}
        {activeTab === 'dashboard' && (
          <div className="space-y-3">
            {(() => {
              const growth = StoreManager.getOmsetGrowth(orders);
              const topProducts = StoreManager.getTopProductsAnalytics(orders);
              return (
                <div className="space-y-3">
                  {/* Growth Banner */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-3.5 shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                        Pertumbuhan Omset (Bulan Ini vs Lalu)
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <h3 className="text-xl font-black text-white">{formatIDR(growth.currentOmset)}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black flex items-center gap-0.5 ${
                          growth.growthPercent >= 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {growth.growthPercent >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>{growth.growthPercent >= 0 ? '+' : ''}{growth.growthPercent}%</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Stat Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-500 block">Total Omset</span>
                      <h3 className="text-base font-black text-emerald-700">
                        {formatIDR(orders.reduce((sum, o) => sum + o.total_bayar, 0))}
                      </h3>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-500 block">Piutang Tempo</span>
                      <h3 className="text-base font-black text-rose-600">
                        {formatIDR(
                          orders
                            .filter((o) => o.jenis_pembayaran === 'Tempo' && o.status_pembayaran === 'Belum Lunas')
                            .reduce((sum, o) => sum + o.total_bayar, 0)
                        )}
                      </h3>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-500 block">Jadwal Hari Ini</span>
                      <h3 className="text-base font-black text-slate-900">
                        {orders.filter((o) => o.tanggal_pengiriman === todayStr).length} Toko
                      </h3>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-500 block">Total Toko</span>
                      <h3 className="text-base font-black text-slate-900">{tokos.length} Toko</h3>
                    </div>
                  </div>

                  {/* Visual Bar Chart (Omset 7 Hari Terakhir) */}
                  {(() => {
                    const chartData = StoreManager.getChartDailyData(orders);
                    const maxOmset = Math.max(...chartData.map((d) => d.omset), 1);
                    return (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
                        <h3 className="font-extrabold text-xs text-slate-900 flex items-center justify-between border-b border-slate-200 pb-1.5 uppercase">
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            Grafik Penjualan 7 Hari Terakhir
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">Lunas</span>
                        </h3>

                        <div className="pt-4 pb-1">
                          <div className="h-32 flex items-end justify-between gap-1.5 px-1">
                            {chartData.map((cd) => {
                              const heightPercent = Math.max(8, Math.round((cd.omset / maxOmset) * 100));
                              return (
                                <div key={cd.dateStr} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                                  <div className="text-[9px] font-black text-slate-700 bg-slate-100 px-1 py-0.5 rounded opacity-80 group-hover:opacity-100 whitespace-nowrap">
                                    {cd.omset >= 1000000 ? `${(cd.omset / 1000000).toFixed(1)}jt` : cd.omset > 0 ? `${(cd.omset / 1000).toFixed(0)}k` : '0'}
                                  </div>
                                  <div
                                    className={`w-full rounded-t-md transition-all ${
                                      cd.omset > 0 ? 'bg-emerald-600 group-hover:bg-emerald-500 shadow-xs' : 'bg-slate-100'
                                    }`}
                                    style={{ height: `${heightPercent}%` }}
                                  ></div>
                                  <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap mt-1">
                                    {cd.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Top Products Rank Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
                    <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5 uppercase">
                      <Award className="w-4 h-4 text-amber-600" />
                      Produk Paling Laris & Tren Penjualan
                    </h3>

                    {topProducts.length === 0 ? (
                      <p className="text-center py-4 text-xs text-slate-400 font-bold">Belum ada transaksi penjualan</p>
                    ) : (
                      <div className="space-y-2">
                        {topProducts.slice(0, 5).map((tp, idx) => {
                          const maxSales = topProducts[0].totalSales || 1;
                          const percent = Math.round((tp.totalSales / maxSales) * 100);
                          return (
                            <div key={tp.name} className="space-y-1 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center justify-center">
                                    #{idx + 1}
                                  </span>
                                  {tp.name}
                                </span>
                                <span className="font-black text-slate-900">
                                  {tp.totalQty} terjual • {formatIDR(tp.totalSales)}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Filtered Recent Orders List with Rekap Banner */}
            {(() => {
              const filteredOrders = StoreManager.filterByPeriod(orders, dashboardOrdersPeriod, 'tanggal_pengiriman');
              const totalFilteredOmset = filteredOrders.reduce((sum, o) => sum + o.total_bayar, 0);

              return (
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 uppercase">
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                      Riwayat Transaksi Nota ({filteredOrders.length})
                    </h3>

                    {/* Filter Period Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                      {[
                        { id: 'today', label: 'Hari Ini' },
                        { id: 'weekly', label: '7 Hari' },
                        { id: 'monthly', label: 'Bulan Ini' },
                        { id: 'all', label: 'Semua' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setDashboardOrdersPeriod(p.id as import('@/types').TimePeriod)}
                          className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap border transition-all ${
                            dashboardOrdersPeriod === p.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rekap Banner */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-900">Rekap Omset Filtered ({dashboardOrdersPeriod.toUpperCase()}):</span>
                    <span className="font-black text-emerald-700 text-sm">{formatIDR(totalFilteredOmset)}</span>
                  </div>

                  {/* Transaksi List */}
                  {filteredOrders.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400 font-bold">Tidak ada transaksi nota pada periode ini</p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {filteredOrders.map((o) => {
                        const toko = tokos.find((t) => t.id === o.toko_id) || o.toko;
                        return (
                          <div key={o.id} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-extrabold text-slate-900">{toko?.nama_toko || 'Toko'}</p>
                              <p className="text-[11px] text-slate-500">
                                {o.no_nota} • {o.jenis_pembayaran} ({o.status_pembayaran})
                              </p>
                            </div>
                            <div className="text-right space-y-0.5">
                              <p className="font-black text-emerald-800 text-xs">
                                {formatIDR(o.total_bayar)}
                              </p>
                              <button
                                onClick={() => setSelectedNota(o)}
                                className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1 ml-auto"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Nota</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* MODALS & DRAWERS */}
      <TokoModal
        isOpen={isTokoModalOpen}
        onClose={() => {
          setIsTokoModalOpen(false);
          setEditingToko(null);
        }}
        onSave={handleSaveToko}
        existingMarkets={uniqueMarkets}
        editingToko={editingToko}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        selectedToko={selectedToko}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onCheckout={handleCheckoutOrder}
        settings={storeSettings}
      />

      <DeliveryLoadSummaryModal
        isOpen={isLoadSummaryOpen}
        onClose={() => setIsLoadSummaryOpen(false)}
        targetDate={deliveryDate}
        targetPasar={deliveryPasarFilter}
        loadItems={loadItems}
      />

      <NotaModal
        isOpen={Boolean(selectedNota)}
        onClose={() => setSelectedNota(null)}
        order={selectedNota}
        onOpenEditNota={(ord) => setEditingOrder(ord)}
        settings={storeSettings}
      />

      <SuratJalanModal
        isOpen={Boolean(selectedSuratJalan)}
        onClose={() => setSelectedSuratJalan(null)}
        order={selectedSuratJalan}
        onOpenConfirmDelivery={(ord) => setConfirmingOrder(ord)}
        settings={storeSettings}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={storeSettings}
        onSaveSettings={(newSet) => {
          StoreManager.saveSettings(newSet);
          setStoreSettings(newSet);
        }}
      />

      <EditNotaModal
        isOpen={Boolean(editingOrder)}
        onClose={() => setEditingOrder(null)}
        order={editingOrder}
        onSaveEdit={handleSaveEditNota}
      />

      <ConfirmDeliveryModal
        isOpen={Boolean(confirmingOrder)}
        onClose={() => setConfirmingOrder(null)}
        order={confirmingOrder}
        onConfirm={handleConfirmDelivery}
      />

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        products={products}
        onSavePurchase={handleSavePurchase}
      />

      <FifoStockDashboardModal
        isOpen={isFifoDashboardOpen}
        onClose={() => setIsFifoDashboardOpen(false)}
        products={products}
        purchases={purchases}
        orders={orders}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSaveExpense={handleSaveExpense}
      />

      <OwnerDrawModal
        isOpen={isOwnerDrawModalOpen}
        onClose={() => setIsOwnerDrawModalOpen(false)}
        maxAvailableSalary={
          StoreManager.getSoloFinancialBuckets(orders, purchases, expenses, ownerDraws).posGajiOwner
        }
        onSaveOwnerDraw={handleSaveOwnerDraw}
      />

      {/* Edit / Add Product Modal */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-3 shadow-2xl text-slate-900">
            <h3 className="font-extrabold text-base text-emerald-700">
              {editingProduct.id ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Produk</label>
                <input
                  type="text"
                  value={editingProduct.nama_produk || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, nama_produk: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kode SKU</label>
                  <input
                    type="text"
                    value={editingProduct.kode_sku || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, kode_sku: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Satuan</label>
                  <input
                    type="text"
                    placeholder="Dus (12 Pcs)"
                    value={editingProduct.satuan || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, satuan: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Modal</label>
                  <input
                    type="number"
                    value={editingProduct.harga_modal || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        harga_modal: Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Normal</label>
                  <input
                    type="number"
                    value={editingProduct.harga_normal || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        harga_normal: Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-amber-800 font-bold mb-1">Min. Jual</label>
                  <input
                    type="number"
                    value={editingProduct.harga_minimum || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        harga_minimum: Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1.5 bg-white border border-amber-400 rounded-xl text-amber-900 font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stok Awal</label>
                  <input
                    type="number"
                    value={editingProduct.stok || 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stok: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Kategori</label>
                  <input
                    type="text"
                    value={editingProduct.category || 'Umum'}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-3 py-1.5 text-slate-600 font-bold hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-extrabold rounded-xl shadow-sm"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        tokos={tokos}
        products={products}
        defaultTokoId={selectedTokoId}
        onSaveReturn={handleSaveReturn}
      />

      {/* Printable Nota Retur Modal */}
      <NotaReturModal
        isOpen={!!selectedNotaRetur}
        onClose={() => setSelectedNotaRetur(null)}
        productReturn={selectedNotaRetur}
        tokos={tokos}
        products={products}
        settings={storeSettings}
      />

      {/* Toko Full Detail Modal */}
      <TokoDetailModal
        isOpen={!!selectedTokoDetail}
        onClose={() => setSelectedTokoDetail(null)}
        toko={selectedTokoDetail}
        orders={orders}
        returns={productReturns}
        products={products}
        onSelectForOrder={(t: Toko) => {
          setSelectedTokoId(t.id);
          setActiveTab('order');
        }}
        onOpenReturnModal={(tokoId: string) => {
          setSelectedTokoId(tokoId);
          setIsReturnModalOpen(true);
        }}
        onEditToko={(t: Toko) => {
          setEditingToko(t);
          setIsTokoModalOpen(true);
        }}
        onOpenNota={(ord: Order) => setSelectedNota(ord)}
        onOpenNotaRetur={(ret: ProductReturn) => setSelectedNotaRetur(ret)}
      />
    </div>
  );
}
