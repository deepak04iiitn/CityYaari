import React, { useEffect } from 'react';
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
import { SnackbarProvider } from "./src/store/SnackbarContext";
import { UnreadMsgProvider } from "./src/store/UnreadMsgContext";
import { ActivityIndicator, Platform, View } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

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

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setPositionAsync('absolute');
      NavigationBar.setBackgroundColorAsync('#ffffff01');
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <SnackbarProvider>
            <UnreadMsgProvider>
              <NavigationContainer>
                <Navigation />
              </NavigationContainer>
            </UnreadMsgProvider>
          </SnackbarProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
