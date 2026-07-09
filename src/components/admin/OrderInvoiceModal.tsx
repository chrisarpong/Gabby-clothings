import React from 'react';
import { X, Printer } from 'lucide-react';
import { Doc } from '../../../convex/_generated/dataModel';
import { formatPrice, CurrencyCode } from '../../utils/currency';
import logo from '../../assets/logo.png';
import { useCurrencyStore } from '../../store/currencyStore';

interface OrderInvoiceModalProps {
  order: Doc<"orders">;
  onClose: () => void;
}

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function OrderInvoiceModal({ order, onClose }: OrderInvoiceModalProps) {
  const { activeCurrency, rates } = useCurrencyStore();
  const storeInfoSetting = useQuery(api.settings.getByKey, { key: "storeInfo" });
  const storeInfo = storeInfoSetting?.value;
  
  const storeName = storeInfo?.storeName || 'Gabby Newluk';
  const addressLine = storeInfo ? [storeInfo.street, storeInfo.city].filter(Boolean).join(", ") : 'East Legon, Accra';
  const countryLine = storeInfo?.country || 'Ghana';
  const emailLine = storeInfo?.contactEmail || 'hello@gabbynewluk.com';
  const phoneLine = storeInfo?.phone || '+233 (0) 55 123 4567';

  
  const displayCurrency = (order.displayCurrency as CurrencyCode) || activeCurrency;
  const displayRates = order.rateAtOrderTime ? { [displayCurrency]: order.rateAtOrderTime } : rates;

  const handlePrint = () => {
    window.print();
  };

  const orderDate = new Date(order._creationTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const orderNumber = order.orderId || `INV-${order._id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-6 print:p-0 print:bg-white print:block">
      
      {/* Floating Action Bar - Hidden on Print */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex gap-3 z-50 print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-[#352421] text-white px-5 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#352421]/85 transition-all shadow-xl flex items-center gap-2.5"
        >
          <Printer className="w-3.5 h-3.5" /> Save as PDF
        </button>
        <button 
          onClick={onClose}
          className="bg-white/90 text-[#352421] w-10 h-10 flex items-center justify-center hover:bg-white transition-all shadow-xl"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Invoice Sheet */}
      <div className="w-full max-w-[800px] bg-white shadow-2xl max-h-[92vh] overflow-y-auto print:h-auto print:overflow-visible print:shadow-none print:max-w-none print:max-h-none no-scrollbar">
        <div className="invoice-container bg-white text-[#352421]">
          
          {/* ═══════════════════════════════════════════ */}
          {/* Top Gold Accent Strip */}
          {/* ═══════════════════════════════════════════ */}
          <div className="h-1.5 bg-gradient-to-r from-[#b8860b] via-[#daa520] to-[#b8860b]" />

          {/* ═══════════════════════════════════════════ */}
          {/* Header Section */}
          {/* ═══════════════════════════════════════════ */}
          <div className="px-10 sm:px-14 pt-10 sm:pt-14 pb-8">
            <div className="flex items-start justify-between">
              {/* Logo + Brand */}
              <div className="flex items-center gap-4">
                <img src={logo} alt="Gabby Newluk" className="h-14 sm:h-16 w-auto object-contain" />
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl italic text-[#352421] tracking-tight leading-none">{storeName}</h1>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-5 h-px bg-[#daa520]" />
                    <span className="text-[8px] tracking-[0.3em] uppercase text-[#352421]/50 font-semibold">{storeInfo?.city || 'Accra'}, {countryLine}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Badge */}
              <div className="text-right">
                <div className="inline-block border-2 border-[#352421] px-5 py-2">
                  <span className="text-[10px] tracking-[0.35em] uppercase font-bold">
                    {order.paymentStatus === 'paid' ? 'RECEIPT' : (order.amountPaid ? 'DEPOSIT RECEIPT' : 'INVOICE')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* Invoice Meta + Customer Info Row */}
          {/* ═══════════════════════════════════════════ */}
          <div className="px-10 sm:px-14 pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-[#faf8f5] border border-[#352421]/8 p-6 sm:p-8">
              {/* Invoice Details */}
              <div>
                <h3 className="text-[9px] tracking-[0.3em] uppercase font-bold text-[#352421]/40 mb-4">Invoice Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline border-b border-dotted border-[#352421]/15 pb-2">
                    <span className="text-[11px] text-[#352421]/60 uppercase tracking-wider">No.</span>
                    <span className="text-sm font-bold font-mono tracking-wide">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-dotted border-[#352421]/15 pb-2">
                    <span className="text-[11px] text-[#352421]/60 uppercase tracking-wider">Date</span>
                    <span className="text-sm font-medium">{orderDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] text-[#352421]/60 uppercase tracking-wider">Payment</span>
                    <span className={`text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div>
                <h3 className="text-[9px] tracking-[0.3em] uppercase font-bold text-[#352421]/40 mb-4">Billed To</h3>
                <p className="text-base font-bold mb-1">{order.customerDetails?.firstName} {order.customerDetails?.lastName}</p>
                <p className="text-sm text-[#352421]/70">{order.customerDetails?.email}</p>
                {order.shippingAddress?.phone && (
                  <p className="text-sm text-[#352421]/70 mt-0.5">{order.shippingAddress.phone}</p>
                )}
                {order.shippingAddress && (
                  <div className="text-xs text-[#352421]/60 leading-relaxed mt-3 border-t border-[#352421]/10 pt-3">
                    <p className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#352421]/40 mb-1.5">Ship To</p>
                    <p>{order.shippingAddress.street || order.shippingAddress.address || order.shippingAddress.addressLine1}</p>
                    <p>{order.shippingAddress.city}{order.shippingAddress.region ? `, ${order.shippingAddress.region}` : (order.shippingAddress.state ? `, ${order.shippingAddress.state}` : '')} {order.shippingAddress.postalCode || order.shippingAddress.zipCode || ''}</p>
                    <p>{order.shippingAddress.country || 'Ghana'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* Decorative Divider */}
          {/* ═══════════════════════════════════════════ */}
          <div className="flex items-center gap-4 px-10 sm:px-14 mb-2">
            <div className="flex-1 h-px bg-[#352421]/10" />
            <div className="w-1.5 h-1.5 rotate-45 border border-[#daa520]" />
            <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-[#352421]/30">Order Summary</span>
            <div className="w-1.5 h-1.5 rotate-45 border border-[#daa520]" />
            <div className="flex-1 h-px bg-[#352421]/10" />
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* Items Table */}
          {/* ═══════════════════════════════════════════ */}
          <div className="px-10 sm:px-14 py-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-3 pr-4 text-[9px] tracking-[0.25em] uppercase font-bold text-[#352421]/40 border-b-2 border-[#352421]/20">Item</th>
                  <th className="py-3 px-3 text-[9px] tracking-[0.25em] uppercase font-bold text-[#352421]/40 border-b-2 border-[#352421]/20 text-center w-16">Qty</th>
                  <th className="py-3 px-3 text-[9px] tracking-[0.25em] uppercase font-bold text-[#352421]/40 border-b-2 border-[#352421]/20 text-right w-28">Price</th>
                  <th className="py-3 pl-3 text-[9px] tracking-[0.25em] uppercase font-bold text-[#352421]/40 border-b-2 border-[#352421]/20 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => {
                  const unitPrice = item.priceAtPurchase || item.priceAtTime || 0;
                  const lineTotal = unitPrice * item.quantity;
                  return (
                    <tr key={idx} className="border-b border-[#352421]/8 group">
                      <td className="py-5 pr-4 align-top">
                        <p className="font-semibold text-[13px] mb-0.5 text-[#352421]">{item.name || item.productName || 'Custom Garment'}</p>
                        {item.variantSku && (
                          <p className="text-[10px] text-[#352421]/50 font-mono">{item.variantSku}</p>
                        )}
                        
                        {/* custom-fit Measurements */}
                        {item.measurements && Object.keys(item.measurements).length > 0 && (
                          <div className="mt-3 relative">
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-[#daa520]/60" />
                            <div className="pl-4">
                              <p className="text-[8px] tracking-[0.25em] uppercase font-bold text-[#daa520]/80 mb-2">custom-fit Tailoring</p>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                                {Object.entries(item.measurements).map(([key, val]) => (
                                  <div key={key} className="flex items-baseline gap-1 text-[10px]">
                                    <span className="text-[#352421]/45 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="flex-1 border-b border-dotted border-[#352421]/10" />
                                    <span className="font-mono font-medium text-[#352421]/80">{String(val)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-5 px-3 align-top text-center text-sm font-mono text-[#352421]/70">{item.quantity}</td>
                      <td className="py-5 px-3 align-top text-right text-sm font-mono text-[#352421]/70">
                        {formatPrice(unitPrice, displayCurrency, displayRates)}
                      </td>
                      <td className="py-5 pl-3 align-top text-right text-sm font-mono font-semibold text-[#352421]">
                        {formatPrice(lineTotal, displayCurrency, displayRates)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-6">
              <div className="w-full sm:w-72">
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm text-[#352421]/60">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(order.subtotal || 0, displayCurrency, displayRates)}</span>
                  </div>
                  {(order.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-emerald-700">
                      <span>Discount</span>
                      <span className="font-mono">−{formatPrice(order.discountAmount, displayCurrency, displayRates)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-[#352421]/60">
                    <span>Shipping</span>
                    <span className="font-mono">{formatPrice(order.shippingFee || 0, displayCurrency, displayRates)}</span>
                  </div>
                </div>
                
                {/* Grand Total */}
                <div className="border-t-2 border-[#352421] pt-3 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#352421]/60">Total Amount</span>
                    <span className="font-serif text-2xl font-bold text-[#352421] tracking-tight">
                      {formatPrice(order.baseTotalAmount || order.totalAmount, displayCurrency, displayRates)}
                    </span>
                  </div>
                  
                  {order.amountPaid !== undefined && order.amountPaid > 0 && (
                     <>
                        <div className="flex justify-between items-baseline mt-2">
                           <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-emerald-700/80">Amount Paid</span>
                           <span className="font-serif text-xl font-bold text-emerald-700 tracking-tight">
                             {formatPrice(order.amountPaid, displayCurrency, displayRates)}
                           </span>
                        </div>
                        <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-dashed border-[#352421]/20">
                           <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-amber-700/80">Balance Due</span>
                           <span className="font-serif text-xl font-bold text-amber-700 tracking-tight">
                             {formatPrice(order.amountDue || ((order.baseTotalAmount || order.totalAmount) - order.amountPaid), displayCurrency, displayRates)}
                           </span>
                        </div>
                     </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* Footer */}
          {/* ═══════════════════════════════════════════ */}
          <div className="mt-6 bg-[#faf8f5] px-10 sm:px-14 py-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#daa520]" />
                <img src={logo} alt="" className="h-6 w-auto object-contain opacity-40" />
                <div className="w-8 h-px bg-[#daa520]" />
              </div>
              <p className="font-serif text-lg italic text-[#352421]/80 mb-2">Thank you for choosing Gabby Newluk.</p>
              <p className="text-[10px] text-[#352421]/40 max-w-sm leading-relaxed tracking-wide">
                Each piece is crafted with meticulous attention to detail — a modern translation of rich sartorial heritage. Wear it with pride.
              </p>
            </div>
            
            <div className="flex justify-between items-end text-[9px] text-[#352421]/30 border-t border-[#352421]/10 pt-4">
              <div className="leading-relaxed">
                <p>{storeName} Clothing · {addressLine} · {countryLine}</p>
                <p>{emailLine} · {phoneLine}</p>
              </div>
              <div className="text-right">
                <p>www.gabbynewluk.com</p>
              </div>
            </div>
          </div>

          {/* Bottom Gold Accent Strip */}
          <div className="h-1 bg-gradient-to-r from-[#b8860b] via-[#daa520] to-[#b8860b]" />

        </div>
      </div>
    </div>
  );
}
