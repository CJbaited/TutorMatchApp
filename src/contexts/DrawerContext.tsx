import React, { createContext, useContext, useState } from 'react';

type DrawerContextType = {
  isDrawerVisible: boolean;
  setDrawerVisible: (visible: boolean) => void;
};

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  return (
    <DrawerContext.Provider value={{ isDrawerVisible, setDrawerVisible }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};
