'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { Package, ShieldAlert, Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, qty: number, dealPrice: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [dealPrice, setDealPrice] = useState<number>(product.harga_normal);
  const [qty, setQty] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  const isBelowMinPrice = dealPrice < product.harga_minimum;
  const isOutOfStock = product.stok <= 0;

  const handleAdd = () => {
    if (isBelowMinPrice || isOutOfStock || qty < 1) return;
    onAddToCart(product, qty, dealPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      val
    );

  return (
    <div className="py-3 px-3 sm:px-4 bg-white border-b border-slate-200 transition-colors hover:bg-slate-50/80">
      {/* Top Row: Title, SKU, Category badge & Stock */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
              {product.category}
            </span>
            <span className="text-[11px] font-mono text-slate-500">{product.kode_sku}</span>
          </div>
          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{product.nama_produk}</h4>
          <p className="text-[11px] font-semibold text-slate-600">
            Satuan: <span className="text-slate-900 font-bold">{product.satuan}</span>
          </p>
        </div>

        <div className="text-right whitespace-nowrap">
          <span
            className={`text-xs font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
              product.stok > 10
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : product.stok > 0
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <Package className="w-3 h-3" />
            Stok: {product.stok}
          </span>
        </div>
      </div>

      {/* Price Guideline Row */}
      <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 rounded-lg border border-slate-200 my-2">
        <div className="text-slate-600 font-medium">
          Normal: <strong className="text-slate-900">{formatIDR(product.harga_normal)}</strong>
        </div>
        <div className="text-slate-700 font-bold">
          Min. Jual: <strong className="text-amber-700">{formatIDR(product.harga_minimum)}</strong>
        </div>
      </div>

      {/* Negotiation Input & Quantity Row (Compact Mobile Layout) */}
      <div className="flex items-center gap-2 pt-1">
        {/* Nawar Input */}
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-500">
              Rp
            </span>
            <input
              type="number"
              value={dealPrice}
              onChange={(e) => setDealPrice(Number(e.target.value))}
              step={500}
              min={0}
              placeholder="Harga Deal"
              className={`w-full pl-8 pr-2 py-1.5 bg-white border rounded-lg text-xs font-black text-slate-900 focus:outline-none transition-colors ${
                isBelowMinPrice
                  ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold focus:border-rose-600'
                  : 'border-slate-300 focus:border-emerald-600'
              }`}
            />
          </div>
        </div>

        {/* Qty Selector */}
        <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-2 py-1 text-slate-700 hover:bg-slate-200 font-black text-xs"
          >
            -
          </button>
          <span className="px-1.5 text-xs font-black text-slate-900 min-w-[20px] text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stok, q + 1))}
            disabled={qty >= product.stok}
            className="px-2 py-1 text-slate-700 hover:bg-slate-200 font-black text-xs disabled:opacity-30"
          >
            +
          </button>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          disabled={isBelowMinPrice || isOutOfStock}
          className={`px-3 py-1.5 rounded-lg font-extrabold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1 ${
            added
              ? 'bg-teal-600 text-white'
              : isBelowMinPrice || isOutOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>+ Order</span>
            </>
          )}
        </button>
      </div>

      {/* Warning message if price is below floor price */}
      {isBelowMinPrice && (
        <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600" />
          Harga minimum adalah {formatIDR(product.harga_minimum)}. Penjualan ini ditolak!
        </p>
      )}
    </div>
  );
};
