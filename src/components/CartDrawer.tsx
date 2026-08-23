'use client';

import React, { useState } from 'react';
import { Toko, Product, JenisPembayaran, Order } from '@/types';
import { X, ShoppingBag, Trash2, Calendar, CreditCard, Send, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface CartItem {
  product: Product;
  qty: number;
  dealPrice: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedToko: Toko | null;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: (orderData: Omit<Order, 'id' | 'no_nota' | 'created_at'>) => Promise<Order>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  selectedToko,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [jenisPembayaran, setJenisPembayaran] = useState<JenisPembayaran>('Cash');
  const [tanggalPengiriman, setTanggalPengiriman] = useState<string>(todayStr);
  const [catatanPengiriman, setCatatanPengiriman] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const totalBayar = cartItems.reduce((sum, item) => sum + item.qty * item.dealPrice, 0);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const handleProcessCheckout = async () => {
    if (!selectedToko) {
      alert('Pilih toko terlebih dahulu!');
      return;
    }
    if (cartItems.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    try {
      setIsSubmitting(true);
      const items = cartItems.map((c) => ({
        product_id: c.product.id,
        jumlah: c.qty,
        harga_deal: c.dealPrice,
        subtotal: c.qty * c.dealPrice,
      }));

      const newOrder = await onCheckout({
        toko_id: selectedToko.id,
        toko: selectedToko,
        total_bayar: totalBayar,
        jenis_pembayaran: jenisPembayaran,
        status_pembayaran:
          (jenisPembayaran.includes('Lunas') || jenisPembayaran === 'Cash' || jenisPembayaran === 'Transfer') &&
          !jenisPembayaran.includes('COD')
            ? 'Lunas'
            : 'Belum Lunas',
        tanggal_pengiriman: tanggalPengiriman,
        status_pengiriman: 'Disiapkan',
        catatan_pengiriman: catatanPengiriman.trim() || undefined,
        items,
      });

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });

      setCompletedOrder(newOrder);
      onClearCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses order';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWAString = (order: Order) => {
    const tokoName = selectedToko?.nama_toko || 'Toko Pelanggan';
    const lines = [
      `*NOTA PENJUALAN - CANVASSING* 🛍️`,
      `---------------------------------`,
      `No. Nota: *${order.no_nota}*`,
      `Toko: *${tokoName}*`,
      `Pemilik: ${selectedToko?.nama_pemilik || '-'} (${selectedToko?.no_hp || '-'})`,
      `Pasar: ${selectedToko?.lokasi_pasar || '-'}`,
      `---------------------------------`,
      `*Daftar Pesanan:*`,
    ];

    cartItems.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.product.nama_produk}`);
      lines.push(`   ${item.qty} x ${formatIDR(item.dealPrice)} = *${formatIDR(item.qty * item.dealPrice)}*`);
    });

    lines.push(`---------------------------------`);
    lines.push(`*TOTAL BAYAR: ${formatIDR(order.total_bayar)}*`);
    lines.push(`Jenis Bayar: *${order.jenis_pembayaran}* (${order.status_pembayaran})`);
    lines.push(`Rencana Kirim: *${order.tanggal_pengiriman}*`);
    if (order.catatan_pengiriman) {
      lines.push(`Catatan: ${order.catatan_pengiriman}`);
    }
    lines.push(`---------------------------------`);
    lines.push(`Terima kasih telah berbelanja! 🙏`);

    return encodeURIComponent(lines.join('\n'));
  };

  const handleShareWA = () => {
    if (!completedOrder) return;
    const rawHp = selectedToko?.no_hp.replace(/[^0-9]/g, '') || '';
    const formattedHp = rawHp.startsWith('0') ? '62' + rawHp.slice(1) : rawHp;
    const text = generateWAString(completedOrder);
    const waUrl = formattedHp
      ? `https://wa.me/${formattedHp}?text=${text}`
      : `https://wa.me/?text=${text}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col justify-between text-slate-900 shadow-2xl">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Keranjang & Order Sales</h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                {selectedToko ? selectedToko.nama_toko : 'Belum pilih toko'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {completedOrder ? (
            <div className="text-center py-8 px-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3 animate-fade-in">
              <CheckCircle className="w-14 h-14 text-emerald-600 mx-auto" />
              <h3 className="font-extrabold text-lg text-emerald-800">Order Berhasil Disimpan!</h3>
              <p className="text-xs text-slate-700">
                No. Nota: <span className="font-mono font-bold text-slate-900">{completedOrder.no_nota}</span>
              </p>
              <p className="text-xs text-slate-600">
                Total: <span className="font-extrabold text-emerald-700 text-sm">{formatIDR(completedOrder.total_bayar)}</span> ({completedOrder.jenis_pembayaran})
              </p>
              <div className="pt-3 space-y-2">
                <button
                  onClick={handleShareWA}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Nota ke WhatsApp Toko</span>
                </button>
                <button
                  onClick={() => {
                    setCompletedOrder(null);
                    onClose();
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Tutup & Buat Order Baru
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Selected Toko Alert */}
              {!selectedToko && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                  ⚠️ Silakan pilih toko tujuan belanja di halaman Order terlebih dahulu!
                </div>
              )}

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">Keranjang Masih Kosong</p>
                  <p className="text-xs text-slate-500">Pilih produk dan tawar harga dari katalog</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Daftar Produk ({cartItems.length})
                  </h4>
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="font-extrabold text-xs text-slate-900 truncate">{item.product.nama_produk}</h5>
                        <p className="text-[11px] text-slate-500 font-semibold">
                          {formatIDR(item.dealPrice)} / {item.product.satuan.split(' ')[0]}
                        </p>
                        <p className="text-xs font-black text-emerald-700">
                          Subtotal: {formatIDR(item.qty * item.dealPrice)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50">
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.qty - 1)}
                            className="px-2 py-0.5 text-slate-700 font-bold text-xs hover:bg-slate-200"
                          >
                            -
                          </button>
                          <span className="px-1.5 text-xs font-black text-slate-900">{item.qty}</span>
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.qty + 1)}
                            className="px-2 py-0.5 text-slate-700 font-bold text-xs hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Options */}
              {cartItems.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  {/* Jenis Pembayaran */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      Opsi Pembayaran
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {[
                        { id: 'Cash (Lunas Depan)', label: '💵 Cash (Lunas Depan)' },
                        { id: 'COD (Bayar saat Diantar)', label: '🚚 COD (Bayar di Tempat)' },
                        { id: 'Tempo (Piutang)', label: '⌛ Tempo (Piutang)' },
                        { id: 'Transfer (Lunas Depan)', label: '💳 Transfer (Lunas)' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setJenisPembayaran(opt.id)}
                          className={`p-2 rounded-xl text-left font-extrabold border transition-all ${
                            jenisPembayaran === opt.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {jenisPembayaran.includes('Lunas')
                        ? '✓ Status otomatis Lunas (Sudah dibayar toko saat order)'
                        : jenisPembayaran.includes('COD')
                        ? '⚠️ Status Belum Lunas (Driver/Sales menagih uang cash saat mengantar)'
                        : '⚠️ Status Belum Lunas (Piutang toko)'}
                    </p>
                  </div>

                  {/* Tanggal Rencana Pengiriman */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Rencana Tanggal Pengiriman
                    </label>
                    <input
                      type="date"
                      value={tanggalPengiriman}
                      onChange={(e) => setTanggalPengiriman(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Catatan Pengiriman */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Kirim sebelum toko rame"
                      value={catatanPengiriman}
                      onChange={(e) => setCatatanPengiriman(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Action */}
        {!completedOrder && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-bold">Total Pembayaran:</span>
              <span className="font-black text-emerald-700 text-lg">{formatIDR(totalBayar)}</span>
            </div>

            <button
              onClick={handleProcessCheckout}
              disabled={isSubmitting || cartItems.length === 0 || !selectedToko}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md active:scale-95 transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Memproses...' : 'Simpan Order Penjualan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
