import { useEffect, useState } from 'react';

interface Props {
  country: string | null;
  city: string | null;
  place: string | null;
  onClose?: () => void;
  /** When true, the panel collapses to a thin bar regardless of user toggle.
   *  Used to get the panel out of the way when an ItemPanel (tour/accommodation) is open. */
  forceCollapsed?: boolean;
}

interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
}

async function fetchWikiSummary(title: string, lang: 'es' | 'en'): Promise<WikiSummary | null> {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const InfoPanel: React.FC<Props> = ({ country, city, place, onClose, forceCollapsed }) => {
  const [data, setData] = useState<WikiSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(true);

  const topic = place || city || country;
  const kind: 'place' | 'city' | 'country' | null = place ? 'place' : city ? 'city' : country ? 'country' : null;

  // When an ItemPanel opens (forceCollapsed=true), snap back to collapsed even if the user had
  // expanded the panel. Doesn't lock — once forceCollapsed flips false, the user can re-expand.
  useEffect(() => {
    if (forceCollapsed) setUserCollapsed(true);
  }, [forceCollapsed]);

  useEffect(() => {
    if (!topic) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setData(null);
    (async () => {
      const r = (await fetchWikiSummary(topic, 'es')) || (await fetchWikiSummary(topic, 'en'));
      if (!cancelled) {
        setData(r);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [topic]);

  if (!topic) return null;

  const collapsed = forceCollapsed || userCollapsed;
  const kindLabel = kind === 'place' ? 'Lugar turístico' : kind === 'city' ? 'Ciudad' : 'País';
  const breadcrumb =
    kind === 'place' && country && city
      ? `${country} › ${city}`
      : kind === 'city' && country
      ? country
      : null;

  return (
    <aside
      className={`planet-info-panel${collapsed ? ' planet-info-panel--collapsed' : ''}`}
      aria-label="Información del destino"
    >
      {/* Collapsed-state toggle — a tap target that hugs the visible edge of the panel.
          Hidden via CSS when the panel is expanded; the regular header takes over instead. */}
      <button
        type="button"
        className="planet-info-panel__toggle"
        onClick={() => setUserCollapsed(c => !c)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? `Mostrar información de ${topic}` : 'Ocultar información'}
      >
        <span className="planet-info-panel__toggle-grip" aria-hidden="true" />
        <span className="planet-info-panel__toggle-label">{topic}</span>
        <span className="planet-info-panel__toggle-chevron" aria-hidden="true">⌃</span>
      </button>

      <header className="planet-info-panel__header">
        <div className="planet-info-panel__heading">
          <div className="planet-info-panel__kind">{kindLabel}</div>
          <h2 className="planet-info-panel__title">{topic}</h2>
          {breadcrumb && <div className="planet-info-panel__breadcrumb">{breadcrumb}</div>}
        </div>
        <div className="planet-info-panel__header-actions">
          <button
            type="button"
            onClick={() => setUserCollapsed(true)}
            aria-label="Minimizar panel"
            className="planet-info-panel__minimize"
          >
            –
          </button>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Cerrar panel"
              className="planet-info-panel__close"
            >
              ×
            </button>
          )}
        </div>
      </header>

      <div className="planet-info-panel__body">
        {loading && (
          <div className="planet-info-panel__loading">Cargando información…</div>
        )}

        {data?.thumbnail && (
          <img
            src={data.thumbnail.source}
            alt={topic}
            className="planet-info-panel__image"
            loading="lazy"
          />
        )}

        {data?.extract && (
          <p className="planet-info-panel__extract">{data.extract}</p>
        )}

        {data?.content_urls?.desktop?.page && (
          <a
            href={data.content_urls.desktop.page}
            target="_blank"
            rel="noopener noreferrer"
            className="planet-info-panel__link"
          >
            Leer más en Wikipedia →
          </a>
        )}

        {!loading && !data && (
          <div className="planet-info-panel__loading">
            Sin información detallada disponible. Intenta hacer clic en otra ubicación.
          </div>
        )}
      </div>
    </aside>
  );
};
