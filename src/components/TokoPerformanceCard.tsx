'use client';

import React, { useState } from 'react';
import { TokoPerformance, Order } from '@/types';
import {
  Store,
  User,
  Phone,
  MapPin,
  Home,
  ShoppingBag,
  Send,
  Edit2,
  ChevronDown,
  ChevronUp,
  FileText,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface TokoPerformanceCardProps {
  toko: TokoPerformance;
  tokoOrders?: Order[];
  onSelectForOrder: (toko: TokoPerformance) => void;
  onEditToko?: (toko: TokoPerformance) => void;
  onOpenNota?: (order: Order) => void;
}

export const TokoPerformanceCard: React.FC<TokoPerformanceCardProps> = ({
  toko,
  tokoOrders = [],
  onSelectForOrder,
  onEditToko,
  onOpenNota,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Belum ada order';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleOpenWA = (e: React.MouseEvent) => {
    e.stopPropagation();
    const raw = toko.no_hp.replace(/[^0-9]/g, '');
    const formatted = raw.startsWith('0') ? '62' + raw.slice(1) : raw;
    window.open(`https://wa.me/${formatted}`, '_blank');
  };

  // Piutang (Orders with Tempo & Belum Lunas)
  const piutangOrders = tokoOrders.filter(
    (o) => o.jenis_pembayaran === 'Tempo' && o.status_pembayaran === 'Belum Lunas'
  );

  return (
    <div className="py-3 px-3 sm:px-4 bg-white border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
      {/* Header Toko & Pasar */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-800 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {toko.lokasi_pasar}
            </span>
          </div>
          <h3 className="font-black text-slate-900 text-base leading-tight flex items-center gap-2">
            <span>{toko.nama_toko}</span>
            {onEditToko && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditToko(toko);
                }}
                className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Edit Data Toko"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectForOrder(toko)}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Order</span>
          </button>
        </div>
      </div>

      {/* Metadata Toko Info Line */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 my-2 gap-y-1">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>
            Pemilik: <strong className="text-slate-900 font-bold">{toko.nama_pemilik}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-700 font-bold">
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>{toko.no_hp}</span>
          </div>
          <button
            onClick={handleOpenWA}
            className="px-2 py-0.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded font-bold text-[11px] flex items-center gap-1 transition-colors"
          >
            <Send className="w-3 h-3" />
            WA
          </button>
        </div>

        {toko.lokasi_rumah && (
          <div className="w-full text-[11px] text-slate-600 flex items-center gap-1 pt-1 border-t border-slate-200/80">
            <Home className="w-3 h-3 text-slate-400" />
            <span>Rumah: {toko.lokasi_rumah}</span>
          </div>
        )}
      </div>

      {/* Performa Metrics Horizontal Bar */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">Total Omset:</span>
            <span className="font-black text-emerald-700 text-xs">{formatIDR(toko.total_omset)}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">Order:</span>
            <span className="font-bold text-slate-900 text-xs">{toko.total_orders}x</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-semibold block">Sisa Piutang:</span>
            <span
              className={`font-black text-xs ${
                toko.sisa_piutang > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-800'
              }`}
            >
              {formatIDR(toko.sisa_piutang)}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 ml-1"
          >
            <span>{isExpanded ? 'Sembunyikan' : 'Rincian Pesanan'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* EXPANDABLE SECTION: Rincian Pesanan & Detail Piutang */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 animate-fade-in text-xs">
          {/* Detail Piutang Section */}
          {toko.sisa_piutang > 0 && (
            <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2">
              <h4 className="font-extrabold text-rose-900 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Rincian Piutang Belum Lunas ({piutangOrders.length} Nota Tempo)
              </h4>

              <div className="space-y-1.5">
                {piutangOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-2 bg-white rounded-lg border border-rose-200 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{ord.no_nota}</span>
                      <span className="text-slate-500 block">Tgl Kirim: {ord.tanggal_pengiriman}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-rose-700 block">{formatIDR(ord.total_bayar)}</span>
                      {onOpenNota && (
                        <button
                          onClick={() => onOpenNota(ord)}
                          className="text-[10px] text-emerald-700 hover:underline font-extrabold"
                        >
                          📄 Lihat Nota
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Riwayat Semua Pesanan Toko */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-700" />
              Riwayat Pengiriman & Pesanan Toko Ini ({tokoOrders.length})
            </h4>

            {tokoOrders.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic p-2 bg-slate-50 rounded-lg">
                Belum ada transaksi untuk toko ini.
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {tokoOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 hover:bg-slate-100/60"
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className="font-mono text-slate-900">{ord.no_nota}</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            ord.status_pengiriman === 'Terkirim'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {ord.status_pengiriman}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ord.status_pembayaran === 'Lunas'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {ord.status_pembayaran}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Rencana Kirim: {ord.tanggal_pengiriman}</span>
                      <span className="font-black text-emerald-800 text-xs">
                        {formatIDR(ord.total_bayar)}
                      </span>
                    </div>

                    {ord.penerima_nama && (
                      <p className="text-[10px] text-emerald-800 font-semibold">
                        ✓ Diterima oleh: {ord.penerima_nama}
                      </p>
                    )}

                    {onOpenNota && (
                      <div className="pt-1 text-right">
                        <button
                          onClick={() => onOpenNota(ord)}
                          className="text-[10px] font-extrabold text-emerald-700 hover:underline"
                        >
                          📄 Buka Struk Nota Digital
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
