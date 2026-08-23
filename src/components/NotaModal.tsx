'use client';

import React from 'react';
import { Order } from '@/types';
import { terbilang } from '@/lib/terbilang';
import { X, Printer, Send, Edit2, History, Clock } from 'lucide-react';

import { StoreSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/store';

interface NotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOpenEditNota?: (order: Order) => void;
  settings?: StoreSettings;
}

export const NotaModal: React.FC<NotaModalProps> = ({
  isOpen,
  onClose,
  order,
  onOpenEditNota,
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
    const storeHeader = (settings?.nama_usaha || 'DISTRIBUTOR JOSJIS').toUpperCase();

    const lines = [
      `*${storeHeader}* 🛍️`,
      `*NOTA PENJUALAN CANVASSING*`,
      `---------------------------------`,
      `No. Nota: *${order.no_nota}*`,
      `Tgl Nota: *${formatDate(order.created_at || order.tanggal_pengiriman)}*`,
      `Toko: *${order.toko?.nama_toko || 'Toko Pelanggan'}*`,
      `Pemilik: ${order.toko?.nama_pemilik || '-'} (${order.toko?.no_hp || '-'})`,
      `Pasar: ${order.toko?.lokasi_pasar || '-'}`,
      `---------------------------------`,
      `*Daftar Rincian Pesanan:*`,
    ];

    if (order.items && order.items.length > 0) {
      order.items.forEach((item, idx) => {
        const name = item.product?.nama_produk || (item as any).nama_produk || 'Produk';
        const satuan = item.product?.satuan || (item as any).satuan || 'Pcs';
        lines.push(`${idx + 1}. *${name}*`);
        lines.push(`   ${item.jumlah} ${satuan} x @ ${formatIDR(item.harga_deal)} = *${formatIDR(item.subtotal)}*`);
      });
    } else {
      lines.push(`- (Detail pesanan tidak tersedia)`);
    }

    lines.push(`---------------------------------`);
    lines.push(`*TOTAL BAYAR: ${formatIDR(order.total_bayar)}*`);
    lines.push(`Terbilang: _${terbilang(order.total_bayar)}_`);
    lines.push(`Jenis Bayar: *${order.jenis_pembayaran}* (${order.status_pembayaran})`);
    lines.push(`Rencana Kirim: *${order.tanggal_pengiriman}*`);
    if (order.penerima_nama) {
      lines.push(`Diterima Oleh: *${order.penerima_nama}*`);
    }
    lines.push(`---------------------------------`);
    lines.push(`Terima kasih telah berbelanja di ${settings?.nama_usaha || 'kami'}! 🙏`);

    const waUrl = formattedHp
      ? `https://wa.me/${formattedHp}?text=${encodeURIComponent(lines.join('\n'))}`
      : `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-900 flex flex-col max-h-[95vh]">
        {/* Top Dialog Action Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
              FAKTUR
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Commercial Invoice / Faktur Penjualan</h3>
              <p className="text-[11px] font-mono text-slate-500">{order.no_nota}</p>
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

        {/* Printable Official Invoice Body (Matches User Reference Image 1-to-1) */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans flex-1 bg-white" id="print-nota">
          {/* Header 2 Columns: Company Info Left vs INVOICE Meta Right */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-300 pb-4">
            {/* Left: Company & Customer Info */}
            <div className="space-y-2 flex-1">
              <div>
                <h2 className="font-black text-base tracking-wide text-slate-900 uppercase">
                  {settings.nama_usaha}
                </h2>
                <p className="text-[11px] text-slate-600 font-medium leading-tight">
                  {settings.alamat_usaha}
                  <br />
                  Phone: {settings.no_telp} | Sales Lapangan
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <table className="text-[11px]">
                  <tbody>
                    <tr>
                      <td className="font-bold text-slate-700 pr-2">Customer</td>
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

            {/* Right: INVOICE Meta Table */}
            <div className="sm:text-right space-y-1 sm:w-64">
              <h1 className="text-2xl font-black tracking-widest text-slate-900 uppercase">
                I N V O I C E
              </h1>

              <table className="text-[11px] ml-auto text-left sm:text-right">
                <tbody>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Number</td>
                    <td className="pr-2">:</td>
                    <td className="font-mono font-bold text-slate-900">{order.no_nota}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Inv. Date</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-slate-900">
                      {formatDate(order.created_at || order.tanggal_pengiriman)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Payment Term</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-slate-900">{order.jenis_pembayaran}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Due Date</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-slate-900">{order.tanggal_pengiriman}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Salesman</td>
                    <td className="pr-2">:</td>
                    <td className="font-bold text-slate-900 uppercase">{settings.nama_pemilik}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-slate-600 pr-2 sm:pl-4">Currency</td>
                    <td className="pr-2">:</td>
                    <td className="font-mono font-bold text-slate-900">IDR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Table with Dashed Lines (Exactly matching user image) */}
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

          {/* Inword & Footers Grid (3 Columns / 2 Columns Layout) */}
          <div className="pt-2 border-t-2 border-dashed border-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Inword (Terbilang), Remark, & Bank Account */}
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

              {/* Bank Transfer Details */}
              <div className="pt-2 border-t border-slate-200 text-[10px]">
                <p className="font-extrabold underline text-slate-800 uppercase">TRANSFER VIA</p>
                <p className="font-bold text-slate-900">{settings.bank_name}</p>
                <p className="font-mono text-slate-700">A/C : {settings.bank_account}</p>
                <p className="font-semibold text-slate-700">A/N : {settings.bank_an}</p>
              </div>
            </div>

            {/* Right: Gross Total, Discount, Down Payment, Tax, Net Total Calculation */}
            <div className="space-y-1.5 text-right font-semibold text-[11px] sm:w-60 sm:ml-auto">
              <div className="flex justify-between">
                <span className="text-slate-600">Gross Total</span>
                <span className="font-bold text-slate-900">{formatIDR(order.total_bayar)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Discount Total</span>
                <span className="font-bold text-slate-900">Rp 0</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (0%)</span>
                <span>Rp 0</span>
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
              <p className="font-bold text-slate-700">Sincerely,</p>
              <div className="border-b border-slate-400 w-36 mx-auto"></div>
              <p className="font-bold text-slate-900 uppercase">{settings.nama_pemilik}</p>
              <p className="text-[10px] text-slate-500">( Sales / Distributor )</p>
            </div>

            <div className="space-y-10">
              <p className="font-bold text-slate-700">Customer Confirmation,</p>
              <div className="border-b border-slate-400 w-36 mx-auto"></div>
              <p className="font-bold text-slate-900 uppercase">
                {order.penerima_nama || order.toko?.nama_pemilik || 'Pemilik Toko'}
              </p>
              <p className="text-[10px] text-slate-500">( Penerima Barang )</p>
            </div>
          </div>

          {/* Audit Log / History Section */}
          {order.logs && order.logs.length > 0 && (
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[10px]">
              <h4 className="font-extrabold text-slate-700 flex items-center gap-1">
                <History className="w-3 h-3 text-slate-500" />
                Audit Log Perubahan Faktur:
              </h4>
              <div className="space-y-1">
                {order.logs.map((log) => (
                  <div key={log.id} className="p-1.5 bg-slate-50 rounded border border-slate-200 text-slate-600 flex justify-between">
                    <span>{log.catatan_perubahan}</span>
                    <span className="text-slate-400 font-mono">{new Date(log.created_at).toLocaleTimeString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Legal Disclaimer */}
          <div className="pt-4 text-center border-t border-slate-300">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
              {settings.catatan_faktur}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          {onOpenEditNota && (
            <button
              onClick={() => {
                onClose();
                onOpenEditNota(order);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Ubah Nota</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Unduh / Cetak PDF</span>
            </button>
            <button
              onClick={handleShareWA}
              className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Faktur WA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
