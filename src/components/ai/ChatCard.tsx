import { useNavigate } from 'react-router-dom';
import type { ChatCard as ChatCardType } from '../../types';

interface ChatCardProps {
  card: ChatCardType;
  onAction?: (action: string) => void;
}

export const ChatCardComponent = ({ card, onAction }: ChatCardProps) => {
  const navigate = useNavigate();
  const basePath = card.type === 'tour' ? '/tours' : '/accommodations';
  const priceLabel = card.type === 'tour' ? '' : '/noche';

  return (
    <div className="bg-white rounded-xl border border-brand-beige/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow w-56 shrink-0">
      {/* Image */}
      <div className="relative h-28 overflow-hidden">
        <img
          src={card.image}
          alt={card.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-brand-dark/70 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          ⭐ {card.rating.toFixed(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="font-semibold text-sm text-brand-dark line-clamp-1">{card.title}</h4>
        {card.subtitle && (
          <p className="text-xs text-brand-dark/50 mt-0.5">{card.subtitle}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-brand-blue text-sm">
            ${card.price}{priceLabel}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => navigate(`${basePath}/${card.slug}`)}
              className="btn btn-xs bg-brand-blue text-white hover:bg-brand-dark border-0"
            >
              Ver
            </button>
            <button
              onClick={() => onAction?.(`Quiero reservar ${card.title}`)}
              className="btn btn-xs btn-outline border-brand-brown text-brand-dark hover:bg-brand-brown hover:text-white"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
