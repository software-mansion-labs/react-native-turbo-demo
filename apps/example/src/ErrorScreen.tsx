import React from "react";
import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

interface Props {}

const ErrorScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error loading page</Text>
      <Text style={styles.subtitle}>Page not found 😿</Text>
    </View>
  );
};

export default ErrorScreen;
