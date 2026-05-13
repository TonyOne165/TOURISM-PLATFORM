import { useEffect, useState } from 'react';

interface Props {
  country: string | null;
  city: string | null;
  place: string | null;
  onClose?: () => void;
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

export const InfoPanel: React.FC<Props> = ({ country, city, place, onClose }) => {
  const [data, setData] = useState<WikiSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const topic = place || city || country;
  const kind: 'place' | 'city' | 'country' | null = place ? 'place' : city ? 'city' : country ? 'country' : null;

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

  const kindLabel = kind === 'place' ? 'Lugar turístico' : kind === 'city' ? 'Ciudad' : 'País';
  const breadcrumb =
    kind === 'place' && country && city
      ? `${country} › ${city}`
      : kind === 'city' && country
      ? country
      : null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        bottom: '24px',
        width: '360px',
        maxWidth: 'calc(100vw - 48px)',
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '20px',
        padding: '20px',
        zIndex: 10,
        overflowY: 'auto',
        color: '#fff',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '14px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.72rem', color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            {kindLabel}
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '4px 0 0', wordBreak: 'break-word' }}>{topic}</h2>
          {breadcrumb && (
            <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '4px' }}>{breadcrumb}</div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar panel"
            style={{
              background: 'rgba(148, 163, 184, 0.15)',
              border: 'none',
              color: '#CBD5E1',
              cursor: 'pointer',
              fontSize: '1.1rem',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              flexShrink: 0,
              marginLeft: '8px',
            }}
          >
            ×
          </button>
        )}
      </div>

      {loading && (
        <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Cargando información...</div>
      )}

      {data?.thumbnail && (
        <img
          src={data.thumbnail.source}
          alt={topic}
          style={{
            width: '100%',
            borderRadius: '12px',
            marginBottom: '14px',
            maxHeight: '200px',
            objectFit: 'cover',
            border: '1px solid rgba(148, 163, 184, 0.15)',
          }}
        />
      )}

      {data?.extract && (
        <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#E2E8F0', margin: 0 }}>
          {data.extract}
        </p>
      )}

      {data?.content_urls?.desktop?.page && (
        <a
          href={data.content_urls.desktop.page}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '14px',
            fontSize: '0.85rem',
            color: '#93C5FD',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(147, 197, 253, 0.4)',
          }}
        >
          Leer más en Wikipedia →
        </a>
      )}

      {!loading && !data && (
        <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
          Sin información detallada disponible. Intenta hacer clic en otra ubicación.
        </div>
      )}
    </div>
  );
};
