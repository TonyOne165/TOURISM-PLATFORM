import { useState } from 'react';
import type { PaymentMethod } from '../../types';

interface PaymentSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string; description: string }[] = [
  { value: 'credit_card', label: 'Tarjeta de Crédito', icon: '💳', description: 'Visa, Mastercard, Amex' },
  { value: 'debit_card', label: 'Tarjeta de Débito', icon: '🏦', description: 'Débito bancario' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️', description: 'Pago seguro con PayPal' },
  { value: 'google_pay', label: 'Google Pay', icon: '📱', description: 'Pago con Google' },
  { value: 'apple_pay', label: 'Apple Pay', icon: '🍎', description: 'Pago con Apple' },
  { value: 'pse', label: 'PSE', icon: '🏧', description: 'Transferencia bancaria Colombia' },
];

interface CardFormData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export const PaymentSelector = ({ selected, onSelect, disabled }: PaymentSelectorProps) => {
  const [cardForm, setCardForm] = useState<CardFormData>({ number: '', name: '', expiry: '', cvv: '' });

  const needsCardForm = selected === 'credit_card' || selected === 'debit_card';

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-brand-dark">Método de Pago</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PAYMENT_METHODS.map(method => (
          <button
            key={method.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(method.value)}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition text-left
              ${selected === method.value
                ? 'border-brand-blue bg-brand-blue/10'
                : 'border-brand-beige/60 hover:border-brand-brown bg-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-xl">{method.icon}</span>
            <div>
              <p className="text-sm font-medium text-brand-dark">{method.label}</p>
              <p className="text-xs text-brand-dark/50">{method.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Card Form (for credit/debit) */}
      {needsCardForm && (
        <div className="bg-white rounded-lg p-4 border border-brand-beige space-y-3 mt-3">
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-brand-dark text-xs">Número de tarjeta</span></label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="input input-bordered input-sm bg-white text-brand-dark border-brand-brown/30"
              value={cardForm.number}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                setCardForm({ ...cardForm, number: v.replace(/(.{4})/g, '$1 ').trim() });
              }}
              disabled={disabled}
            />
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-brand-dark text-xs">Nombre en la tarjeta</span></label>
            <input
              type="text"
              placeholder="Juan Pérez"
              className="input input-bordered input-sm bg-white text-brand-dark border-brand-brown/30"
              value={cardForm.name}
              onChange={e => setCardForm({ ...cardForm, name: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-brand-dark text-xs">Vencimiento</span></label>
              <input
                type="text"
                placeholder="MM/YY"
                className="input input-bordered input-sm bg-white text-brand-dark border-brand-brown/30"
                value={cardForm.expiry}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                  setCardForm({ ...cardForm, expiry: v });
                }}
                disabled={disabled}
              />
            </div>
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-brand-dark text-xs">CVV</span></label>
              <input
                type="text"
                placeholder="123"
                className="input input-bordered input-sm bg-white text-brand-dark border-brand-brown/30"
                value={cardForm.cvv}
                onChange={e => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                disabled={disabled}
              />
            </div>
          </div>
          <p className="text-xs text-brand-dark/40 mt-1">Pago simulado — no se procesará ningún cargo real.</p>
        </div>
      )}

      {/* PSE info */}
      {selected === 'pse' && (
        <div className="bg-white rounded-lg p-4 border border-brand-beige mt-3">
          <p className="text-sm text-brand-dark/70">Serás redirigido a tu banco para completar el pago. El administrador validará el pago manualmente.</p>
        </div>
      )}

      {/* Google/Apple Pay info */}
      {(selected === 'google_pay' || selected === 'apple_pay') && (
        <div className="bg-white rounded-lg p-4 border border-brand-beige mt-3">
          <p className="text-sm text-brand-dark/70">Pago simulado — se registrará como pendiente de validación por el administrador.</p>
        </div>
      )}

      {/* PayPal info */}
      {selected === 'paypal' && (
        <div className="bg-white rounded-lg p-4 border border-brand-beige mt-3">
          <p className="text-sm text-brand-dark/70">Serás redirigido a PayPal para completar tu pago de forma segura.</p>
        </div>
      )}
    </div>
  );
};
