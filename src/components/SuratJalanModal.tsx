'use client';

import React from 'react';
import { Order } from '@/types';
import { terbilang } from '@/lib/terbilang';
import { X, Printer, Send, CheckCircle2, Truck } from 'lucide-react';

import { StoreSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/store';

interface SuratJalanModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOpenConfirmDelivery?: (order: Order) => void;
  settings?: StoreSettings;
}

export const SuratJalanModal: React.FC<SuratJalanModalProps> = ({
  isOpen,
  onClose,
  order,
  onOpenConfirmDelivery,
  settings = DEFAULT_SETTINGS,
}) => {
  if (!isOpen || !order) return null;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  const formatDate = (dateStr: string) => {
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

  const handleShareWA = () => {
    const rawHp = order.toko?.no_hp?.replace(/[^0-9]/g, '') || '';
    const formattedHp = rawHp.startsWith('0') ? '62' + rawHp.slice(1) : rawHp;

    const lines = [
      `*FAKTUR SURAT JALAN & PENGIRIMAN* 🚚`,
      `---------------------------------`,
      `No. Surat Jalan: *SJ-${order.no_nota}*`,
      `Tgl Pengiriman: *${formatDate(order.tanggal_pengiriman)}*`,
      `Toko Tujuan: *${order.toko?.nama_toko || '-'}*`,
      `Pemilik: ${order.toko?.nama_pemilik || '-'} (${order.toko?.no_hp || '-'})`,
      `Pasar / Lokasi: ${order.toko?.lokasi_pasar || '-'}`,
      `---------------------------------`,
      `*Daftar Rincian Barang Muatan:*`,
    ];

    order.items?.forEach((item, idx) => {
      const name = item.product?.nama_produk || 'Produk';
      lines.push(`${idx + 1}. ${name}`);
      lines.push(`   ${item.jumlah} ${item.product?.satuan || 'Pcs'} @ ${formatIDR(item.harga_deal)} = *${formatIDR(item.subtotal)}*`);
    });

    lines.push(`---------------------------------`);
    lines.push(`*NET TOTAL: ${formatIDR(order.total_bayar)}*`);
    lines.push(`Terbilang: _${terbilang(order.total_bayar)}_`);
    lines.push(`Status Pembayaran: *${order.jenis_pembayaran}* (${order.status_pembayaran})`);
    lines.push(`Status Barang: *${order.status_pengiriman}*`);
    if (order.penerima_nama) {
      lines.push(`Diterima Oleh: *${order.penerima_nama}*`);
    }
    lines.push(`---------------------------------`);
    lines.push(`Mohon diperiksa kembali saat barang diterima. Terima kasih! 🙏`);

    const waUrl = formattedHp
      ? `https://wa.me/${formattedHp}?text=${encodeURIComponent(lines.join('\n'))}`
      : `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[95vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800 font-extrabold text-xs">
              SURAT JALAN
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Faktur Surat Jalan & Pengiriman</h3>
              <p className="text-[11px] font-mono text-slate-500">SJ-{order.no_nota}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Unduh / Cetak PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Surat Jalan Body (1-to-1 Corporate Invoice Layout) */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans flex-1 bg-white" id="print-surat-jalan">
          {/* Header 2 Columns */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-300 pb-4">
            <div className="space-y-2 flex-1">
              <div>
                <h2 className="font-black text-base tracking-wide text-slate-900 uppercase">
                  {settings.nama_usaha}
                </h2>
                <p className="text-[11px] text-slate-600 font-medium leading-tight">
                  {settings.alamat_usaha}
                  <br />
                  Phone: {settings.no_telp} | Logistik & Pengiriman Lapangan
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <table className="text-[11px]">
                  <tbody>
                    <tr>
                      <td className="font-bold text-slate-700 pr-2">Customer / Tujuan</td>
                      <td className="pr-2">:</td>
                      <td className="font-black text-slate-900 uppercase">
                        {order.toko?.nama_toko || 'TOKO PELANGGAN'}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-600 pr-2">Pemilik / Kontak</td>
                      <td className="pr-2">:</td>
                      <td className="text-slate-800 font-bold">
                        {order.toko?.nama_pemilik || '-'} ({order.toko?.no_hp || '-'})
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-600 pr-2">Pasar / Lokasi</td>
                      <td className="pr-2">:</td>
                      <td className="text-emerald-800 font-bold">{order.toko?.lokasi_pasar || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="sm:text-right space-y-1 sm:w-64">
              <h1 className="text-2xl font-black tracking-widest text-slate-900 uppercase">
                SURAT JALAN
              </h1>

              <table className="text-[11px] ml-auto text-left sm:text-right">
                <tbody>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Number</td>
                    <td className="pr-2">:</td>
                    <td className="font-mono font-bold text-slate-900">SJ-{order.no_nota}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Inv. Date</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-slate-900">
                      {formatDate(order.created_at || order.tanggal_pengiriman)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Delivery Date</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-slate-900">{formatDate(order.tanggal_pengiriman)}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Payment Term</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-slate-900">{order.jenis_pembayaran} ({order.status_pembayaran})</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Driver / Sales</td>
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
                  <th className="py-2 px-2">Product Description</th>
                  <th className="py-2 px-2 text-center">Quantity UOM</th>
                  <th className="py-2 px-2 text-right">Unit Price</th>
                  <th className="py-2 px-2 text-right">Gross Amt.</th>
                  <th className="py-2 px-2 text-center">Disc %</th>
                  <th className="py-2 pl-2 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 pr-2 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-2 font-bold text-slate-900">
                      {item.product?.nama_produk || 'Produk'}
                      <span className="text-[10px] text-slate-500 font-mono block">
                        SKU: {item.product?.kode_sku}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-slate-900">
                      {item.jumlah} {item.product?.satuan || 'Pcs'}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-700">{formatIDR(item.harga_deal)}</td>
                    <td className="py-2 px-2 text-right text-slate-700">{formatIDR(item.subtotal)}</td>
                    <td className="py-2 px-2 text-center text-slate-500 font-mono">0%</td>
                    <td className="py-2 pl-2 text-right font-black text-slate-900">{formatIDR(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inword & Footers Grid */}
          <div className="pt-2 border-t-2 border-dashed border-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="font-extrabold text-slate-700 pr-1">Inword :</span>
                <span className="font-bold text-slate-900 italic bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {terbilang(order.total_bayar)}
                </span>
              </div>

              {order.catatan_pengiriman && (
                <div>
                  <span className="font-extrabold text-slate-700 pr-1">Remark :</span>
                  <span className="text-slate-800 italic">&quot;{order.catatan_pengiriman}&quot;</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-right font-semibold text-[11px] sm:w-60 sm:ml-auto">
              <div className="flex justify-between">
                <span className="text-slate-600">Gross Total</span>
                <span className="font-bold text-slate-900">{formatIDR(order.total_bayar)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Discount Total</span>
                <span className="font-bold text-slate-900">Rp 0</span>
              </div>
              <div className="flex justify-between pt-1 border-t-2 border-slate-800 font-black text-sm text-emerald-800 border-b-4 border-double">
                <span>Net Total</span>
                <span>{formatIDR(order.total_bayar)}</span>
              </div>
            </div>
          </div>

          {/* Signatures Area */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[11px]">
            <div className="space-y-10">
              <p className="font-bold text-slate-700">Sincerely ( Driver / Sales ),</p>
              <div className="border-b border-slate-400 w-36 mx-auto"></div>
              <p className="font-bold text-slate-900 uppercase">{settings.nama_pemilik}</p>
            </div>

            <div className="space-y-10">
              <p className="font-bold text-slate-700">Customer Receiver,</p>
              <div className="border-b border-slate-400 w-36 mx-auto"></div>
              <p className="font-bold text-slate-900 uppercase">
                {order.penerima_nama || order.toko?.nama_pemilik || 'Pemilik Toko'}
              </p>
            </div>
          </div>

          {/* Bottom Legal Disclaimer */}
          <div className="pt-4 text-center border-t border-slate-300">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
              {settings.catatan_faktur}
            </p>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          {order.status_pengiriman !== 'Terkirim' && onOpenConfirmDelivery && (
            <button
              onClick={() => {
                onClose();
                onOpenConfirmDelivery(order);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Diterima</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Unduh / Cetak PDF</span>
            </button>

            <button
              onClick={handleShareWA}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Surat Jalan WA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
