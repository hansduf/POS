'use client';

import React from 'react';
import { ProductReturn, StoreSettings, Toko, Product } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/store';
import { X, Printer, Send, RefreshCw, CheckCircle2 } from 'lucide-react';

interface NotaReturModalProps {
  isOpen: boolean;
  onClose: () => void;
  productReturn: ProductReturn | null;
  tokos: Toko[];
  products: Product[];
  settings?: StoreSettings;
}

export const NotaReturModal: React.FC<NotaReturModalProps> = ({
  isOpen,
  onClose,
  productReturn,
  tokos,
  products,
  settings = DEFAULT_SETTINGS,
}) => {
  if (!isOpen || !productReturn) return null;

  const toko = tokos.find((t) => t.id === productReturn.toko_id) || productReturn.toko;
  const product = products.find((p) => p.id === productReturn.product_id) || productReturn.product;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const handlePrint = () => {
    window.print();
  };

  const handleSendWA = () => {
    if (!toko) return;
    const text = `*BUKTI RETUR BARANG & TUKAR PRODUK*
---------------------------------------
*${settings.nama_usaha}*
No. Nota Retur: ${productReturn.no_nota_retur || 'RET-001'}
Tanggal: ${productReturn.tanggal}

*Toko Pelanggan:*
${toko.nama_toko} (${toko.lokasi_pasar})
Pemilik: ${toko.nama_pemilik}

*Rincian Barang Retur:*
- Produk: ${product?.nama_produk || 'Produk'}
- Jumlah: ${productReturn.jumlah} ${product?.satuan || 'Pcs'}
- Nilai Satuan: ${formatIDR(productReturn.harga_nilai)}
- *Total Nilai Retur: ${formatIDR(productReturn.total_nilai)}*

*Alasan Retur:* ${productReturn.alasan}
*Tindakan Solusi:* ${productReturn.tindakan}
${productReturn.catatan ? `*Catatan:* ${productReturn.catatan}` : ''}

---------------------------------------
Terima kasih atas kerja samanya!`;

    const phone = toko.no_hp.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 my-auto print:shadow-none print:border-none print:w-full print:max-w-none print:my-0">
        {/* Modal Header */}
        <div className="bg-amber-600 px-4 py-3 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-200" />
            <h3 className="font-extrabold text-sm">Struk Retur & Surat Jalan Pengganti</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-amber-700/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Nota Body */}
        <div className="p-4 space-y-3.5 text-xs text-slate-900 font-sans print:p-0">
          {/* Header Toko Canvass */}
          <div className="text-center border-b border-slate-200 pb-2.5 space-y-0.5">
            <h2 className="font-black text-base text-slate-900 tracking-tight uppercase">
              {settings.nama_usaha}
            </h2>
            <p className="text-[11px] font-bold text-slate-600 leading-tight">
              {settings.alamat_usaha || 'Distributor Keliling Pasar'}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">
              Telp/WA: {settings.no_telp || '-'}
            </p>
            <div className="pt-1">
              <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-2 py-0.5 rounded-full uppercase border border-amber-300 inline-block">
                BUKTI TANDA TERIMA RETUR BARANG
              </span>
            </div>
          </div>

          {/* Meta Information Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">No. Nota Retur:</span>
              <span className="font-mono font-black text-amber-900">{productReturn.no_nota_retur || 'RET-001'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block">Tanggal Transaksi:</span>
              <span className="font-bold text-slate-800">{productReturn.tanggal}</span>
            </div>

            <div className="col-span-2 border-t border-slate-200 pt-1 mt-0.5">
              <span className="text-[10px] text-slate-500 font-bold block">Toko Pelanggan:</span>
              <span className="font-black text-slate-900 text-xs">{toko?.nama_toko || 'Toko Pelanggan'}</span>
              <span className="text-[10px] text-slate-600 font-bold block">
                {toko?.lokasi_pasar} • Pemilik: {toko?.nama_pemilik} ({toko?.no_hp})
              </span>
            </div>
          </div>

          {/* Rincian Produk Retur Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 font-extrabold text-slate-700 text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-2">Item Retur</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Nilai Satuan</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-2">
                    <span className="font-black block text-slate-900">{product?.nama_produk || 'Produk'}</span>
                    <span className="text-[10px] text-amber-800 font-bold">Alasan: {productReturn.alasan}</span>
                  </td>
                  <td className="p-2 text-center font-bold">{productReturn.jumlah} {product?.satuan || 'Pcs'}</td>
                  <td className="p-2 text-right font-bold">{formatIDR(productReturn.harga_nilai)}</td>
                  <td className="p-2 text-right font-black text-slate-900">{formatIDR(productReturn.total_nilai)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Solution & Summary Bar */}
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-900">Total Klaim Retur:</span>
              <span className="font-black text-amber-900 text-sm">{formatIDR(productReturn.total_nilai)}</span>
            </div>
            <div className="border-t border-amber-200 pt-1 text-[11px] flex items-center justify-between">
              <span className="font-bold text-amber-900">Tindakan Penanganan:</span>
              <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                {productReturn.tindakan}
              </span>
            </div>
            {productReturn.catatan && (
              <p className="text-[10px] text-slate-600 font-medium italic pt-0.5">
                Catatan: "{productReturn.catatan}"
              </p>
            )}
          </div>

          {/* Tanda Tangan Dual Signature */}
          <div className="grid grid-cols-2 gap-4 text-center text-[10px] font-bold text-slate-600 pt-4 border-t border-slate-200">
            <div>
              <p>Penerima / Toko Pasar,</p>
              <div className="h-10"></div>
              <p className="font-extrabold text-slate-900 underline">({toko?.nama_pemilik || toko?.nama_toko || 'Pemilik Toko'})</p>
            </div>
            <div>
              <p>Hormat Kami (Canvasser),</p>
              <div className="h-10"></div>
              <p className="font-extrabold text-slate-900 underline">({settings.nama_pemilik || 'Sales Distributor'})</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWA}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>📱 WA Struk</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>🖨️ Cetak Nota</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
