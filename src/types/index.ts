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
