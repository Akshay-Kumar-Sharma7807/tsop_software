import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const ConstraintContext = createContext(null);

const DEFAULT_CONSTRAINTS = {
  minCompletionPct: { value: 30, enabled: true },
  tmRequired: { enabled: true },
  dmRequired: { enabled: true },
  admRequired: { enabled: true },
  minTotalMembers: { value: 5, enabled: false },
};

export function ConstraintProvider({ children }) {
  const [constraints, setConstraints] = useState(DEFAULT_CONSTRAINTS);
  const [loading, setLoading] = useState(true);

  // Fetch constraints from API on mount
  useEffect(() => {
    const fetchConstraints = async () => {
      try {
        const { data } = await api.get('/api/constraints');
        setConstraints(data);
      } catch (err) {
        console.error('Failed to fetch constraints, using defaults:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConstraints();
  }, []);

  // Update constraints optimistically then persist
  const updateConstraints = useCallback(async (patch) => {
    const updated = mergeDeep(constraints, patch);
    setConstraints(updated); // Optimistic update — instant re-score
    try {
      const { data } = await api.put('/api/constraints', patch);
      setConstraints(data); // Confirm with server response
    } catch (err) {
      console.error('Failed to save constraints:', err.message);
      // Roll back on error
      setConstraints(constraints);
    }
  }, [constraints]);

  return (
    <ConstraintContext.Provider value={{ constraints, updateConstraints, loading }}>
      {children}
    </ConstraintContext.Provider>
  );
}

export function useConstraints() {
  const ctx = useContext(ConstraintContext);
  if (!ctx) throw new Error('useConstraints must be used within ConstraintProvider');
  return ctx;
}

// Deep merge helper
function mergeDeep(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] !== null &&
      typeof target[key] === 'object'
    ) {
      result[key] = mergeDeep(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
