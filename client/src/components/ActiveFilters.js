import React from 'react';
import { useFilter } from '../contexts/FilterContext';

const ActiveFilters = () => {
  const { activeFilters, clearFilter } = useFilter();

  // Render active filters
  return (
    <div className="active-filters">
      {Object.entries(activeFilters).map(([key, value]) => (
        <div key={key} className="filter-item">
          <span>{key}: {value}</span>
          <button onClick={() => clearFilter(key)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default ActiveFilters;
