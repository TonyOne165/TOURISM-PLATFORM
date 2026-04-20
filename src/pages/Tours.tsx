import { useState } from 'react';
import { TourList } from '../components/tours/TourList';
import { GlobalMap } from '../components/map/GlobalMap';
import { useTours } from '../hooks/useTours';
import { useCity } from '../contexts/CityContext';
import { TOUR_CATEGORIES } from '../utils/constants';

const Tours = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const { selectedCity, setSelectedCity, cities } = useCity();

  const { tours, loading } = useTours();

  const cityFilteredTours = selectedCity
    ? tours.filter(t => t.city === selectedCity)
    : tours;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-brand-cream text-brand-dark">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Explora Nuestros Tours</h1>
            <p className="text-brand-dark/60">Descubre experiencias increíbles en Cartagena y más allá</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`btn btn-sm ${viewMode === 'list' ? 'bg-brand-blue text-white border-0' : 'btn-ghost text-brand-dark'}`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`btn btn-sm ${viewMode === 'map' ? 'bg-brand-blue text-white border-0' : 'btn-ghost text-brand-dark'}`}
            >
              Mapa
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-brand-beige rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* City Filter */}
            <div>
              <label className="label">
                <span className="label-text text-brand-dark">Ciudad</span>
              </label>
              <select
                className="select select-bordered w-full bg-white text-brand-dark border-brand-brown/30"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value as typeof selectedCity)}
              >
                <option value="">Todas las Ciudades</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="label">
                <span className="label-text text-brand-dark">Categoría</span>
              </label>
              <select
                className="select select-bordered w-full bg-white text-brand-dark border-brand-brown/30"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas las Categorías</option>
                {TOUR_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="label">
                <span className="label-text text-brand-dark">Rango de Precio</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="range range-xs range-primary"
                />
                <span className="text-brand-dark">a</span>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="range range-xs range-primary"
                />
              </div>
              <div className="flex justify-between text-sm mt-2 text-brand-dark/60">
                <span>${priceRange[0].toLocaleString()}</span>
                <span>${priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPriceRange([0, 1000000]);
                  setSelectedCity('');
                }}
                className="btn btn-ghost text-brand-dark"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-8">
          {viewMode === 'list' ? (
            <TourList
              tours={cityFilteredTours}
              loading={loading}
              categoryFilter={selectedCategory}
              priceRange={priceRange}
            />
          ) : (
            <GlobalMap tours={cityFilteredTours} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Tours;
