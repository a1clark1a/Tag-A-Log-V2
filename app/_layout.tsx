import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { useEffect } from "react";
import { UIProvider } from "../src/context/UIContext";
import { ThemeProvider } from "../src/context/ThemeContext";

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
  return (
    <ThemeProvider>
      <UIProvider>
        <AuthProvider>
          <StatusBar style={"auto"} />
          <InitialLayout />
        </AuthProvider>
      </UIProvider>
    </ThemeProvider>
  );
}
