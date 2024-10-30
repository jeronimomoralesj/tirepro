// src/contexts/FilterContext.js
import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [activeFilters, setActiveFilters] = useState({});

  const setFilter = (key, value) => {
    setActiveFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const clearFilter = (key) => {
    setActiveFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      delete updatedFilters[key];
      return updatedFilters;
    });
  };

  return (
    <FilterContext.Provider value={{ activeFilters, setFilter, clearFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

// Hook to use the filter context
export const useFilter = () => useContext(FilterContext);
