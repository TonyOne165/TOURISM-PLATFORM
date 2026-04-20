import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useBookings } from '../../hooks/useBookings';
import { usePromotions } from '../../hooks/usePromotions';
import { PaymentSelector } from '../../components/payment/PaymentSelector';
import type { PaymentMethod } from '../../types';

export const UserCart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateItem, clearCart, totalPrice } = useCart();
  const { createBooking } = useBookings();
  const { validatePromoCode, applyDiscount, usePromoCode } = usePromotions();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ id: string; description: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleApplyPromo = async () => {
    setPromoError('');
    setPromoApplied(null);
    try {
      const promo = await validatePromoCode(promoCode);
      if (!promo) {
        setPromoError('Código inválido o expirado');
        return;
      }
      const totalParticipants = items.reduce((sum, item) => sum + item.participants, 0);
      const discountedPrice = applyDiscount(totalPrice, promo, totalParticipants);
      const discount = totalPrice - discountedPrice;
      if (discount <= 0) {
        setPromoError('Este código no aplica a tu compra actual');
        return;
      }
      setPromoApplied({ id: promo.id!, description: promo.description, discount });
    } catch (err) {
      setPromoError('Error al validar el código');
    }
  };

  const finalPrice = promoApplied ? Math.max(0, totalPrice - promoApplied.discount) : totalPrice;

  const handleCheckout = async () => {
    setCheckoutError('');

    if (!items || items.length === 0) {
      setCheckoutError('El carrito está vacío');
      return;
    }

    const itemsWithoutDate = items.filter(item => !item.date);
    if (itemsWithoutDate.length > 0) {
      setCheckoutError('Por favor, selecciona una fecha para todos los items');
      return;
    }

    if (!paymentMethod) {
      setCheckoutError('Por favor, selecciona un método de pago');
      return;
    }

    setProcessing(true);
    try {
      // Calculate per-item discount distribution
      const discountPerItem = promoApplied ? promoApplied.discount / items.length : 0;

      for (const item of items) {
        const itemTotal = item.price * item.participants;
        const itemDiscount = Math.min(discountPerItem, itemTotal);
        const itemFinalPrice = itemTotal - itemDiscount;

        await createBooking({
          type: item.type,
          tourId: item.type === 'tour' ? item.itemId : undefined,
          tourTitle: item.type === 'tour' ? item.title : undefined,
          accommodationId: item.type === 'accommodation' ? item.itemId : undefined,
          accommodationName: item.type === 'accommodation' ? item.title : undefined,
          date: new Date(item.date),
          endDate: item.endDate ? new Date(item.endDate) : undefined,
          participants: item.participants || 1,
          totalPrice: itemFinalPrice,
          notes: item.notes,
          promoCode: promoApplied ? promoCode.toUpperCase() : undefined,
          discount: itemDiscount > 0 ? itemDiscount : undefined,
          paymentMethod,
        });
      }

      if (promoApplied) {
        try {
          await usePromoCode(promoApplied.id);
        } catch (promoErr) {
          console.warn('Could not update promo usage count:', promoErr);
          // Non-blocking: booking was already created, promo count update is secondary
        }
      }

      clearCart();
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/bookings');
      }, 2500);
    } catch (err: any) {
      console.error('Error al procesar la reserva:', err);
      setCheckoutError(`Error: ${err?.message || 'Error desconocido al procesar la reserva'}`);
    } finally {
      setProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-green-700 mb-2">¡Reserva Exitosa!</h2>
          <p className="text-green-600">Tu reserva ha sido procesada correctamente.</p>
          <p className="text-green-600 text-sm mt-2">Redirigiendo a tus reservas...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-brand-dark">Carrito de Compras</h1>
        <div className="card bg-brand-cream shadow-sm border border-brand-beige">
          <div className="card-body text-center">
            <span className="text-5xl mb-3">🛒</span>
            <p className="text-brand-dark/60">Tu carrito está vacío</p>
            <button className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 btn-sm mt-3" onClick={() => navigate('/tours')}>Explorar Tours</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-brand-dark">Carrito de Compras</h1>
        <button className="btn btn-ghost btn-sm text-error" onClick={clearCart}>Vaciar Carrito</button>
      </div>

      {checkoutError && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card bg-brand-cream shadow-md border border-brand-beige">
              <div className="card-body p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img src={item.image} alt={item.title} className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <span className="badge badge-outline badge-sm border-brand-brown text-brand-dark">{item.type === 'tour' ? 'Tour' : 'Hospedaje'}</span>
                        <h3 className="font-semibold text-brand-dark">{item.title}</h3>
                      </div>
                      <button className="btn btn-ghost btn-sm text-error" onClick={() => removeItem(item.id)}>✕</button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-2">
                      <div className="form-control">
                        <label className="label label-text text-xs text-brand-dark">Fecha</label>
                        <input type="date" className="input input-bordered input-sm bg-white text-brand-dark border-brand-brown/30" value={item.date}
                          onChange={e => updateItem(item.id, { date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-control">
                        <label className="label label-text text-xs text-brand-dark">Personas</label>
                        <input type="number" className="input input-bordered input-sm w-20 bg-white text-brand-dark border-brand-brown/30" value={item.participants}
                          onChange={e => updateItem(item.id, { participants: Math.max(1, parseInt(e.target.value) || 1) })} min="1" />
                      </div>
                      <div className="text-right mt-auto">
                        <p className="text-lg font-bold text-brand-blue">${(item.price * item.participants).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Payment Method */}
          <div className="card bg-brand-cream shadow-md border border-brand-beige">
            <div className="card-body p-4">
              <PaymentSelector
                selected={paymentMethod}
                onSelect={setPaymentMethod}
                disabled={processing}
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card bg-brand-cream shadow-md h-fit lg:sticky lg:top-20 border border-brand-beige">
          <div className="card-body">
            <h2 className="card-title text-lg text-brand-dark">Resumen</h2>
            <div className="space-y-2 py-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-brand-dark/70">
                  <span className="truncate max-w-[60%]">{item.title}</span>
                  <span>${(item.price * item.participants).toLocaleString()}</span>
                </div>
              ))}
              <div className="divider my-1"></div>
              <div className="flex justify-between text-brand-dark"><span>Subtotal</span><span>${totalPrice.toLocaleString()}</span></div>
              {promoApplied && (
                <div className="flex justify-between text-success">
                  <span>Descuento</span><span>-${promoApplied.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="divider my-1"></div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-brand-dark">Total</span><span className="text-brand-blue">${finalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="form-control">
              <div className="flex gap-2">
                <input type="text" placeholder="Código promo" className="input input-bordered input-sm flex-1 bg-white text-brand-dark border-brand-brown/30"
                  value={promoCode} onChange={e => setPromoCode(e.target.value)} disabled={!!promoApplied} />
                {promoApplied ? (
                  <button className="btn btn-sm btn-ghost text-error" onClick={() => { setPromoApplied(null); setPromoCode(''); }}>✕</button>
                ) : (
                  <button className="btn btn-sm bg-brand-blue text-white hover:bg-brand-dark border-0" onClick={handleApplyPromo} disabled={!promoCode.trim()}>Aplicar</button>
                )}
              </div>
              {promoError && <p className="text-xs text-error mt-1">{promoError}</p>}
              {promoApplied && <p className="text-xs text-success mt-1">{promoApplied.description}</p>}
            </div>

            {/* Payment method indicator */}
            {paymentMethod && (
              <div className="bg-brand-blue/10 rounded-lg p-2 mt-2">
                <p className="text-xs text-brand-dark/70">Pago: <strong>{PAYMENT_LABELS[paymentMethod]}</strong></p>
              </div>
            )}

            <button
              className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 w-full mt-4"
              onClick={handleCheckout}
              disabled={processing || !paymentMethod}
            >
              {processing ? (
                <><span className="loading loading-spinner loading-sm"></span> Procesando...</>
              ) : (
                `Pagar $${finalPrice.toLocaleString()}`
              )}
            </button>
            {!paymentMethod && <p className="text-xs text-brand-brown text-center mt-1">Selecciona un método de pago</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const PAYMENT_LABELS: Record<string, string> = {
  paypal: 'PayPal',
  google_pay: 'Google Pay',
  apple_pay: 'Apple Pay',
  credit_card: 'Tarjeta de Crédito',
  debit_card: 'Tarjeta de Débito',
  pse: 'PSE',
};
