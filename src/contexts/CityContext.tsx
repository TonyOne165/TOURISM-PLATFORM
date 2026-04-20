import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export const CITIES = ['San Andrés Islas', 'Cartagena'] as const;
export type City = typeof CITIES[number];

interface CityContextValue {
  selectedCity: City | '';
  setSelectedCity: (city: City | '') => void;
  cities: readonly string[];
}

const CityContext = createContext<CityContextValue | undefined>(undefined);

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCity, setSelectedCity] = useState<City | ''>('');

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, cities: CITIES }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
