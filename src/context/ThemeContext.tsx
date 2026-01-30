import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAppTheme, ThemeId, THEMES } from "../config/themeConfig";

interface ThemeContextType {
  isDark: boolean;
  themeId: ThemeId;
  toggleTheme: () => void;
  setAppTheme: (id: ThemeId) => void;
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
  const [themeId, setThemeId] = useState<ThemeId>("green");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedDark = await AsyncStorage.getItem("userThemeDark");
        const savedId = await AsyncStorage.getItem("userThemeId");

        if (savedDark !== null) {
          setIsDark(savedDark === "true");
        }
        if (savedId !== null && Object.keys(THEMES).includes(savedId)) {
          setThemeId(savedId as ThemeId);
        }
      } catch (error) {
        console.error("Failed to load theme settings", error);
      }
    };

    loadSettings();
  }, []);

  const toggleTheme = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    await AsyncStorage.setItem("userThemeDark", String(newVal));
  };

  const setAppTheme = async (id: ThemeId) => {
    setThemeId(id);
    await AsyncStorage.setItem("userThemeId", id);
  };
  const { paperTheme, navigationTheme } = getAppTheme(themeId, isDark);
  return (
    <ThemeContext.Provider
      value={{ isDark, themeId, toggleTheme, setAppTheme }}
    >
      <PaperProvider theme={paperTheme}>
        <NavigationThemeProvider value={navigationTheme}>
          {children}
        </NavigationThemeProvider>
      </PaperProvider>
    </ThemeContext.Provider>
  );
};
