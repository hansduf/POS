'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { X, Truck, CheckCircle2, User, Store, MapPin, Package, DollarSign } from 'lucide-react';

interface ConfirmDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (orderId: string, penerimaNama: string, catatan?: string) => Promise<void>;
}

export const ConfirmDeliveryModal: React.FC<ConfirmDeliveryModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirm,
}) => {
  const [penerimaNama, setPenerimaNama] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order && order.toko) {
      setPenerimaNama(order.toko.nama_pemilik || '');
      setCatatan('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = penerimaNama.trim() || order.toko?.nama_pemilik || 'Pemilik Toko';

    try {
      setIsSubmitting(true);
      await onConfirm(order.id, name, catatan.trim() || undefined);
      setPenerimaNama('');
      setCatatan('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal konfirmasi pengiriman';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCOD = order.jenis_pembayaran?.toLowerCase().includes('cod');
  const isTempo = order.jenis_pembayaran?.toLowerCase().includes('tempo');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[96vh]">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-slate-900 leading-none">
                Konfirmasi Penerimaan Barang
              </h3>
              <p className="text-[10px] font-mono text-slate-500">{order.no_nota}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Ultra Compact Layout (Zero Scroll Needed) */}
        <form onSubmit={handleSubmit} className="p-3 text-[11px] space-y-2 overflow-y-auto flex-1">
          {/* Toko & Total Combined Line */}
          <div className="pb-2 border-b border-slate-200 flex items-center justify-between gap-2">
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase block">TOKO TUJUAN</span>
              <h4 className="font-black text-xs text-slate-900 leading-tight">
                {order.toko?.nama_toko} <span className="text-emerald-800 font-bold">({order.toko?.lokasi_pasar})</span>
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                Pemilik: {order.toko?.nama_pemilik} ({order.toko?.no_hp})
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase block">TOTAL TAGIHAN</span>
              <span className="text-emerald-800 font-black text-sm">{formatIDR(order.total_bayar)}</span>
            </div>
          </div>

          {/* Highlighted Payment Badge Line */}
          <div className="pb-2 border-b border-slate-200 flex items-center justify-between gap-2">
            <div
              className={`px-2.5 py-1 rounded-lg font-black text-[10px] shadow-2xs flex items-center gap-1 ${
                isCOD
                  ? 'bg-amber-400 text-slate-950 border border-amber-500'
                  : isTempo
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              <span>Jenis Bayar:</span>
              <span className="underline">{order.jenis_pembayaran}</span>
            </div>

            <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              ✓ Otomatis Diubah ke LUNAS
            </span>
          </div>

          {/* Items Summary (Compact Row) */}
          <div className="pb-2 border-b border-slate-200 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-700 block">
              Rincian Barang Muatan ({order.items?.length || 0} Item):
            </span>

            <div className="max-h-20 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-slate-900">
                    {item.jumlah}x {item.product?.nama_produk || 'Produk'} ({item.product?.satuan})
                  </span>
                  <span className="font-extrabold text-slate-700">{formatIDR(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nama Penerima Input */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="font-extrabold text-slate-800 text-[10px] flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-600" />
                Nama Penerima Barang <span className="text-rose-600">*</span>
              </label>
              {order.toko?.nama_pemilik && (
                <button
                  type="button"
                  onClick={() => setPenerimaNama(order.toko?.nama_pemilik || '')}
                  className="text-[9px] font-extrabold text-emerald-700 hover:underline bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200"
                >
                  Isi &quot;{order.toko.nama_pemilik}&quot;
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Pak H. Ahmad / Pemilik"
              value={penerimaNama}
              onChange={(e) => setPenerimaNama(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              required
            />
          </div>

          {/* Catatan Bukti Penerimaan */}
          <div>
            <label className="block font-bold text-slate-700 text-[10px] mb-0.5">
              Catatan Penerimaan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Barang diterima utuh / uang cash diserahkan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 font-bold hover:text-slate-900 text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md text-xs disabled:opacity-50 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Konfirmasi Terkirim & Lunas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
