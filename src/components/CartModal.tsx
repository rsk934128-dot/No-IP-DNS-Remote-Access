import React, { useState } from 'react';
import { ShoppingCart, X, Trash2, Tag, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  price: number;
  term: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onApplyPromoCode: (code: string) => boolean;
  hasDiscountApplied: boolean;
  appliedPromoCode: string;
  userEmail?: string;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onApplyPromoCode,
  hasDiscountApplied,
  appliedPromoCode,
  userEmail = 'fs2217732@gmail.com',
}) => {
  const [promoInput, setPromoInput] = useState(appliedPromoCode || '');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState(hasDiscountApplied);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = hasDiscountApplied ? subtotal * 0.25 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    if (!promoInput.trim()) return;

    const ok = onApplyPromoCode(promoInput.trim());
    if (ok) {
      setPromoSuccess(true);
    } else {
      setPromoError('Invalid coupon code. Use SEP25OFF for 25% off!');
      setPromoSuccess(false);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderComplete(true);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 text-[#ff6600]">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0a2540]">Your Shopping Cart</h3>
              <p className="text-xs text-slate-500">{cartItems.length} service item(s)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderComplete ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-[#0a2540]">Order Confirmed!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Thank you! Your Enhanced Dynamic DNS and Public Tunnels subscription is now active on your account ({userEmail}).
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-[#ff6600] text-white rounded-xl text-xs font-bold hover:bg-[#e65c00]"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <p className="font-semibold text-sm">Your cart is currently empty.</p>
                <p className="text-xs mt-1">Upgrade to Enhanced DDNS or Public Tunnels with code <span className="font-mono font-bold text-[#ff6600]">SEP25OFF</span>!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900">{item.name}</h5>
                      <p className="text-[11px] text-slate-500">{item.description} ({item.term})</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">/{item.term}</span>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Promo Code Input */}
            <form onSubmit={handleApply} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label htmlFor="promo-code-input" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#ff6600]" />
                Promo Code / Discount Coupon:
              </label>
              <div className="flex gap-2">
                <input
                  id="promo-code-input"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SEP25OFF"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase outline-none focus:border-[#ff6600]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
                >
                  Apply
                </button>
              </div>
              {promoSuccess && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Code SEP25OFF applied! 25% discount activated.
                </p>
              )}
              {promoError && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  {promoError}
                </p>
              )}
            </form>

            {/* Subtotal Calculation */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {hasDiscountApplied && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>25% Promo Discount (SEP25OFF):</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-100">
                  <span>Estimated Total:</span>
                  <span className="font-mono text-base text-[#ff6600]">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                disabled={cartItems.length === 0 || isCheckingOut}
                onClick={handleCheckout}
                className="w-full py-3 bg-[#ff6600] hover:bg-[#e65c00] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCheckingOut ? (
                  'Processing Secure Payment...'
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Complete Secure Checkout
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
