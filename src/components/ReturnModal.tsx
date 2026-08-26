'use client';

import React, { useState, useEffect } from 'react';
import { Toko, Product, ReturnReason, ReturnAction, ProductReturn } from '@/types';
import { getLocalTodayStr } from '@/lib/store';
import { X, RefreshCw, Package, Store as StoreIcon, Calendar, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokos: Toko[];
  products: Product[];
  defaultTokoId?: string;
  onSaveReturn: (returnData: Omit<ProductReturn, 'id' | 'created_at'>) => Promise<void>;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  tokos,
  products,
  defaultTokoId,
  onSaveReturn,
}) => {
  const todayStr = getLocalTodayStr();
  const [selectedTokoId, setSelectedTokoId] = useState<string>(defaultTokoId || (tokos[0]?.id || ''));
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [jumlah, setJumlah] = useState<number>(1);
  const [hargaFormatted, setHargaFormatted] = useState<string>('0');
  const [hargaRaw, setHargaRaw] = useState<number>(0);
  const [alasan, setAlasan] = useState<ReturnReason>('Bocor / Rusak');
  const [tindakan, setTindakan] = useState<ReturnAction>('Tukar Barang Baru');
  const [catatan, setCatatan] = useState<string>('');
  const [tanggal, setTanggal] = useState<string>(todayStr);
  const [tanggalPengganti, setTanggalPengganti] = useState<string>(todayStr);
  const [statusPengganti, setStatusPengganti] = useState<import('@/types').StatusPengiriman>('Siap Kirim');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultTokoId) setSelectedTokoId(defaultTokoId);
    else if (tokos.length > 0) setSelectedTokoId(tokos[0].id);
  }, [defaultTokoId, tokos]);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Update default price when selected product changes
  useEffect(() => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (prod) {
      const price = prod.harga_normal || 0;
      setHargaRaw(price);
      setHargaFormatted(price.toLocaleString('id-ID'));
    }
  }, [selectedProductId, products]);

  if (!isOpen) return null;

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const numVal = parseInt(rawVal, 10) || 0;
    setHargaRaw(numVal);
    setHargaFormatted(numVal > 0 ? numVal.toLocaleString('id-ID') : '');
  };

  const totalNilai = jumlah * hargaRaw;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokoId || !selectedProductId || jumlah <= 0 || hargaRaw < 0) return;

    setIsSubmitting(true);
    try {
      await onSaveReturn({
        toko_id: selectedTokoId,
        product_id: selectedProductId,
        jumlah,
        harga_nilai: hargaRaw,
        total_nilai: totalNilai,
        alasan,
        tindakan,
        catatan,
        tanggal,
        tanggal_pengiriman_pengganti: tanggalPengganti,
        status_pengiriman_pengganti: statusPengganti,
      });
      onClose();
    } catch (err) {
      console.error('Error saving return:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const reasons: ReturnReason[] = [
    'Bocor / Rusak',
    'Kadaluarsa / Expired',
    'Cacat Pabrik',
    'Salah Kirim',
    'Lainnya',
  ];

  const actions: { id: ReturnAction; label: string; desc: string; icon: string }[] = [
    {
      id: 'Tukar Barang Baru',
      label: '🔄 Tukar Barang Baru',
      desc: 'Ambil stok bagus dari armada canvass untuk toko',
      icon: '🔄',
    },
    {
      id: 'Potong Piutang Tempo',
      label: '💰 Potong Piutang Tempo',
      desc: 'Mengurangi kewajiban piutang nota tempo toko',
      icon: '💰',
    },
    {
      id: 'Potong Tagihan Cash',
      label: '💵 Potong Tagihan Cash',
      desc: 'Kembalikan uang cash setoran / refund tunai',
      icon: '💵',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-extrabold flex items-center gap-1.5 uppercase tracking-wide">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            Pencatatan Retur Barang & Klaim Pasar
          </h2>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          {/* Pilih Toko */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1 flex items-center gap-1">
              <StoreIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Toko Pelanggan</span>
            </label>
            <select
              value={selectedTokoId}
              onChange={(e) => setSelectedTokoId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:border-amber-600"
            >
              {tokos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama_toko} ({t.lokasi_pasar}) - {t.nama_pemilik}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Produk */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-amber-600" />
              <span>Pilih Produk Yang Diretur</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:border-amber-600"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_produk} (Stok: {p.stok} {p.satuan}) - Normal: {formatIDR(p.harga_normal)}
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah & Harga */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Jumlah Retur (Pcs/Pak)</label>
              <input
                type="number"
                min="1"
                value={jumlah}
                onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value, 10) || 1))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Nilai Satuan (Rp)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">Rp</span>
                <input
                  type="text"
                  value={hargaFormatted}
                  onChange={handleHargaChange}
                  required
                  placeholder="180.000"
                  className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Total Nilai Retur Card */}
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-900">Total Nilai Barang Retur:</span>
            <span className="text-sm font-black text-amber-900">{formatIDR(totalNilai)}</span>
          </div>

          {/* Alasan Retur */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Alasan Barang Diretur</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setAlasan(r)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                    alasan === r
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Tindakan Solusi Retur */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>Tindakan Solusi Penanganan Retur</span>
            </label>
            <div className="space-y-1.5">
              {actions.map((act) => (
                <div
                  key={act.id}
                  onClick={() => setTindakan(act.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                    tindakan === act.id
                      ? 'bg-amber-50/80 border-amber-500 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="tindakan"
                    checked={tindakan === act.id}
                    onChange={() => setTindakan(act.id)}
                    className="mt-0.5 accent-amber-600"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 block leading-tight">{act.label}</span>
                    <span className="text-[10px] text-slate-600 font-bold block">{act.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Perencanaan Pengiriman Barang Pengganti (jika Tukar Barang Baru) */}
          {tindakan === 'Tukar Barang Baru' && (
            <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl space-y-2">
              <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5 uppercase">
                <Package className="w-4 h-4 text-emerald-700" />
                Perencanaan Pengiriman Barang Pengganti
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Tanggal Delivery Barang Pengganti</label>
                  <input
                    type="date"
                    value={tanggalPengganti}
                    onChange={(e) => setTanggalPengganti(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Status Delivery</label>
                  <select
                    value={statusPengganti}
                    onChange={(e) => setStatusPengganti(e.target.value as import('@/types').StatusPengiriman)}
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Siap Kirim">📦 Masuk Perencanaan Delivery (Siap Kirim)</option>
                    <option value="Terkirim">✅ Sudah Ditukar di Tempat Hari Ini (Terkirim)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tanggal & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Tanggal Transaksi Retur</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Catatan (Opsional)</label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="misal: Tutup botol penyok saat kirim"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Simpan Retur</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
