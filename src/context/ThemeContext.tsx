import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const customPaperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6200ee",
    secondary: "#03dac6",
  },
};

const customPaperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#bb86fc",
    secondary: "#03dac6",
  },
};

const { LightTheme: navigationLightTheme, DarkTheme: navigationDarkTheme } =
  adaptNavigationTheme({
    reactNavigationLight: NavDefaultTheme,
    reactNavigationDark: NavDarkTheme,
    materialLight: customPaperLightTheme,
    materialDark: customPaperDarkTheme,
  });

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...navigationLightTheme.colors,
  },
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...navigationDarkTheme.colors,
  },
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useAppTheme must be used within a ThemeProvider");
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem("userTheme");
      if (saved !== null) {
        setIsDark(saved === "true");
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    await AsyncStorage.setItem("userTheme", String(newVal));
  };

  const theme = (isDark ? CombinedDarkTheme : CombinedDefaultTheme) as any;
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <PaperProvider theme={theme}>
        <NavigationThemeProvider value={theme}>
          {children}
        </NavigationThemeProvider>
      </PaperProvider>
    </ThemeContext.Provider>
  );
};
