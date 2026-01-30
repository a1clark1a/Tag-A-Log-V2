import { MD3LightTheme, MD3DarkTheme, MD3Theme } from "react-native-paper";
import {
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
  Theme as NavigationTheme,
} from "@react-navigation/native";

export const THEMES = {
  green: {
    name: "Tag-A-Log (Default)",
    primaryLight: "#22A565",
    primaryDark: "#FFC107",
    backgroundLight: "#FFFFFF",
    backgroundDark: "#1A1A1A",
  },
  yellow: {
    name: "Soft Sun",
    primaryLight: "#F4D35E",
    primaryDark: "#e6a466",
    backgroundLight: "#F9FAFB",
    backgroundDark: "#1E1E1E",
  },
  blue: {
    name: "Tech Blue",
    primaryLight: "#3A7BFF",
    primaryDark: "#749ff5",
    backgroundLight: "#F7F7F5",
    backgroundDark: "#1E1E1E",
  },
  purple: {
    name: "Cyberpunk",
    primaryLight: "#9B51E0",
    primaryDark: "#00E5FF",
    backgroundLight: "#FFFFFF",
    backgroundDark: "#0D0D0D",
  },
  red: {
    name: "Radiant Red",
    primaryLight: "#b40000",
    primaryDark: "#f17272",
    backgroundDark: "#0D0D0D",
    backgroundLight: "#FFFFFF",
  },
};

export type ThemeId = keyof typeof THEMES;

export interface AppThemes {
  paperTheme: MD3Theme;
  navigationTheme: NavigationTheme;
}

export const getAppTheme = (themeId: ThemeId, isDark: boolean) => {
  const palette = THEMES[themeId];
  const basePaper = isDark ? MD3DarkTheme : MD3LightTheme;
  const baseNav = isDark ? NavDarkTheme : NavDefaultTheme;

  const paperTheme: MD3Theme = {
    ...basePaper,
    colors: {
      ...basePaper.colors,
      primary: isDark ? palette.primaryDark : palette.primaryLight,
      background: isDark ? palette.backgroundDark : palette.backgroundLight,
      surface: isDark ? palette.backgroundDark : palette.backgroundLight,
    },
  };

  const navigationTheme: NavigationTheme = {
    ...baseNav,
    colors: {
      ...baseNav.colors,
      primary: isDark ? palette.primaryDark : palette.primaryLight,
      background: isDark ? palette.backgroundDark : palette.backgroundLight,
      card: isDark ? palette.backgroundDark : palette.backgroundLight,
      text: isDark ? "#FFFFFF" : "#1A1A1A",
    },
  };

  return {
    paperTheme,
    navigationTheme,
  };
};
