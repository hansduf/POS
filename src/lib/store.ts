import { Toko, Product, Order, OrderItem, OrderLog, TokoPerformance, DeliveryLoadItem, StoreSettings } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  TOKOS: 'pos_canvass_tokos_cache',
  PRODUCTS: 'pos_canvass_products_cache',
  ORDERS: 'pos_canvass_orders_cache',
  LOGS: 'pos_canvass_logs_cache',
  SETTINGS: 'pos_canvass_settings_cache',
  PURCHASES: 'pos_canvass_purchases_cache',
};

export const DEFAULT_SETTINGS: StoreSettings = {
  nama_usaha: 'DISTRIBUTOR JOSJIS',
  alamat_usaha: 'Jl. Sidorejo 7, Gupolo, Kec. Babadan, Kabupaten Ponorogo, Jawa Timur 63491',
  no_telp: '08993179345',
  nama_pemilik: 'Farhan',
  bank_name: 'BANK BCA / BANK MANDIRI',
  bank_account: 'Belum tersedia',
  bank_an: 'DISTRIBUTOR JOSJIS',
  catatan_faktur:
    'PEMBAYARAN DENGAN CHEQUE / BG / TRANSFER DIANGGAP LUNAS, APABILA SUDAH DAPAT DIUANGKAN / REKENING KAMI TERCATAT LUNAS.',
};

export const getLocalTodayStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export class StoreManager {
  static clearLocalCache(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TOKOS);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.LOGS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    }
  }

  // --- SETTINGS (SUPABASE DB PERSISTENCE) ---
  static async fetchSettings(): Promise<StoreSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 'default')
          .single();

        if (!error && data) {
          const settings: StoreSettings = {
            nama_usaha: data.nama_usaha || DEFAULT_SETTINGS.nama_usaha,
            alamat_usaha: data.alamat_usaha || DEFAULT_SETTINGS.alamat_usaha,
            no_telp: data.no_telp || DEFAULT_SETTINGS.no_telp,
            nama_pemilik: data.nama_pemilik || DEFAULT_SETTINGS.nama_pemilik,
            bank_name: data.bank_name || DEFAULT_SETTINGS.bank_name,
            bank_account: data.bank_account || DEFAULT_SETTINGS.bank_account,
            bank_an: data.bank_an || DEFAULT_SETTINGS.bank_an,
            catatan_faktur: data.catatan_faktur || DEFAULT_SETTINGS.catatan_faktur,
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
          }
          return settings;
        } else if (error) {
          console.warn('Supabase store_settings error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase store_settings fetch warning:', err);
      }
    }
    return this.getSettingsCache();
  }

  static getSettingsCache(): StoreSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  }

  static getSettings(): StoreSettings {
    return this.getSettingsCache();
  }

  static async saveSettings(settings: StoreSettings): Promise<StoreSettings> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('store_settings')
          .upsert({
            id: 'default',
            nama_usaha: settings.nama_usaha,
            alamat_usaha: settings.alamat_usaha,
            no_telp: settings.no_telp,
            nama_pemilik: settings.nama_pemilik,
            bank_name: settings.bank_name,
            bank_account: settings.bank_account,
            bank_an: settings.bank_an,
            catatan_faktur: settings.catatan_faktur,
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('Supabase save settings error:', err);
      }
    }
    return settings;
  }

  // --- TOKOS ---
  static async fetchTokos(): Promise<Toko[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('tokos')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.TOKOS, JSON.stringify(data));
          }
          return data as Toko[];
        } else if (error) {
          console.warn('Supabase fetch tokos error:', error.message);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.TOKOS);
          }
          return [];
        }
      } catch (err) {
        console.warn('Supabase tokos fetch warning:', err);
      }
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.TOKOS);
      if (stored) return JSON.parse(stored);
    }
    return [];
  }

  static getTokosCache(): Toko[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TOKOS);
    return stored ? JSON.parse(stored) : [];
  }

  static async saveToko(toko: Omit<Toko, 'id' | 'created_at'>): Promise<Toko> {
    const newToko: Toko = {
      ...toko,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'toko-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('tokos')
          .insert([{
            nama_toko: newToko.nama_toko,
            lokasi_pasar: newToko.lokasi_pasar,
            nama_pemilik: newToko.nama_pemilik,
            no_hp: newToko.no_hp,
            lokasi_rumah: newToko.lokasi_rumah,
            catatan: newToko.catatan,
          }])
          .select()
          .single();

        if (!error && data) {
          const cache = this.getTokosCache();
          const updated = [data as Toko, ...cache];
          localStorage.setItem(STORAGE_KEYS.TOKOS, JSON.stringify(updated));
          return data as Toko;
        }
      } catch (err) {
        console.warn('Supabase save toko error:', err);
      }
    }

    const cache = this.getTokosCache();
    const updated = [newToko, ...cache];
    localStorage.setItem(STORAGE_KEYS.TOKOS, JSON.stringify(updated));
    return newToko;
  }

  static async updateToko(id: string, payload: Partial<Toko>): Promise<Toko | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('tokos')
          .update({
            nama_toko: payload.nama_toko,
            lokasi_pasar: payload.lokasi_pasar,
            nama_pemilik: payload.nama_pemilik,
            no_hp: payload.no_hp,
            lokasi_rumah: payload.lokasi_rumah,
            catatan: payload.catatan,
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const cache = this.getTokosCache();
          const updated = cache.map((t) => (t.id === id ? (data as Toko) : t));
          localStorage.setItem(STORAGE_KEYS.TOKOS, JSON.stringify(updated));
          return data as Toko;
        }
      } catch (err) {
        console.warn('Supabase update toko error:', err);
      }
    }

    const cache = this.getTokosCache();
    const idx = cache.findIndex((t) => t.id === id);
    if (idx > -1) {
      const updatedToko = { ...cache[idx], ...payload };
      cache[idx] = updatedToko;
      localStorage.setItem(STORAGE_KEYS.TOKOS, JSON.stringify(cache));
      return updatedToko;
    }
    return null;
  }

  // --- PRODUCTS ---
  static async fetchProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('nama_produk', { ascending: true });

        if (!error && data) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
          }
          return data as Product[];
        } else if (error) {
          console.warn('Supabase fetch products error:', error.message);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
          }
          return [];
        }
      } catch (err) {
        console.warn('Supabase products fetch warning:', err);
      }
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) return JSON.parse(stored);
    }
    return [];
  }

  static getProductsCache(): Product[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return stored ? JSON.parse(stored) : [];
  }

  static async saveProduct(product: Partial<Product>): Promise<Product> {
    const products = this.getProductsCache();
    const isEdit = Boolean(product.id);

    const payload = {
      nama_produk: product.nama_produk,
      kode_sku: product.kode_sku || `SKU-${Date.now()}`,
      satuan: product.satuan || 'Pcs',
      harga_modal: product.harga_modal || 0,
      harga_normal: product.harga_normal || 0,
      harga_minimum: product.harga_minimum || 0,
      stok: product.stok || 0,
      category: product.category || 'Umum',
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (isEdit) {
          const { data, error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', product.id!)
            .select()
            .single();
          if (!error && data) {
            const updatedList = products.map((p) => (p.id === data.id ? (data as Product) : p));
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));
            return data as Product;
          }
        } else {
          const { data, error } = await supabase
            .from('products')
            .insert([payload])
            .select()
            .single();
          if (!error && data) {
            const updatedList = [data as Product, ...products];
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));
            return data as Product;
          }
        }
      } catch (err) {
        console.warn('Supabase product save error:', err);
      }
    }

    const fallbackProduct: Product = {
      id: product.id || 'prod-' + Date.now(),
      nama_produk: payload.nama_produk || 'Produk Baru',
      kode_sku: payload.kode_sku,
      satuan: payload.satuan,
      harga_modal: payload.harga_modal,
      harga_normal: payload.harga_normal,
      harga_minimum: payload.harga_minimum,
      stok: payload.stok,
      category: payload.category,
      created_at: new Date().toISOString(),
      updated_at: payload.updated_at,
    };

    const updatedList = isEdit
      ? products.map((p) => (p.id === fallbackProduct.id ? fallbackProduct : p))
      : [fallbackProduct, ...products];

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedList));
    return fallbackProduct;
  }

  static async updateStock(productId: string, qtyDelta: number): Promise<void> {
    const products = this.getProductsCache();
    const target = products.find((p) => p.id === productId);
    if (target) {
      const newStock = Math.max(0, target.stok + qtyDelta);
      await this.saveProduct({ ...target, stok: newStock });
    }
  }

  // --- ORDERS & ORDER LOGS WITH SUPABASE RPC ---
  static async fetchOrders(): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, toko:tokos(*), items:order_items(*, product:products(*)), logs:order_logs(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
          }
          return data as Order[];
        } else if (error) {
          console.warn('Supabase fetch orders error:', error.message);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.ORDERS);
          }
          return [];
        }
      } catch (err) {
        console.warn('Supabase orders fetch warning:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
    }
    return [];
  }

  static getOrdersCache(): Order[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
  }

  // Uses Supabase RPC: create_order_rpc
  static async createOrder(orderData: Omit<Order, 'id' | 'no_nota' | 'created_at'>): Promise<Order> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const noNota = `INV-${datePart}-${randomNum}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const itemsPayload = (orderData.items || []).map((i) => ({
          product_id: i.product_id,
          jumlah: i.jumlah,
          harga_deal: i.harga_deal,
          subtotal: i.subtotal,
        }));

        // Call RPC Stored Procedure
        const { data: rpcOrderId, error: rpcErr } = await supabase.rpc('create_order_rpc', {
          p_no_nota: noNota,
          p_toko_id: orderData.toko_id,
          p_total_bayar: orderData.total_bayar,
          p_jenis_pembayaran: orderData.jenis_pembayaran,
          p_status_pembayaran: orderData.status_pembayaran,
          p_tanggal_pengiriman: orderData.tanggal_pengiriman,
          p_status_pengiriman: orderData.status_pengiriman,
          p_catatan_pengiriman: orderData.catatan_pengiriman || '',
          p_items: itemsPayload,
        });

        if (!rpcErr && rpcOrderId) {
          const refreshedOrders = await this.fetchOrders();
          const created = refreshedOrders.find((o) => o.id === rpcOrderId);
          if (created) return created;
        } else if (rpcErr) {
          console.warn('RPC create_order_rpc fallback to direct query:', rpcErr);
          // Fallback direct query if RPC is not run in SQL Editor yet
          const { data: orderRes } = await supabase
            .from('orders')
            .insert([{
              no_nota: noNota,
              toko_id: orderData.toko_id,
              total_bayar: orderData.total_bayar,
              jenis_pembayaran: orderData.jenis_pembayaran,
              status_pembayaran: orderData.status_pembayaran,
              tanggal_pengiriman: orderData.tanggal_pengiriman,
              status_pengiriman: orderData.status_pengiriman,
              catatan_pengiriman: orderData.catatan_pengiriman,
            }])
            .select('*, toko:tokos(*)')
            .single();

          if (orderRes) {
            if (orderData.items && orderData.items.length > 0) {
              const directItems = orderData.items.map((i) => ({
                order_id: orderRes.id,
                product_id: i.product_id,
                jumlah: i.jumlah,
                harga_deal: i.harga_deal,
                subtotal: i.subtotal,
              }));
              await supabase.from('order_items').insert(directItems);
            }
            await supabase.from('order_logs').insert([{
              order_id: orderRes.id,
              catatan_perubahan: `Nota ${noNota} dibuat`,
            }]);
            const refreshed = await this.fetchOrders();
            return refreshed.find((o) => o.id === orderRes.id) || (orderRes as Order);
          }
        }
      } catch (err) {
        console.warn('Supabase create order error:', err);
      }
    }

    // Fallback Local
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      no_nota: noNota,
      created_at: new Date().toISOString(),
      logs: [
        {
          id: 'log-' + Date.now(),
          order_id: 'ord-' + Date.now(),
          catatan_perubahan: `Nota ${noNota} dibuat`,
          created_at: new Date().toISOString(),
        },
      ],
    };

    if (newOrder.items) {
      for (const item of newOrder.items) {
        await this.updateStock(item.product_id, -item.jumlah);
      }
    }

    const orders = this.getOrdersCache();
    const updated = [newOrder, ...orders];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return newOrder;
  }

  // Uses Supabase RPC: update_order_rpc
  static async updateOrderWithLog(
    orderId: string,
    updatedData: {
      total_bayar?: number;
      jenis_pembayaran?: Order['jenis_pembayaran'];
      status_pembayaran?: Order['status_pembayaran'];
      status_pengiriman?: Order['status_pengiriman'];
      tanggal_pengiriman?: string;
      catatan_pengiriman?: string;
      items?: OrderItem[];
    },
    logMessage: string
  ): Promise<Order | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const itemsPayload = updatedData.items
          ? updatedData.items.map((i) => ({
              product_id: i.product_id,
              jumlah: i.jumlah,
              harga_deal: i.harga_deal,
              subtotal: i.subtotal,
            }))
          : null;

        const { error: rpcErr } = await supabase.rpc('update_order_rpc', {
          p_order_id: orderId,
          p_total_bayar: updatedData.total_bayar || null,
          p_jenis_pembayaran: updatedData.jenis_pembayaran || null,
          p_status_pembayaran: updatedData.status_pembayaran || null,
          p_status_pengiriman: updatedData.status_pengiriman || null,
          p_tanggal_pengiriman: updatedData.tanggal_pengiriman || null,
          p_catatan_pengiriman: updatedData.catatan_pengiriman || null,
          p_items: itemsPayload,
          p_log_message: logMessage,
        });

        if (!rpcErr) {
          const refreshedOrders = await this.fetchOrders();
          return refreshedOrders.find((o) => o.id === orderId) || null;
        } else {
          // Direct fallback if RPC not installed yet
          await supabase
            .from('orders')
            .update({
              total_bayar: updatedData.total_bayar,
              jenis_pembayaran: updatedData.jenis_pembayaran,
              status_pembayaran: updatedData.status_pembayaran,
              status_pengiriman: updatedData.status_pengiriman,
              tanggal_pengiriman: updatedData.tanggal_pengiriman,
              catatan_pengiriman: updatedData.catatan_pengiriman,
            })
            .eq('id', orderId);

          if (updatedData.items) {
            await supabase.from('order_items').delete().eq('order_id', orderId);
            const directItems = updatedData.items.map((i) => ({
              order_id: orderId,
              product_id: i.product_id,
              jumlah: i.jumlah,
              harga_deal: i.harga_deal,
              subtotal: i.subtotal,
            }));
            await supabase.from('order_items').insert(directItems);
          }

          await supabase.from('order_logs').insert([{
            order_id: orderId,
            catatan_perubahan: logMessage,
          }]);

          const refreshedOrders = await this.fetchOrders();
          return refreshedOrders.find((o) => o.id === orderId) || null;
        }
      } catch (err) {
        console.warn('Supabase update order log error:', err);
      }
    }

    // Local fallback
    const orders = this.getOrdersCache();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    const newLog: OrderLog = {
      id: 'log-' + Date.now(),
      order_id: orderId,
      catatan_perubahan: logMessage,
      created_at: new Date().toISOString(),
    };

    const target = orders[idx];
    const updatedOrder: Order = {
      ...target,
      ...updatedData,
      logs: [newLog, ...(target.logs || [])],
    };

    orders[idx] = updatedOrder;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return updatedOrder;
  }

  // Uses Supabase RPC: confirm_delivery_rpc
  static async confirmDelivery(
    orderId: string,
    penerimaNama: string,
    catatan?: string
  ): Promise<Order | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: rpcErr } = await supabase.rpc('confirm_delivery_rpc', {
          p_order_id: orderId,
          p_penerima_nama: penerimaNama,
          p_catatan: catatan || '',
        });

        if (!rpcErr) {
          const refreshedOrders = await this.fetchOrders();
          return refreshedOrders.find((o) => o.id === orderId) || null;
        }
      } catch (err) {
        console.warn('Supabase RPC confirm delivery error, using fallback:', err);
      }
    }

    const logMsg = `Pengiriman Dikonfirmasi & Terkirim (Penerima: ${penerimaNama}${catatan ? `, Catatan: ${catatan}` : ''})`;
    return this.updateOrderWithLog(
      orderId,
      { status_pengiriman: 'Terkirim', status_pembayaran: 'Lunas' },
      logMsg
    );
  }

  // --- ANALYTICS ---
  static getTokoPerformancesFromData(tokos: Toko[], orders: Order[]): TokoPerformance[] {
    return tokos.map((toko) => {
      const tokoOrders = orders.filter((o) => o.toko_id === toko.id);
      const total_omset = tokoOrders.reduce((sum, o) => sum + o.total_bayar, 0);
      const total_orders = tokoOrders.length;

      const sisa_piutang = tokoOrders
        .filter((o) => o.jenis_pembayaran === 'Tempo' && o.status_pembayaran === 'Belum Lunas')
        .reduce((sum, o) => sum + o.total_bayar, 0);

      const sortedOrders = [...tokoOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        ...toko,
        total_omset,
        total_orders,
        sisa_piutang,
        last_order_date: sortedOrders[0]?.created_at,
      };
    });
  }

  static getDeliveryLoadItemsFromData(
    orders: Order[],
    tokos: Toko[],
    products: Product[],
    targetDate: string,
    targetPasar?: string
  ): DeliveryLoadItem[] {
    const filteredOrders = orders.filter((o) => {
      const isDateMatch = o.tanggal_pengiriman === targetDate;
      const isNotCanceled = o.status_pengiriman !== 'Batal';
      if (!isDateMatch || !isNotCanceled) return false;

      if (targetPasar && targetPasar !== 'SEMUA') {
        const toko = tokos.find((t) => t.id === o.toko_id);
        return toko?.lokasi_pasar === targetPasar;
      }
      return true;
    });

    const loadMap: Record<string, DeliveryLoadItem> = {};

    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const product = products.find((p) => p.id === item.product_id);
        const name = product?.nama_produk || 'Produk ID ' + item.product_id;
        const unit = product?.satuan || 'Pcs';

        if (!loadMap[item.product_id]) {
          loadMap[item.product_id] = {
            product_id: item.product_id,
            nama_produk: name,
            satuan: unit,
            total_jumlah: 0,
          };
        }
        loadMap[item.product_id].total_jumlah += item.jumlah;
      });
    });

    return Object.values(loadMap);
  }

  // --- PURCHASES & FIFO BATCH MANAGEMENT ---
  static async fetchPurchases(): Promise<import('@/types').Purchase[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select('*, product:products(*)')
          .order('tanggal_beli', { ascending: false });

        if (!error && data) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(data));
          }
          return data as import('@/types').Purchase[];
        } else if (error) {
          console.warn('Supabase fetch purchases error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase purchases fetch warning:', err);
      }
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      if (stored) return JSON.parse(stored);
    }
    return [];
  }

  static getPurchasesCache(): import('@/types').Purchase[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return stored ? JSON.parse(stored) : [];
  }

  static async savePurchase(purchaseData: {
    product_id: string;
    supplier_nama: string;
    jumlah_masuk: number;
    harga_modal_beli: number;
    tanggal_beli: string;
  }): Promise<import('@/types').Purchase | null> {
    const totalBelanja = purchaseData.jumlah_masuk * purchaseData.harga_modal_beli;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: rpcId, error: rpcErr } = await supabase.rpc('restock_product_rpc', {
          p_product_id: purchaseData.product_id,
          p_supplier_nama: purchaseData.supplier_nama || 'Supplier Utama',
          p_jumlah_masuk: purchaseData.jumlah_masuk,
          p_harga_modal_beli: purchaseData.harga_modal_beli,
          p_tanggal_beli: purchaseData.tanggal_beli,
        });

        if (!rpcErr && rpcId) {
          const refreshedPurchases = await this.fetchPurchases();
          await this.fetchProducts();
          return refreshedPurchases.find((p) => p.id === rpcId) || null;
        } else if (rpcErr) {
          console.warn('RPC restock_product_rpc fallback to direct query:', rpcErr);
          const { data: directRes } = await supabase
            .from('purchases')
            .insert([{
              product_id: purchaseData.product_id,
              supplier_nama: purchaseData.supplier_nama,
              jumlah_masuk: purchaseData.jumlah_masuk,
              sisa_stok: purchaseData.jumlah_masuk,
              harga_modal_beli: purchaseData.harga_modal_beli,
              total_belanja: totalBelanja,
              tanggal_beli: purchaseData.tanggal_beli,
            }])
            .select('*, product:products(*)')
            .single();

          if (directRes) {
            await this.updateStock(purchaseData.product_id, purchaseData.jumlah_masuk);
            return directRes as import('@/types').Purchase;
          }
        }
      } catch (err) {
        console.warn('Supabase save purchase error:', err);
      }
    }

    await this.updateStock(purchaseData.product_id, purchaseData.jumlah_masuk);
    const newPurchase: import('@/types').Purchase = {
      id: 'purch-' + Date.now(),
      product_id: purchaseData.product_id,
      supplier_nama: purchaseData.supplier_nama,
      jumlah_masuk: purchaseData.jumlah_masuk,
      sisa_stok: purchaseData.jumlah_masuk,
      harga_modal_beli: purchaseData.harga_modal_beli,
      total_belanja: totalBelanja,
      tanggal_beli: purchaseData.tanggal_beli,
      created_at: new Date().toISOString(),
    };
    const cache = this.getPurchasesCache();
    const updated = [newPurchase, ...cache];
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(updated));
    return newPurchase;
  }

  static getFifoAssetSummary(
    products: Product[],
    purchases: import('@/types').Purchase[],
    orders: Order[]
  ): import('@/types').FifoAssetSummary {
    let totalAsetModalStok = 0;
    if (purchases && purchases.length > 0) {
      totalAsetModalStok = purchases.reduce((sum, p) => sum + (p.sisa_stok * p.harga_modal_beli), 0);
    } else {
      totalAsetModalStok = products.reduce((sum, p) => sum + (p.stok * p.harga_modal), 0);
    }

    const totalPotensiOmset = products.reduce((sum, p) => sum + (p.stok * p.harga_normal), 0);
    const potensiMarginGudang = Math.max(0, totalPotensiOmset - totalAsetModalStok);

    const completedOrders = orders.filter((o) => o.status_pembayaran === 'Lunas');
    const totalLunasOmset = completedOrders.reduce((sum, o) => sum + o.total_bayar, 0);

    let totalHppLunasFifo = 0;
    completedOrders.forEach((o) => {
      o.items?.forEach((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        const modalPrice = prod ? prod.harga_modal : (item.harga_deal * 0.85);
        totalHppLunasFifo += item.jumlah * modalPrice;
      });
    });

    const labaBersihPasti = Math.max(0, totalLunasOmset - totalHppLunasFifo);

    return {
      totalAsetModalStok,
      totalPotensiOmset,
      potensiMarginGudang,
      totalLunasOmset,
      totalHppLunasFifo,
      labaBersihPasti,
    };
  }
}
