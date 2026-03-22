import React from "react";
import { Text, View } from "react-native";
import { InfoCard, ScreenShell, tabSharedStyles as ss } from "./TabShared";

export default function HomeTab({ navigation }) {
  return (
    <ScreenShell
      navigation={navigation}
      routeName="Home"
      title="Your people are already active."
      subtitle="Meetups, useful conversations, and familiar faces across the city."
    >
      <View style={ss.metricRow}>
        <View style={[ss.metricCard, ss.metricBlue]}>
          <Text style={ss.metricValue}>18</Text>
          <Text style={ss.metricLabel}>Meetups this week</Text>
        </View>
        <View style={[ss.metricCard, ss.metricOrange]}>
          <Text style={ss.metricValue}>24</Text>
          <Text style={ss.metricLabel}>Unread messages</Text>
        </View>
      </View>
      <InfoCard
        title="Bangalore Yaaris"
        meta="Tonight, 8:30 PM"
        body="A rooftop chai meetup in Indiranagar is filling up fast. New members from Lucknow and Jaipur joined this afternoon."
      />
      <InfoCard
        title="Community Highlights"
        meta="Recommended for you"
        body="Flat leads, job referrals, and weekend sports meetups are trending near your area."
      />
    </ScreenShell>
  );
}
