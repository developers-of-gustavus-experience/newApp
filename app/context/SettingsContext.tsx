import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  FEshown: boolean;
  WTEshown: boolean;
  LNshown: boolean;
  setFEshown: (value: boolean) => void;
  setWTEshown: (value: boolean) => void;
  setLNshown: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [FEshown, setFEshown] = useState(true); // Featured Events
  const [WTEshown, setWTEshown] = useState(true); // Where to eat
  const [LNshown, setLNshown] = useState(true); // Latest News

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings();
  }, [FEshown, WTEshown, LNshown]);

  const loadSettings = async () => {
    try {
      const savedFE = await AsyncStorage.getItem('FEshown');
      const savedWTE = await AsyncStorage.getItem('WTEshown');
      const savedLN = await AsyncStorage.getItem('LNshown');

      if (savedFE !== null) setFEshown(JSON.parse(savedFE));
      if (savedWTE !== null) setWTEshown(JSON.parse(savedWTE));
      if (savedLN !== null) setLNshown(JSON.parse(savedLN));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('FEshown', JSON.stringify(FEshown));
      await AsyncStorage.setItem('WTEshown', JSON.stringify(WTEshown));
      await AsyncStorage.setItem('LNshown', JSON.stringify(LNshown));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        FEshown,
        WTEshown,
        LNshown,
        setFEshown,
        setWTEshown,
        setLNshown,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
