export interface Toko {
  id: string;
  nama_toko: string;
  lokasi_pasar: string;
  nama_pemilik: string;
  no_hp: string;
  lokasi_rumah?: string;
  catatan?: string;
  created_at: string;
}

export interface Product {
  id: string;
  nama_produk: string;
  kode_sku: string;
  satuan: string;
  harga_modal: number;
  harga_normal: number;
  harga_minimum: number;
  stok: number;
  category: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type JenisPembayaran =
  | 'Cash (Lunas Depan)'
  | 'COD (Bayar saat Diantar)'
  | 'Tempo (Piutang)'
  | 'Transfer (Lunas Depan)'
  | 'Cash'
  | 'Tempo'
  | 'Transfer'
  | string;

export type StatusPembayaran = 'Lunas' | 'Belum Lunas';
export type StatusPengiriman = 'Disiapkan' | 'Siap Kirim' | 'Terkirim' | 'Batal';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product?: Product;
  jumlah: number;
  harga_deal: number;
  subtotal: number;
}

export interface OrderLog {
  id: string;
  order_id: string;
  catatan_perubahan: string;
  perubahan_by?: string;
  created_at: string;
}

export interface Order {
  id: string;
  no_nota: string;
  toko_id: string;
  toko?: Toko;
  total_bayar: number;
  jenis_pembayaran: JenisPembayaran;
  status_pembayaran: StatusPembayaran;
  tanggal_pengiriman: string; // YYYY-MM-DD
  status_pengiriman: StatusPengiriman;
  catatan_pengiriman?: string;
  penerima_nama?: string;
  tanggal_diterima?: string;
  created_at: string;
  items?: OrderItem[];
  logs?: OrderLog[];
}

export interface TokoPerformance extends Toko {
  total_omset: number;
  total_orders: number;
  sisa_piutang: number;
  last_order_date?: string;
}

export interface DeliveryLoadItem {
  product_id: string;
  nama_produk: string;
  satuan: string;
  total_jumlah: number;
}

export interface StoreSettings {
  nama_usaha: string;
  alamat_usaha: string;
  no_telp: string;
  nama_pemilik: string;
  bank_name: string;
  bank_account: string;
  bank_an: string;
  catatan_faktur: string;
}

export interface Purchase {
  id: string;
  product_id: string;
  product?: Product;
  supplier_nama: string;
  jumlah_masuk: number;
  sisa_stok: number;
  harga_modal_beli: number;
  total_belanja: number;
  tanggal_beli: string;
  created_at?: string;
}

export interface FifoAssetSummary {
  totalAsetModalStok: number;
  totalPotensiOmset: number;
  potensiMarginGudang: number;
  totalLunasOmset: number;
  totalHppLunasFifo: number;
  labaBersihPasti: number;
}

export type ExpenseKategori =
  | 'Bensin / BBM'
  | 'Makan & Minum Lapangan'
  | 'Tol, Parkir & Retribusi'
  | 'Perawatan & Servis Armada'
  | 'Operasional Lainnya';

export interface Expense {
  id: string;
  kategori: ExpenseKategori | string;
  nominal: number;
  keterangan: string;
  tanggal: string;
  created_at?: string;
}

export interface OwnerDraw {
  id: string;
  nominal: number;
  catatan: string;
  tanggal: string;
  created_at?: string;
}

export interface SoloFinancialBuckets {
  totalOmsetLunas: number;
  posModalBelanjaStok: number;
  posOperasional: number;
  posGajiOwner: number;
  totalPengeluaranOperasional: number;
  totalPenarikanGaji: number;
  totalPembelianRestock: number;
}

export type TimePeriod = 'today' | 'weekly' | 'monthly' | 'yearly' | 'all';

