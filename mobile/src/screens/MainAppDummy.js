import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function MainAppDummy({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.title}>Main App (Dummy)</Text>
        <Text style={styles.subtitle}>You have successfully completed the onboarding!</Text>
        <Pressable 
          style={styles.button}
          onPress={() => navigation.navigate("Welcome")}
        >
          <Text style={styles.buttonText}>Go Back to Welcome</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#191C1E",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#434655",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#004AC6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
