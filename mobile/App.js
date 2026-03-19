import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>CityYaari</Text>
        <Text style={styles.subtitle}>Dummy screen is running on Expo SDK 54.</Text>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: "#111827",
    textAlign: "center"
  }
});