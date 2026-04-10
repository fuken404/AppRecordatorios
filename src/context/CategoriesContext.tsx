import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Category } from '../types';
import { getCategories, saveCategories } from '../storage/storage';

// ─── Estado y acciones ───────────────────────────────────────────────────────

interface State {
  categories: Category[];
  loading: boolean;
}

type Action =
  | { type: 'LOADED'; payload: Category[] }
  | { type: 'ADD'; payload: Category }
  | { type: 'UPDATE'; payload: Category }
  | { type: 'DELETE'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADED':
      return { categories: action.payload, loading: false };
    case 'ADD':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      };
    case 'DELETE':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
      };
  }
}

// ─── Contexto ────────────────────────────────────────────────────────────────

interface CategoriesContextValue {
  categories: Category[];
  loading: boolean;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { categories: [], loading: true });

  useEffect(() => {
    getCategories().then((cats) => dispatch({ type: 'LOADED', payload: cats }));
  }, []);

  async function addCategory(category: Category) {
    const updated = [...state.categories, category];
    await saveCategories(updated);
    dispatch({ type: 'ADD', payload: category });
  }

  async function updateCategory(category: Category) {
    const updated = state.categories.map((c) => (c.id === category.id ? category : c));
    await saveCategories(updated);
    dispatch({ type: 'UPDATE', payload: category });
  }

  async function deleteCategory(id: string) {
    const updated = state.categories.filter((c) => c.id !== id);
    await saveCategories(updated);
    dispatch({ type: 'DELETE', id });
  }

  return (
    <CategoriesContext.Provider
      value={{
        categories: state.categories,
        loading: state.loading,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategories debe usarse dentro de CategoriesProvider');
  return ctx;
}
