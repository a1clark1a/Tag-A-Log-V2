import { Slot, useRouter, useSegments } from "expo-router";
import { useColorScheme } from "react-native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  adaptNavigationTheme,
} from "react-native-paper";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { useEffect } from "react";

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
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
    materialLight: customPaperLightTheme,
    materialDark: customPaperDarkTheme,
  });

const InitialLayout = () => {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (user && inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [user, loading, segments]);

  return <Slot />;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const paperTheme =
    colorScheme === "dark" ? customPaperDarkTheme : customPaperLightTheme;
  const navTheme =
    colorScheme === "dark" ? navigationDarkTheme : navigationLightTheme;

  return (
    <AuthProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationThemeProvider value={navTheme}>
          <StatusBar style={colorScheme === "dark" ? "dark" : "light"} />
          <InitialLayout />
        </NavigationThemeProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
