import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  WelcomeScreen,
  OnboardingScreen,
  AccessAccountScreen,
  MainTabs,
} from "./src/screens";
import { AuthProvider, useAuth } from './src/store/AuthContext';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

const Navigation = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? "MainTabs" : "Welcome"}
      screenOptions={{ headerShown: false }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="AccessAccount" component={AccessAccountScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
