import { useNavigate } from 'react-router-dom';
import type { Tour, Accommodation } from '@/types';

export type GlobeItem =
  | { kind: 'tour'; data: Tour }
  | { kind: 'accommodation'; data: Accommodation };

interface Props {
  item: GlobeItem;
  onClose: () => void;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export const ItemPanel: React.FC<Props> = ({ item, onClose }) => {
  const navigate = useNavigate();

  const isTour = item.kind === 'tour';
  const tour = isTour ? (item.data as Tour) : null;
  const acc = !isTour ? (item.data as Accommodation) : null;

  const title = tour?.title ?? acc?.name ?? '';
  const slug = tour?.slug ?? acc?.slug ?? '';
  const description = tour?.description ?? acc?.description ?? '';
  const image = (tour?.images?.[0] ?? acc?.images?.[0]) || '';
  const price = tour?.price ?? acc?.pricePerNight ?? 0;
  const priceSuffix = isTour ? '' : ' / noche';
  const rating = tour?.rating ?? acc?.rating ?? 0;
  const detailPath = isTour ? `/tours/${slug}` : `/accommodations/${slug}`;
  const accentColor = isTour ? '#FB7185' : '#2DD4BF'; // rose-400 vs teal-400
  const kindLabel = isTour ? 'Tour' : 'Hospedaje';

  const onReserve = () => {
    navigate(detailPath);
  };

  return (
    <div className="planet-item-panel">
      <button onClick={onClose} aria-label="Cerrar" className="planet-item-panel__close">
        ×
      </button>

      {image && (
        <div className="planet-item-panel__hero" style={{ borderColor: `${accentColor}66` }}>
          <img src={image} alt={title} loading="lazy" />
          <span
            className="planet-item-panel__badge"
            style={{ background: accentColor }}
          >
            {kindLabel}
          </span>
        </div>
      )}

      <div className="planet-item-panel__body">
        <h2 className="planet-item-panel__title">{title}</h2>

        <div className="planet-item-panel__meta">
          <span className="planet-item-panel__price" style={{ color: accentColor }}>
            {formatPrice(price)}
            <small>{priceSuffix}</small>
          </span>
          {rating > 0 && (
            <span className="planet-item-panel__rating" aria-label={`Calificación ${rating} de 5`}>
              ★ {rating.toFixed(1)}
            </span>
          )}
        </div>

        {tour?.duration && (
          <div className="planet-item-panel__chip">⏱ {tour.duration}</div>
        )}
        {acc?.address && (
          <div className="planet-item-panel__chip">📍 {acc.address}</div>
        )}
        {acc?.amenities && acc.amenities.length > 0 && (
          <div className="planet-item-panel__amenities">
            {acc.amenities.slice(0, 4).map((a) => (
              <span key={a} className="planet-item-panel__chip planet-item-panel__chip--mini">{a}</span>
            ))}
          </div>
        )}

        {description && (
          <p className="planet-item-panel__desc">
            {description.length > 220 ? `${description.slice(0, 220)}…` : description}
          </p>
        )}

        <button
          onClick={onReserve}
          className="planet-item-panel__cta"
          style={{ background: accentColor }}
        >
          Realizar Reserva →
        </button>
      </div>
    </div>
  );
};
