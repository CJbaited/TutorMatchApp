import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Tutor = {
  id: string;
  name: string;
  image: any;
  affiliation: string;
  specialization: string;
  rating: number;
  reviews: number;
  price: number;
};

type FavoritesContextType = {
  favorites: Tutor[];
  addFavorite: (tutor: Tutor) => void;
  removeFavorite: (tutorId: string) => void;
  isFavorite: (tutorId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState<Tutor[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites: Tutor[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addFavorite = (tutor: Tutor) => {
    setFavorites((prev) => {
      const newFavorites = [...prev, tutor];
      saveFavorites(newFavorites);
      return newFavorites;
    });
  };

  const removeFavorite = (tutorId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.filter((t) => t.id !== tutorId);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  };

  const isFavorite = (tutorId: string) => {
    return favorites.some((tutor) => tutor.id === tutorId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};