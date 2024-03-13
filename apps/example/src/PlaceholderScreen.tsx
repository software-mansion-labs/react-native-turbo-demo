import React from "react";
import { View, StyleSheet, Text } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

interface Props {}

const PlaceholderScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <Text>👋 I'm just a placeholder</Text>
    </View>
  );
};

export default PlaceholderScreen;
