import React from "react";
import { InfoCard, ScreenShell } from "./TabShared";

export default function MessagesTab({ navigation }) {
  return (
    <ScreenShell
      navigation={navigation}
      routeName="Messages"
      title="Keep your city conversations warm."
      subtitle="Recent chats and group threads stay easy to reach."
    >
      <InfoCard
        title="Ananya Sharma"
        meta="Seen 2 min ago"
        body="Breakfast meetup in Koramangala on Sunday. A few new members are joining too."
      />
      <InfoCard
        title="Delhi to Pune Group"
        meta="18 unread messages"
        body="Members are sharing rental leads, intern openings, and a Holi dinner plan."
      />
    </ScreenShell>
  );
}
