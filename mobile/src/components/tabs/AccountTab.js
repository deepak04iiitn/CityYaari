import React from "react";
import { Pressable, Text, View } from "react-native";
import { useAuth } from "../../store/AuthContext";
import { ScreenShell, tabSharedStyles as ss } from "./TabShared";

export default function AccountTab({ navigation }) {
  const { logout, user } = useAuth();

  return (
    <ScreenShell
      navigation={navigation}
      routeName="Account"
      title="Your identity, trust, and settings."
      subtitle="Keep your profile polished and community-ready."
    >
      <View style={ss.accountCard}>
        <View style={ss.accountAvatar}>
          <Text style={ss.accountAvatarText}>CY</Text>
        </View>
        <Text style={ss.accountName}>{user?.fullName || "CityYaari Member"}</Text>
        <Text style={ss.accountMeta}>{user?.occupationType === "student" ? "Student member" : "Verified hometown profile"}</Text>
        <Pressable onPress={logout} style={ss.accountButton}>
          <Text style={ss.accountButtonText}>Log Out</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}
