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
  Store as StoreIcon,
  Package,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Edit2,
  FileText,
  Printer,
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

  // Expenses, Owner Draws & Solo Finance States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ownerDraws, setOwnerDraws] = useState<OwnerDraw[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isOwnerDrawModalOpen, setIsOwnerDrawModalOpen] = useState(false);
  const [isSoloFinanceOpen, setIsSoloFinanceOpen] = useState(false);

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
      ] = await Promise.all([
        StoreManager.fetchTokos(),
        StoreManager.fetchProducts(),
        StoreManager.fetchOrders(),
        StoreManager.fetchSettings(),
        StoreManager.fetchPurchases(),
        StoreManager.fetchExpenses(),
        StoreManager.fetchOwnerDraws(),
      ]);

      setTokos(loadedTokos);
      setProducts(loadedProducts);
      setOrders(loadedOrders);
      setStoreSettings(loadedSettings);
      setPurchases(loadedPurchases);
      setExpenses(loadedExpenses);
      setOwnerDraws(loadedOwnerDraws);

      if (loadedTokos.length > 0 && !selectedTokoId) {
        setSelectedTokoId(loadedTokos[0].id);
      }
    } catch (err) {
      console.warn('Error refreshing data from Supabase:', err);
    } finally {
      setIsLoadingData(false);
    }
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

  const todayDeliveryCount = useMemo(() => {
    return orders.filter(
      (o) => o.tanggal_pengiriman === todayStr && o.status_pengiriman !== 'Terkirim'
    ).length;
  }, [orders, todayStr]);

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
    return StoreManager.getTokoPerformancesFromData(tokos, orders);
  }, [tokos, orders]);

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
      const matchDate = !deliveryDate || o.tanggal_pengiriman === deliveryDate;
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
        onOpenSoloFinance={() => setIsSoloFinanceOpen(true)}
        settings={storeSettings}
      />

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
                  <p className="text-xs font-bold">Mengambil data dari Supabase...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-1">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Tidak ada produk ditemukan di Supabase</p>
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
                  {formatIDR(
                    orders
                      .filter(
                        (o) =>
                          (!deliveryDate || o.tanggal_pengiriman === deliveryDate) &&
                          o.status_pembayaran === 'Lunas' &&
                          o.status_pengiriman === 'Terkirim'
                      )
                      .reduce((sum, o) => sum + o.total_bayar, 0)
                  )}
                </h4>
              </div>

              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 block">📦 Status Terkirim</span>
                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  {orders.filter((o) => (!deliveryDate || o.tanggal_pengiriman === deliveryDate) && o.status_pengiriman === 'Terkirim').length} / {orders.filter((o) => !deliveryDate || o.tanggal_pengiriman === deliveryDate).length} Toko
                </h4>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-amber-50 border border-amber-200 p-3 rounded-xl shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-900 block">⌛ Belum Terkirim</span>
                  <h4 className="text-sm sm:text-base font-black text-amber-900">
                    {orders.filter((o) => (!deliveryDate || o.tanggal_pengiriman === deliveryDate) && o.status_pengiriman !== 'Terkirim' && o.status_pengiriman !== 'Batal').length} Order
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
          <div className="space-y-3">
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

            {/* Product Mobile Card List (Zero Horizontal Scroll) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-200">
              {isLoadingData ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold">Mengambil data stok dari Supabase...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-1">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Belum ada data stok di Supabase</p>
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
                  Daftar Toko & Performa (Supabase DB)
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
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: DASHBOARD UTAMA */}
        {activeTab === 'dashboard' && (
          <div className="space-y-3">
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

            {/* Recent Orders List */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
              <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                Riwayat Transaksi Terbaru
              </h3>

              <div className="divide-y divide-slate-200">
                {orders.slice(0, 8).map((o) => {
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
            </div>
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

      <SoloFinancialDashboardModal
        isOpen={isSoloFinanceOpen}
        onClose={() => setIsSoloFinanceOpen(false)}
        orders={orders}
        purchases={purchases}
        expenses={expenses}
        ownerDraws={ownerDraws}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)}
        onOpenOwnerDrawModal={() => setIsOwnerDrawModalOpen(true)}
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
    </div>
  );
}
