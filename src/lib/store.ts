import { Toko, Product, Order, OrderItem, OrderLog, TokoPerformance, DeliveryLoadItem, StoreSettings } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if in non-secure context
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const STORAGE_KEYS = {
  TOKOS: 'pos_canvass_tokos_cache',
  PRODUCTS: 'pos_canvass_products_cache',
  ORDERS: 'pos_canvass_orders_cache',
  LOGS: 'pos_canvass_logs_cache',
  SETTINGS: 'pos_canvass_settings_cache',
  PURCHASES: 'pos_canvass_purchases_cache',
  EXPENSES: 'pos_canvass_expenses_cache',
  OWNER_DRAWS: 'pos_canvass_owner_draws_cache',
  RETURNS: 'pos_canvass_returns_cache',
  QUEUE_TOKOS: 'pos_canvass_queue_tokos',
  QUEUE_ORDERS: 'pos_canvass_queue_orders',
  QUEUE_EXPENSES: 'pos_canvass_queue_expenses',
  QUEUE_DRAWS: 'pos_canvass_queue_draws',
  QUEUE_PURCHASES: 'pos_canvass_queue_purchases',
  QUEUE_RETURNS: 'pos_canvass_queue_returns',
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
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return this.getTokosCache();
    }
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
          console.warn('Supabase fetch tokos warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase tokos fetch warning:', err);
      }
    }
    return this.getTokosCache();
  }

  static getTokosCache(): Toko[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TOKOS);
    return stored ? JSON.parse(stored) : [];
  }

  static async saveToko(toko: Omit<Toko, 'id' | 'created_at'>): Promise<Toko> {
    const newToko: Toko = {
      ...toko,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('tokos')
          .insert([{
            id: newToko.id,
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

    if (typeof window !== 'undefined') {
      const qStr = localStorage.getItem(STORAGE_KEYS.QUEUE_TOKOS);
      const qList = qStr ? JSON.parse(qStr) : [];
      qList.push(newToko);
      localStorage.setItem(STORAGE_KEYS.QUEUE_TOKOS, JSON.stringify(qList));
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
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return this.getProductsCache();
    }
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
          console.warn('Supabase fetch products warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase products fetch warning:', err);
      }
    }
    return this.getProductsCache();
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
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return this.getOrdersCache();
    }
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
          console.warn('Supabase fetch orders warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase orders fetch warning:', err);
      }
    }
    return this.getOrdersCache();
  }

  static getOrdersCache(): Order[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const cachedOrders: Order[] = stored ? JSON.parse(stored) : [];

    const queueStr = localStorage.getItem(STORAGE_KEYS.QUEUE_ORDERS);
    if (queueStr) {
      try {
        const queue: Order[] = JSON.parse(queueStr);
        const existingIds = new Set(cachedOrders.map((o) => o.id));
        queue.forEach((q) => {
          if (!existingIds.has(q.id)) {
            cachedOrders.unshift(q);
          }
        });
      } catch (err) {
        console.warn('Queue orders parse warning:', err);
      }
    }
    return cachedOrders;
  }

  static async syncOfflineQueue(): Promise<{ syncedOrders: number; syncedExpenses: number; syncedDraws: number; syncedPurchases: number; syncedReturns: number }> {
    if (typeof window === 'undefined' || !navigator.onLine || !isSupabaseConfigured || !supabase) {
      return { syncedOrders: 0, syncedExpenses: 0, syncedDraws: 0, syncedPurchases: 0, syncedReturns: 0 };
    }

    let syncedOrders = 0;
    let syncedExpenses = 0;
    let syncedDraws = 0;
    let syncedPurchases = 0;

    // 0. Sync Tokos Queue FIRST so foreign key constraints are satisfied!
    const tokosQueueStr = localStorage.getItem(STORAGE_KEYS.QUEUE_TOKOS);
    if (tokosQueueStr) {
      try {
        const tokosQueue: Toko[] = JSON.parse(tokosQueueStr);
        const remainingTokos: Toko[] = [];
        for (const tk of tokosQueue) {
          try {
            const { error } = await supabase.from('tokos').insert([{
              id: tk.id,
              nama_toko: tk.nama_toko,
              lokasi_pasar: tk.lokasi_pasar,
              nama_pemilik: tk.nama_pemilik,
              no_hp: tk.no_hp,
              lokasi_rumah: tk.lokasi_rumah,
              catatan: tk.catatan,
            }]);
            if (error) remainingTokos.push(tk);
          } catch {
            remainingTokos.push(tk);
          }
        }
        if (remainingTokos.length > 0) localStorage.setItem(STORAGE_KEYS.QUEUE_TOKOS, JSON.stringify(remainingTokos));
        else localStorage.removeItem(STORAGE_KEYS.QUEUE_TOKOS);
      } catch (err) {
        console.warn('Queue tokos parse error:', err);
      }
    }

    // 1. Sync Orders Queue
    const ordersQueueStr = localStorage.getItem(STORAGE_KEYS.QUEUE_ORDERS);
    if (ordersQueueStr) {
      try {
        const ordersQueue: Order[] = JSON.parse(ordersQueueStr);
        const remainingOrders: Order[] = [];

        for (const ord of ordersQueue) {
          try {
            const itemsPayload = (ord.items || []).map((i) => ({
              product_id: i.product_id,
              jumlah: i.jumlah,
              harga_deal: i.harga_deal,
              subtotal: i.subtotal,
            }));

            const { data: rpcId, error: rpcErr } = await supabase.rpc('create_order_rpc', {
              p_no_nota: ord.no_nota,
              p_toko_id: ord.toko_id,
              p_total_bayar: ord.total_bayar,
              p_jenis_pembayaran: ord.jenis_pembayaran,
              p_status_pembayaran: ord.status_pembayaran,
              p_tanggal_pengiriman: ord.tanggal_pengiriman,
              p_status_pengiriman: ord.status_pengiriman,
              p_catatan_pengiriman: ord.catatan_pengiriman || '',
              p_items: itemsPayload,
            });

            if (!rpcErr && rpcId) {
              syncedOrders++;
            } else {
              const { data: orderRes, error: insErr } = await supabase
                .from('orders')
                .insert([{
                  no_nota: ord.no_nota,
                  toko_id: ord.toko_id,
                  total_bayar: ord.total_bayar,
                  jenis_pembayaran: ord.jenis_pembayaran,
                  status_pembayaran: ord.status_pembayaran,
                  tanggal_pengiriman: ord.tanggal_pengiriman,
                  status_pengiriman: ord.status_pengiriman,
                  catatan_pengiriman: ord.catatan_pengiriman,
                }])
                .select()
                .single();

              if (!insErr && orderRes) {
                if (ord.items && ord.items.length > 0) {
                  const directItems = ord.items.map((i) => ({
                    order_id: orderRes.id,
                    product_id: i.product_id,
                    jumlah: i.jumlah,
                    harga_deal: i.harga_deal,
                    subtotal: i.subtotal,
                  }));
                  await supabase.from('order_items').insert(directItems);
                }
                syncedOrders++;
              } else {
                remainingOrders.push(ord);
              }
            }
          } catch (err) {
            console.warn('Error syncing order item:', err);
            remainingOrders.push(ord);
          }
        }

        if (remainingOrders.length > 0) {
          localStorage.setItem(STORAGE_KEYS.QUEUE_ORDERS, JSON.stringify(remainingOrders));
        } else {
          localStorage.removeItem(STORAGE_KEYS.QUEUE_ORDERS);
        }
      } catch (err) {
        console.warn('Queue orders parse error:', err);
      }
    }

    // 2. Sync Expenses Queue
    const expQueueStr = localStorage.getItem(STORAGE_KEYS.QUEUE_EXPENSES);
    if (expQueueStr) {
      try {
        const expQueue = JSON.parse(expQueueStr);
        const remainingExp = [];
        for (const exp of expQueue) {
          const { error } = await supabase.from('expenses').insert([{
            kategori: exp.kategori,
            nominal: exp.nominal,
            keterangan: exp.keterangan,
            tanggal: exp.tanggal,
          }]);
          if (!error) syncedExpenses++;
          else remainingExp.push(exp);
        }
        if (remainingExp.length > 0) localStorage.setItem(STORAGE_KEYS.QUEUE_EXPENSES, JSON.stringify(remainingExp));
        else localStorage.removeItem(STORAGE_KEYS.QUEUE_EXPENSES);
      } catch (err) {
        console.warn('Queue expenses parse error:', err);
      }
    }

    // 3. Sync Owner Draws Queue
    const drawQueueStr = localStorage.getItem(STORAGE_KEYS.QUEUE_DRAWS);
    if (drawQueueStr) {
      try {
        const drawQueue = JSON.parse(drawQueueStr);
        const remainingDraws = [];
        for (const draw of drawQueue) {
          const { error } = await supabase.from('owner_draws').insert([{
            nominal: draw.nominal,
            catatan: draw.catatan,
            tanggal: draw.tanggal,
          }]);
          if (!error) syncedDraws++;
          else remainingDraws.push(draw);
        }
        if (remainingDraws.length > 0) localStorage.setItem(STORAGE_KEYS.QUEUE_DRAWS, JSON.stringify(remainingDraws));
        else localStorage.removeItem(STORAGE_KEYS.QUEUE_DRAWS);
      } catch (err) {
        console.warn('Queue draws parse error:', err);
      }
    }

    // 4. Sync Purchases Queue
    const purchQueueStr = localStorage.getItem(STORAGE_KEYS.QUEUE_PURCHASES);
    if (purchQueueStr) {
      try {
        const purchQueue = JSON.parse(purchQueueStr);
        const remainingPurch = [];
        for (const purch of purchQueue) {
          const { error } = await supabase.rpc('restock_product_rpc', {
            p_product_id: purch.product_id,
            p_supplier_nama: purch.supplier_nama || 'Supplier Utama',
            p_jumlah_masuk: purch.jumlah_masuk,
            p_harga_modal_beli: purch.harga_modal_beli,
            p_tanggal_beli: purch.tanggal_beli,
          });
          if (!error) syncedPurchases++;
          else remainingPurch.push(purch);
        }
        if (remainingPurch.length > 0) localStorage.setItem(STORAGE_KEYS.QUEUE_PURCHASES, JSON.stringify(remainingPurch));
        else localStorage.removeItem(STORAGE_KEYS.QUEUE_PURCHASES);
      } catch (err) {
        console.warn('Queue purchases parse error:', err);
      }
    }

    // 5. Sync Returns Queue
    let syncedReturns = 0;
    const retQueueStr = localStorage.getItem(STORAGE_KEYS.QUEUE_RETURNS);
    if (retQueueStr) {
      try {
        const retQueue = JSON.parse(retQueueStr);
        const remainingRet = [];
        for (const ret of retQueue) {
          const { error } = await supabase.from('product_returns').insert([{
            id: ret.id,
            no_nota_retur: ret.no_nota_retur,
            toko_id: ret.toko_id,
            product_id: ret.product_id,
            jumlah: ret.jumlah,
            harga_nilai: ret.harga_nilai,
            total_nilai: ret.total_nilai,
            alasan: ret.alasan,
            tindakan: ret.tindakan,
            catatan: ret.catatan || '',
            tanggal: ret.tanggal,
          }]);
          if (!error) syncedReturns++;
          else remainingRet.push(ret);
        }
        if (remainingRet.length > 0) localStorage.setItem(STORAGE_KEYS.QUEUE_RETURNS, JSON.stringify(remainingRet));
        else localStorage.removeItem(STORAGE_KEYS.QUEUE_RETURNS);
      } catch (err) {
        console.warn('Queue returns parse error:', err);
      }
    }

    return { syncedOrders, syncedExpenses, syncedDraws, syncedPurchases, syncedReturns };
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
    const newOrderId = generateUUID();
    const newOrder: Order = {
      ...orderData,
      id: newOrderId,
      no_nota: noNota,
      created_at: new Date().toISOString(),
      logs: [
        {
          id: generateUUID(),
          order_id: newOrderId,
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

    if (typeof window !== 'undefined') {
      const existingQueueStr = localStorage.getItem(STORAGE_KEYS.QUEUE_ORDERS);
      const existingQueue: Order[] = existingQueueStr ? JSON.parse(existingQueueStr) : [];
      existingQueue.push(newOrder);
      localStorage.setItem(STORAGE_KEYS.QUEUE_ORDERS, JSON.stringify(existingQueue));
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
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return this.getPurchasesCache();
    }
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
    return this.getPurchasesCache();
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

    if (typeof window !== 'undefined') {
      const qStr = localStorage.getItem(STORAGE_KEYS.QUEUE_PURCHASES);
      const qList = qStr ? JSON.parse(qStr) : [];
      qList.push(purchaseData);
      localStorage.setItem(STORAGE_KEYS.QUEUE_PURCHASES, JSON.stringify(qList));
    }

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

  // --- EXPENSES (Pengeluaran Operasional) ---
  static async fetchExpenses(): Promise<import('@/types').Expense[]> {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return stored ? JSON.parse(stored) : [];
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('tanggal', { ascending: false });

        if (!error && data) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data));
          }
          return data as import('@/types').Expense[];
        }
      } catch (err) {
        console.warn('Supabase fetch expenses error:', err);
      }
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (stored) return JSON.parse(stored);
    }
    return [];
  }

  static async saveExpense(expenseData: Omit<import('@/types').Expense, 'id'>): Promise<import('@/types').Expense> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .insert([expenseData])
          .select('*')
          .single();

        if (!error && data) {
          await this.fetchExpenses();
          return data as import('@/types').Expense;
        }
      } catch (err) {
        console.warn('Supabase save expense error:', err);
      }
    }

    const newExp: import('@/types').Expense = {
      id: 'exp-' + Date.now(),
      ...expenseData,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const qStr = localStorage.getItem(STORAGE_KEYS.QUEUE_EXPENSES);
      const qList = qStr ? JSON.parse(qStr) : [];
      qList.push(expenseData);
      localStorage.setItem(STORAGE_KEYS.QUEUE_EXPENSES, JSON.stringify(qList));
    }

    const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const list = stored ? JSON.parse(stored) : [];
    const updated = [newExp, ...list];
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    return newExp;
  }

  // --- OWNER DRAWS (Penarikan Gaji Owner) ---
  static async fetchOwnerDraws(): Promise<import('@/types').OwnerDraw[]> {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      const stored = localStorage.getItem(STORAGE_KEYS.OWNER_DRAWS);
      return stored ? JSON.parse(stored) : [];
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('owner_draws')
          .select('*')
          .order('tanggal', { ascending: false });

        if (!error && data) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.OWNER_DRAWS, JSON.stringify(data));
          }
          return data as import('@/types').OwnerDraw[];
        }
      } catch (err) {
        console.warn('Supabase fetch owner draws error:', err);
      }
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.OWNER_DRAWS);
      if (stored) return JSON.parse(stored);
    }
    return [];
  }

  static async saveOwnerDraw(drawData: Omit<import('@/types').OwnerDraw, 'id'>): Promise<import('@/types').OwnerDraw> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('owner_draws')
          .insert([drawData])
          .select('*')
          .single();

        if (!error && data) {
          await this.fetchOwnerDraws();
          return data as import('@/types').OwnerDraw;
        }
      } catch (err) {
        console.warn('Supabase save owner draw error:', err);
      }
    }

    const newDraw: import('@/types').OwnerDraw = {
      id: 'draw-' + Date.now(),
      ...drawData,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const qStr = localStorage.getItem(STORAGE_KEYS.QUEUE_DRAWS);
      const qList = qStr ? JSON.parse(qStr) : [];
      qList.push(drawData);
      localStorage.setItem(STORAGE_KEYS.QUEUE_DRAWS, JSON.stringify(qList));
    }

    const stored = localStorage.getItem(STORAGE_KEYS.OWNER_DRAWS);
    const list = stored ? JSON.parse(stored) : [];
    const updated = [newDraw, ...list];
    localStorage.setItem(STORAGE_KEYS.OWNER_DRAWS, JSON.stringify(updated));
    return newDraw;
  }

  // --- SOLO FINANCIAL BUCKETS CALCULATION ---
  static getSoloFinancialBuckets(
    orders: Order[],
    purchases: import('@/types').Purchase[],
    expenses: import('@/types').Expense[],
    ownerDraws: import('@/types').OwnerDraw[]
  ): import('@/types').SoloFinancialBuckets {
    const lunasOrders = orders.filter((o) => o.status_pembayaran === 'Lunas');
    const totalOmsetLunas = lunasOrders.reduce((sum, o) => sum + o.total_bayar, 0);

    const totalPembelianRestock = purchases.reduce((sum, p) => sum + p.total_belanja, 0);
    const totalPengeluaranOperasional = expenses.reduce((sum, e) => sum + e.nominal, 0);
    const totalPenarikanGaji = ownerDraws.reduce((sum, d) => sum + d.nominal, 0);

    const posModalBelanjaStok = Math.max(0, (totalOmsetLunas * 0.80) - totalPembelianRestock);
    const posOperasional = Math.max(0, (totalOmsetLunas * 0.05) - totalPengeluaranOperasional);
    const posGajiOwner = Math.max(0, (totalOmsetLunas * 0.15) - totalPenarikanGaji);

    return {
      totalOmsetLunas,
      posModalBelanjaStok,
      posOperasional,
      posGajiOwner,
      totalPengeluaranOperasional,
      totalPenarikanGaji,
      totalPembelianRestock,
    };
  }

  // --- TIME PERIOD FILTER HELPER ---
  static filterByPeriod<T>(items: T[], period: import('@/types').TimePeriod, dateField: keyof T): T[] {
    if (period === 'all') return items;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return items.filter((item) => {
      const val = String(item[dateField] || '');
      if (!val) return false;
      const itemDateStr = val.substring(0, 10);
      const itemDate = new Date(itemDateStr);

      if (period === 'today') {
        return itemDateStr === todayStr;
      }

      if (period === 'weekly') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return itemDate >= sevenDaysAgo && itemDate <= now;
      }

      if (period === 'monthly') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }

      if (period === 'yearly') {
        return itemDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }

  // --- DASHBOARD ANALYTICS & GROWTH HELPER ---
  static getOmsetGrowth(orders: Order[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let currentOmset = 0;
    let previousOmset = 0;

    orders.forEach((o) => {
      const val = o.tanggal_pengiriman || o.created_at;
      if (!val) return;
      const d = new Date(val);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        currentOmset += o.total_bayar;
      } else if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
        previousOmset += o.total_bayar;
      }
    });

    const growthPercent = previousOmset > 0
      ? Number((((currentOmset - previousOmset) / previousOmset) * 100).toFixed(1))
      : currentOmset > 0 ? 100 : 0;

    return { currentOmset, previousOmset, growthPercent };
  }

  static getTopProductsAnalytics(orders: Order[]) {
    const map = new Map<string, { name: string; totalQty: number; totalSales: number }>();

    orders.forEach((o) => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const name = item.product?.nama_produk || 'Produk';
          const existing = map.get(name) || { name, totalQty: 0, totalSales: 0 };
          existing.totalQty += item.jumlah;
          existing.totalSales += item.subtotal;
          map.set(name, existing);
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSales - a.totalSales);
  }

  static getFinancialGrowthAnalytics(
    purchases: import('@/types').Purchase[],
    expenses: import('@/types').Expense[],
    ownerDraws: import('@/types').OwnerDraw[],
    period: import('@/types').TimePeriod
  ) {
    const currentExpenses = this.filterByPeriod(expenses, period, 'tanggal');
    const currentPurchases = this.filterByPeriod(purchases, period, 'tanggal_beli');
    const currentDraws = this.filterByPeriod(ownerDraws, period, 'tanggal');

    const totalCurrentOps = currentExpenses.reduce((sum, e) => sum + e.nominal, 0);
    const totalCurrentStock = currentPurchases.reduce((sum, p) => sum + p.total_belanja, 0);
    const totalCurrentGaji = currentDraws.reduce((sum, d) => sum + d.nominal, 0);

    const allOps = expenses.reduce((sum, e) => sum + e.nominal, 0);
    const prevOps = Math.max(0, allOps - totalCurrentOps);
    const opsGrowth = prevOps > 0 ? Number((((totalCurrentOps - prevOps) / prevOps) * 100).toFixed(1)) : totalCurrentOps > 0 ? 100 : 0;

    const allStock = purchases.reduce((sum, p) => sum + p.total_belanja, 0);
    const prevStock = Math.max(0, allStock - totalCurrentStock);
    const stockGrowth = prevStock > 0 ? Number((((totalCurrentStock - prevStock) / prevStock) * 100).toFixed(1)) : totalCurrentStock > 0 ? 100 : 0;

    const allGaji = ownerDraws.reduce((sum, d) => sum + d.nominal, 0);
    const prevGaji = Math.max(0, allGaji - totalCurrentGaji);
    const gajiGrowth = prevGaji > 0 ? Number((((totalCurrentGaji - prevGaji) / prevGaji) * 100).toFixed(1)) : totalCurrentGaji > 0 ? 100 : 0;

    return {
      totalCurrentOps,
      opsGrowth,
      totalCurrentStock,
      stockGrowth,
      totalCurrentGaji,
      gajiGrowth,
    };
  }

  static getChartDailyData(orders: Order[]) {
    const map = new Map<string, number>();
    const last7Days: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push(dateStr);
      map.set(dateStr, 0);
    }

    orders.forEach((o) => {
      if (o.status_pembayaran === 'Lunas') {
        const val = o.tanggal_pengiriman || (o.created_at ? o.created_at.substring(0, 10) : '');
        if (map.has(val)) {
          map.set(val, (map.get(val) || 0) + o.total_bayar);
        }
      }
    });

    return last7Days.map((dateStr) => {
      const d = new Date(dateStr);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      return {
        dateStr,
        label,
        omset: map.get(dateStr) || 0,
      };
    });
  }

  // --- PRODUCT RETURNS (Retur Barang & Tukar Produk) ---
  static async fetchReturns(): Promise<import('@/types').ProductReturn[]> {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return this.getReturnsCache();
    }
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('product_returns')
          .select('*, toko:tokos(*), product:products(*)')
          .order('tanggal', { ascending: false });

        if (!error && data) {
          const queueStr = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.QUEUE_RETURNS) : null;
          let merged = data as import('@/types').ProductReturn[];
          if (queueStr) {
            try {
              const queue: import('@/types').ProductReturn[] = JSON.parse(queueStr);
              const existingIds = new Set(merged.map((r) => r.id));
              queue.forEach((q) => {
                if (!existingIds.has(q.id)) {
                  merged.unshift(q);
                }
              });
            } catch (err) {
              console.warn('Queue returns parse warning:', err);
            }
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(merged));
          }
          return merged;
        }
      } catch (err) {
        console.warn('Supabase fetch returns error:', err);
      }
    }
    return this.getReturnsCache();
  }

  static getReturnsCache(): import('@/types').ProductReturn[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.RETURNS);
    const cachedReturns: import('@/types').ProductReturn[] = stored ? JSON.parse(stored) : [];

    const queueStr = localStorage.getItem(STORAGE_KEYS.QUEUE_RETURNS);
    if (queueStr) {
      try {
        const queue: import('@/types').ProductReturn[] = JSON.parse(queueStr);
        const existingIds = new Set(cachedReturns.map((r) => r.id));
        queue.forEach((q) => {
          if (!existingIds.has(q.id)) {
            cachedReturns.unshift(q);
          }
        });
      } catch (err) {
        console.warn('Queue returns parse warning:', err);
      }
    }
    return cachedReturns;
  }

  static async saveReturn(returnData: Omit<import('@/types').ProductReturn, 'id' | 'created_at'>): Promise<import('@/types').ProductReturn> {
    const newReturnId = generateUUID();
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const noNotaRetur = returnData.no_nota_retur || `RET-${datePart}-${randomNum}`;

    const newReturn: import('@/types').ProductReturn = {
      ...returnData,
      id: newReturnId,
      no_nota_retur: noNotaRetur,
      created_at: new Date().toISOString(),
    };

    // If Tukar Barang Baru, deduct replacement product stock automatically
    if (returnData.tindakan === 'Tukar Barang Baru') {
      await this.updateStock(returnData.product_id, -returnData.jumlah);
    }

    // Automatically create corresponding Order entry for replacement delivery or record in Tab Pengiriman
    try {
      const delivDate = returnData.tanggal_pengiriman_pengganti || returnData.tanggal;
      const delivStatus: import('@/types').StatusPengiriman =
        returnData.status_pengiriman_pengganti ||
        (returnData.tindakan === 'Tukar Barang Baru' ? 'Siap Kirim' : 'Terkirim');

      await this.createOrder({
        toko_id: returnData.toko_id,
        total_bayar: returnData.total_nilai,
        jenis_pembayaran: `Retur (${returnData.tindakan})`,
        status_pembayaran: 'Lunas',
        tanggal_pengiriman: delivDate,
        status_pengiriman: delivStatus,
        catatan_pengiriman: `[RETUR BARANG ${noNotaRetur}] Alasan: ${returnData.alasan} • ${returnData.catatan || ''}`,
        items: [
          {
            product_id: returnData.product_id,
            jumlah: returnData.jumlah,
            harga_deal: returnData.harga_nilai,
            subtotal: returnData.total_nilai,
          },
        ],
      });
    } catch (err) {
      console.warn('Error creating corresponding order for return:', err);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('product_returns')
          .insert([{
            id: newReturnId,
            no_nota_retur: noNotaRetur,
            toko_id: returnData.toko_id,
            product_id: returnData.product_id,
            jumlah: returnData.jumlah,
            harga_nilai: returnData.harga_nilai,
            total_nilai: returnData.total_nilai,
            alasan: returnData.alasan,
            tindakan: returnData.tindakan,
            catatan: returnData.catatan || '',
            tanggal: returnData.tanggal,
          }])
          .select('*, toko:tokos(*), product:products(*)')
          .single();

        if (!error && data) {
          await this.fetchReturns();
          return data as import('@/types').ProductReturn;
        }
      } catch (err) {
        console.warn('Supabase save return error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const qStr = localStorage.getItem(STORAGE_KEYS.QUEUE_RETURNS);
      const qList = qStr ? JSON.parse(qStr) : [];
      qList.push(newReturn);
      localStorage.setItem(STORAGE_KEYS.QUEUE_RETURNS, JSON.stringify(qList));
    }

    const list = this.getReturnsCache();
    const updated = [newReturn, ...list];
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(updated));
    return newReturn;
  }
}
