import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccommodations } from '../hooks/useAccommodations';
import { useCity } from '../contexts/CityContext';
import { ACCOMMODATION_TYPES } from '../utils/constants';

const Accommodations = () => {
  const { accommodations, loading } = useAccommodations();
  const { selectedCity, setSelectedCity, cities } = useCity();
  const [typeFilter, setTypeFilter] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [search, setSearch] = useState('');

  const filtered = accommodations.filter(a => {
    if (selectedCity && a.city !== selectedCity) return false;
    if (typeFilter && a.type !== typeFilter) return false;
    if (a.pricePerNight < priceRange[0] || a.pricePerNight > priceRange[1]) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-brand-cream">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-brand-dark">Hospedajes</h1>
          <p className="text-brand-dark/60">Encuentra el alojamiento perfecto para tu viaje</p>
        </div>

        {/* Filters */}
        <div className="bg-brand-beige rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* City Filter */}
            <div>
              <label className="label"><span className="label-text text-brand-dark">Ciudad</span></label>
              <select className="select select-bordered w-full bg-white text-brand-dark border-brand-brown/30"
                value={selectedCity} onChange={e => setSelectedCity(e.target.value as typeof selectedCity)}>
                <option value="">Todas</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label"><span className="label-text text-brand-dark">Buscar</span></label>
              <input type="text" placeholder="Nombre del hospedaje..." className="input input-bordered w-full bg-white text-brand-dark border-brand-brown/30"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="label"><span className="label-text text-brand-dark">Tipo</span></label>
              <select className="select select-bordered w-full bg-white text-brand-dark border-brand-brown/30" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">Todos</option>
                {ACCOMMODATION_TYPES.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label"><span className="label-text text-brand-dark">Precio máx/noche: ${priceRange[1]}</span></label>
              <input type="range" min="0" max="500" value={priceRange[1]}
                onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                className="range range-primary range-sm" />
            </div>
            <div className="flex items-end">
              <button className="btn btn-ghost text-brand-dark" onClick={() => { setTypeFilter(''); setPriceRange([0, 500]); setSearch(''); setSelectedCity(''); }}>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-brand-blue"></span></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-brand-dark/60">No se encontraron hospedajes</p>
            {selectedCity && (
              <button className="btn btn-ghost btn-sm mt-3" onClick={() => setSelectedCity('')}>
                Ver todos los hospedajes
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(acc => (
              <div key={acc.id} className="card bg-brand-cream shadow-xl hover:shadow-2xl transition-shadow border border-brand-beige">
                <figure className="h-48 overflow-hidden">
                  <img
                    src={acc.images?.[0] || 'https://placehold.co/400x300?text=No+Image'}
                    alt={acc.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </figure>
                <div className="card-body">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-outline badge-sm border-brand-brown text-brand-dark">{acc.type}</span>
                    {acc.city && <span className="badge badge-sm bg-brand-blue text-white border-0">{acc.city}</span>}
                    {acc.featured && <span className="badge bg-brand-brown text-white border-0 badge-sm">Destacado</span>}
                  </div>
                  <h2 className="card-title text-brand-dark">{acc.name}</h2>
                  <p className="text-sm text-brand-dark/60 line-clamp-2">{acc.description}</p>

                  <div className="flex items-center gap-2 my-2">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-sm text-brand-dark">{acc.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-brand-dark/40">({acc.reviewCount} reseñas)</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 my-1">
                    {acc.amenities.slice(0, 4).map(a => (
                      <span key={a} className="badge badge-ghost badge-sm bg-brand-beige/50 text-brand-dark">{a}</span>
                    ))}
                    {acc.amenities.length > 4 && (
                      <span className="badge badge-ghost badge-sm bg-brand-beige/50 text-brand-dark">+{acc.amenities.length - 4}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-brand-blue font-bold text-lg">${acc.pricePerNight}</span>
                      <span className="text-sm text-brand-dark/60">/noche</span>
                    </div>
                    <span className="text-sm text-brand-dark/60">Máx. {acc.maxGuests} huéspedes</span>
                  </div>

                  <div className="card-actions justify-end mt-3">
                    <Link to={`/accommodations/${acc.slug}`} className="btn bg-brand-blue text-white hover:bg-brand-dark border-0 btn-sm">Ver Detalles</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Accommodations;
