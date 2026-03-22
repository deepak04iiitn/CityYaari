import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { InfoCard, ScreenShell, TAB_COLORS, tabSharedStyles as ss } from "./TabShared";

export default function SearchTab({ navigation }) {
  return (
    <ScreenShell
      navigation={navigation}
      routeName="Search"
      title="Search by city, language, or vibe."
      subtitle="Find communities, people, and events without digging."
    >
      <View style={ss.searchCard}>
        <View style={ss.searchInputMock}>
          <MaterialIcons name="search" size={18} color={TAB_COLORS.inkFaint} />
          <Text style={ss.searchPlaceholder}>Search Bangalore, Tamil, cricket...</Text>
        </View>
      </View>
      <InfoCard
        title="Hyderabad in Mumbai"
        meta="3.4K members"
        body="Active hometown group with weekend events, city tips, and useful roommate threads."
      />
    </ScreenShell>
  );
}
