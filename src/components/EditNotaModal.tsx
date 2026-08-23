'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderItem, JenisPembayaran, StatusPembayaran } from '@/types';
import { X, Edit2, Plus, Trash2, CheckCircle2, History } from 'lucide-react';

interface EditNotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSaveEdit: (
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
  ) => Promise<void>;
}

export const EditNotaModal: React.FC<EditNotaModalProps> = ({
  isOpen,
  onClose,
  order,
  onSaveEdit,
}) => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [jenisPembayaran, setJenisPembayaran] = useState<JenisPembayaran>('Cash');
  const [statusPembayaran, setStatusPembayaran] = useState<StatusPembayaran>('Belum Lunas');
  const [tanggalPengiriman, setTanggalPengiriman] = useState<string>('');
  const [catatanPengiriman, setCatatanPengiriman] = useState<string>('');
  const [alasanEdit, setAlasanEdit] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setItems(order.items ? order.items.map((i) => ({ ...i })) : []);
      setJenisPembayaran(order.jenis_pembayaran);
      setStatusPembayaran(order.status_pembayaran);
      setTanggalPengiriman(order.tanggal_pengiriman);
      setCatatanPengiriman(order.catatan_pengiriman || '');
      setAlasanEdit('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const totalBayar = items.reduce((sum, i) => sum + i.jumlah * i.harga_deal, 0);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const handleUpdateItem = (idx: number, field: keyof OrderItem, value: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[idx], [field]: value };
      target.subtotal = target.jumlah * target.harga_deal;
      updated[idx] = target;
      return updated;
    });
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alasanEdit.trim()) {
      alert('Mohon isi alasan / catatan perubahan nota!');
      return;
    }
    if (items.length === 0) {
      alert('Nota tidak boleh kosong!');
      return;
    }

    try {
      setIsSubmitting(true);
      const logMessage = `Edit Nota ${order.no_nota}: ${alasanEdit.trim()} (Total Baru: ${formatIDR(totalBayar)})`;

      await onSaveEdit(
        order.id,
        {
          total_bayar: totalBayar,
          jenis_pembayaran: jenisPembayaran,
          status_pembayaran: statusPembayaran,
          tanggal_pengiriman: tanggalPengiriman,
          catatan_pengiriman: catatanPengiriman.trim() || undefined,
          items,
        },
        logMessage
      );

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah nota.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Ubah Data Nota</h3>
              <p className="text-[11px] font-mono text-slate-500">{order.no_nota} - {order.toko?.nama_toko}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Alasan Edit (Mandatory) */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1">
            <label className="block text-xs font-black text-amber-900 flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-amber-700" />
              Alasan Perubahan Nota <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              placeholder="misal: Toko minta diskon nego / tambah 1 karung beras"
              value={alasanEdit}
              onChange={(e) => setAlasanEdit(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600"
              required
            />
          </div>

          {/* Items Edit Table */}
          <div>
            <h4 className="font-extrabold text-slate-700 mb-2">Item Pesanan ({items.length})</h4>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{item.product?.nama_produk || `Item #${idx + 1}`}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jumlah (Qty)</label>
                      <input
                        type="number"
                        min={1}
                        value={item.jumlah}
                        onChange={(e) => handleUpdateItem(idx, 'jumlah', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-black text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Harga Deal (Rp)</label>
                      <input
                        type="number"
                        step={500}
                        value={item.harga_deal}
                        onChange={(e) => handleUpdateItem(idx, 'harga_deal', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-black text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-extrabold text-emerald-800">
                    Subtotal: {formatIDR(item.jumlah * item.harga_deal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Date Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Bayar</label>
              <select
                value={jenisPembayaran}
                onChange={(e) => setJenisPembayaran(e.target.value as JenisPembayaran)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
              >
                <option value="Cash (Lunas Depan)">💵 Cash (Lunas Depan)</option>
                <option value="COD (Bayar saat Diantar)">🚚 COD (Bayar saat Diantar)</option>
                <option value="Tempo (Piutang)">⌛ Tempo (Piutang)</option>
                <option value="Transfer (Lunas Depan)">💳 Transfer (Lunas Depan)</option>
                <option value="Cash">Cash</option>
                <option value="Tempo">Tempo</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Bayar</label>
              <select
                value={statusPembayaran}
                onChange={(e) => setStatusPembayaran(e.target.value as StatusPembayaran)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
              >
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Rencana Tanggal Kirim</label>
            <input
              type="date"
              value={tanggalPengiriman}
              onChange={(e) => setTanggalPengiriman(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
            <input
              type="text"
              value={catatanPengiriman}
              onChange={(e) => setCatatanPengiriman(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-slate-700 font-extrabold">
              Total Baru: <strong className="text-emerald-800 text-sm">{formatIDR(totalBayar)}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-slate-600 font-bold hover:text-slate-900"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
