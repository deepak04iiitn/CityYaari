import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { ScreenShell, TAB_COLORS, tabSharedStyles as ss } from "./TabShared";

export default function PostTab({ navigation }) {
  return (
    <ScreenShell
      navigation={navigation}
      routeName="Post"
      title="Share something worth showing up for."
      subtitle="Create a meetup, ask a question, or post a trusted lead."
    >
      <View style={ss.composerCard}>
        <View style={ss.composerPill}>
          <MaterialIcons name="event-available" size={18} color={TAB_COLORS.blue} />
          <Text style={ss.composerPillText}>Event</Text>
        </View>
        <View style={ss.composerPill}>
          <MaterialIcons name="home-work" size={18} color={TAB_COLORS.blue} />
          <Text style={ss.composerPillText}>Room</Text>
        </View>
        <View style={ss.composerPill}>
          <MaterialIcons name="help-outline" size={18} color={TAB_COLORS.blue} />
          <Text style={ss.composerPillText}>Question</Text>
        </View>
        <Pressable style={ss.primaryButton}>
          <Text style={ss.primaryButtonText}>Start Posting</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}
