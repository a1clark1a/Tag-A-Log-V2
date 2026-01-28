import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { router } from "expo-router";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });

    try {
      router.replace("/(tabs)");
    } catch (e) {
      console.log("Navigation reset failed", e);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Surface style={styles.card} elevation={4}>
            <Text variant="headlineMedium" style={styles.title}>
              Oops!
            </Text>
            <Text variant="bodyMedium" style={styles.message}>
              Something went wrong.
            </Text>
            <Text variant="bodySmall" style={styles.errorText}>
              {this.state.errorMessage}
            </Text>

            <Button
              mode="contained"
              onPress={this.handleReset}
              style={styles.button}
              buttonColor="#B00020"
            >
              Try Again
            </Button>
          </Surface>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 10,
    color: "#B00020",
  },
  message: {
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  errorText: {
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
    fontFamily: "monospace",
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 4,
  },
  button: {
    width: "100%",
  },
});

export default ErrorBoundary;
