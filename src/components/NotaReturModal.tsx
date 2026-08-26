'use client';

import React from 'react';
import { ProductReturn, StoreSettings, Toko, Product } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/store';
import { terbilang } from '@/lib/terbilang';
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
      val || 0
    );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWA = () => {
    if (!toko) return;
    const storeHeader = (settings?.nama_usaha || 'DISTRIBUTOR JOSJIS').toUpperCase();
    const lines = [
      `*${storeHeader}* 🛍️`,
      `*BUKTI RETUR BARANG & SURAT JALAN TUKAR PRODUK*`,
      `---------------------------------`,
      `No. Nota Retur: *${productReturn.no_nota_retur || 'RET-001'}*`,
      `Tgl Retur: *${formatDate(productReturn.tanggal)}*`,
      `Toko: *${toko.nama_toko || 'Toko Pelanggan'}*`,
      `Pemilik: ${toko.nama_pemilik || '-'} (${toko.no_hp || '-'})`,
      `Pasar: ${toko.lokasi_pasar || '-'}`,
      `---------------------------------`,
      `*Rincian Barang Diretur:*`,
      `1. *${product?.nama_produk || 'Produk'}*`,
      `   ${productReturn.jumlah} ${product?.satuan || 'Pcs'} x @ ${formatIDR(productReturn.harga_nilai)} = *${formatIDR(productReturn.total_nilai)}*`,
      `---------------------------------`,
      `*TOTAL NILAI RETUR: ${formatIDR(productReturn.total_nilai)}*`,
      `Terbilang: _${terbilang(productReturn.total_nilai)}_`,
      `Alasan Retur: *${productReturn.alasan}*`,
      `Solusi Penanganan: *${productReturn.tindakan}*`,
      productReturn.catatan ? `Catatan: _"${productReturn.catatan}"_` : '',
      `---------------------------------`,
      `Terima kasih atas kerja samanya! 🙏`,
    ].filter(Boolean);

    const phone = toko.no_hp.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[95vh]">
        {/* Top Dialog Action Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-900 font-extrabold text-xs">
              NOTA RETUR
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Bukti Retur Barang & Surat Jalan Pengganti</h3>
              <p className="text-[11px] font-mono text-slate-500">{productReturn.no_nota_retur || 'RET-001'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={handleSendWA}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share WA</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body (Identical structure to NotaModal) */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans flex-1 bg-white" id="print-nota-retur">
          {/* Header 2 Columns: Company Info Left vs RETUR Meta Right */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-300 pb-4">
            {/* Left: Company & Customer Info */}
            <div className="space-y-2 flex-1">
              <div>
                <h2 className="font-black text-base tracking-wide text-slate-900 uppercase">
                  {settings.nama_usaha}
                </h2>
                <p className="text-[11px] text-slate-600 font-medium leading-tight">
                  {settings.alamat_usaha || 'Distributor Canvass Keliling Pasar'}
                  <br />
                  Phone/WA: {settings.no_telp || '-'} | Sales Lapangan
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <table className="text-[11px]">
                  <tbody>
                    <tr>
                      <td className="font-bold text-slate-700 pr-2">Customer</td>
                      <td className="pr-2">:</td>
                      <td className="font-black text-slate-900 uppercase">
                        {toko?.nama_toko || 'TOKO PELANGGAN'}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-600 pr-2">Pemilik / Kontak</td>
                      <td className="pr-2">:</td>
                      <td className="text-slate-800 font-bold">
                        {toko?.nama_pemilik || '-'} ({toko?.no_hp || '-'})
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-600 pr-2">Pasar / Lokasi</td>
                      <td className="pr-2">:</td>
                      <td className="text-emerald-800 font-bold">{toko?.lokasi_pasar || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: NOTA RETUR Meta Table */}
            <div className="sm:text-right space-y-1 sm:w-64">
              <h1 className="text-xl font-black tracking-widest text-amber-900 uppercase">
                NOTA RETUR
              </h1>

              <table className="text-[11px] ml-auto text-left sm:text-right">
                <tbody>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">No. Retur</td>
                    <td className="pr-2">:</td>
                    <td className="font-mono font-bold text-amber-900">{productReturn.no_nota_retur || 'RET-001'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Tgl Retur</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-slate-900">
                      {formatDate(productReturn.tanggal)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Solusi Retur</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-teal-800">{productReturn.tindakan}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Alasan Retur</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-rose-700">{productReturn.alasan}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Salesman</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-slate-900 uppercase">{settings.nama_pemilik}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Table with Dashed Lines */}
          <div className="my-3">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-y-2 border-dashed border-slate-400 text-slate-800 font-extrabold uppercase">
                  <th className="py-2 pr-2 text-center w-8">No.</th>
                  <th className="py-2 px-2">Deskripsi Produk Diretur</th>
                  <th className="py-2 px-2 text-center">Jumlah (Qty)</th>
                  <th className="py-2 px-2 text-right">Nilai Satuan</th>
                  <th className="py-2 px-2 text-center">Alasan</th>
                  <th className="py-2 pl-2 text-right">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="py-2 pr-2 text-center font-mono text-slate-500">1</td>
                  <td className="py-2 px-2 font-bold text-slate-900">
                    {product?.nama_produk || 'Produk'}
                    <span className="text-[10px] text-slate-500 font-mono block">
                      SKU: {product?.kode_sku || '-'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-slate-900">
                    {productReturn.jumlah} {product?.satuan || 'Pcs'}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-700">{formatIDR(productReturn.harga_nilai)}</td>
                  <td className="py-2 px-2 text-center text-rose-800 font-bold">{productReturn.alasan}</td>
                  <td className="py-2 pl-2 text-right font-black text-amber-900">{formatIDR(productReturn.total_nilai)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Inword & Footers Grid */}
          <div className="pt-2 border-t-2 border-dashed border-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Terbilang & Catatan */}
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="font-extrabold text-slate-700 pr-1">Terbilang :</span>
                <span className="font-bold text-slate-900 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                  {terbilang(productReturn.total_nilai)}
                </span>
              </div>

              {productReturn.catatan && (
                <div>
                  <span className="font-extrabold text-slate-700 pr-1">Catatan :</span>
                  <span className="text-slate-800 italic">&quot;{productReturn.catatan}&quot;</span>
                </div>
              )}
            </div>

            {/* Right: Total Calculation Box */}
            <div className="space-y-1.5 text-right font-semibold text-[11px] sm:w-60 sm:ml-auto">
              <div className="flex justify-between">
                <span className="text-slate-600">Nilai Barang Retur</span>
                <span className="font-bold text-slate-900">{formatIDR(productReturn.total_nilai)}</span>
              </div>
              <div className="flex justify-between text-teal-800 font-bold">
                <span>Solusi Penanganan</span>
                <span>{productReturn.tindakan}</span>
              </div>
              <div className="flex justify-between pt-1 border-t-2 border-slate-800 font-black text-sm text-amber-900 border-b-4 border-double">
                <span>Total Klaim Retur</span>
                <span>{formatIDR(productReturn.total_nilai)}</span>
              </div>
            </div>
          </div>

          {/* Tanda Tangan 2 Kolom */}
          <div className="pt-6 grid grid-cols-2 text-center text-[11px] font-bold">
            <div className="space-y-10">
              <p className="text-slate-600 uppercase font-semibold">Toko / Penerima Barang,</p>
              <p className="text-slate-900 font-black underline border-t border-slate-300 pt-1 w-36 mx-auto uppercase">
                ( {toko?.nama_pemilik || toko?.nama_toko || 'Pemilik Toko'} )
              </p>
            </div>

            <div className="space-y-10">
              <p className="text-slate-600 uppercase font-semibold">Distributor / Sales Canvass,</p>
              <p className="text-slate-900 font-black underline border-t border-slate-300 pt-1 w-36 mx-auto uppercase">
                ( {settings.nama_pemilik || 'Farhan'} )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
