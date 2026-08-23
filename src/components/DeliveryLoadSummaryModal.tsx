'use client';

import React from 'react';
import { DeliveryLoadItem } from '@/types';
import { X, Truck, PackageCheck, Printer } from 'lucide-react';

interface DeliveryLoadSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate: string;
  targetPasar?: string;
  loadItems: DeliveryLoadItem[];
}

export const DeliveryLoadSummaryModal: React.FC<DeliveryLoadSummaryModalProps> = ({
  isOpen,
  onClose,
  targetDate,
  targetPasar,
  loadItems,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Rekapitulasi Muatan Barang</h3>
              <p className="text-xs text-slate-500 font-medium">Checklist muat armada agar tidak salah kirim</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto" id="print-section">
          {/* Metadata Banner */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-semibold">Tanggal Kirim:</span>
              <p className="font-black text-slate-900 text-sm">{targetDate}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-semibold">Wilayah / Pasar:</span>
              <p className="font-black text-teal-700 text-sm">
                {targetPasar && targetPasar !== 'SEMUA' ? targetPasar : 'Semua Pasar'}
              </p>
            </div>
          </div>

          {/* Load List */}
          {loadItems.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <PackageCheck className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Tidak ada barang yang perlu di-load</p>
              <p className="text-xs text-slate-500">
                Tidak ada pesanan aktif pada tanggal {targetDate}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-extrabold text-slate-500 px-2 pb-1 border-b border-slate-200">
                <span>Nama Produk</span>
                <span>Total Muatan</span>
              </div>
              {loadItems.map((item, idx) => (
                <div
                  key={item.product_id}
                  className="bg-white hover:bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{item.nama_produk}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-black text-xs">
                    {item.total_jumlah} {item.satuan.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-semibold">
            Total Jenis Produk: <strong className="text-slate-900 font-bold">{loadItems.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-sm"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
