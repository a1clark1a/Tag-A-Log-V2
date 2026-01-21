import React, { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, Text, useTheme } from "react-native-paper";

interface UIContextType {
  showToast: (message: string, type?: "info" | "error") => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within a UIProvider");
  return context;
};

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "error">("info");

  const showToast = (msg: string, t: "info" | "error" = "info") => {
    setMessage(msg);
    setType(t);
    setVisible(true);
  };

  const handleDismiss = () => setVisible(false);

  const backgroundColor =
    type === "error" ? theme.colors.error : theme.colors.inverseSurface;
  const textColor =
    type === "error" ? theme.colors.onError : theme.colors.inverseOnSurface;

  return (
    <UIContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={handleDismiss}
        duration={3000}
        action={{
          label: "OK",
          textColor: textColor,
          onPress: handleDismiss,
        }}
        style={{ backgroundColor: backgroundColor, marginBottom: 20 }}
      >
        <Text style={{ color: textColor }}>{message}</Text>
      </Snackbar>
    </UIContext.Provider>
  );
};
