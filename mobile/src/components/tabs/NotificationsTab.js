import React from "react";
import { InfoCard, NotificationsShell } from "./TabShared";

export default function NotificationsTab({ navigation }) {
  return (
    <NotificationsShell navigation={navigation}>
      <InfoCard
        title="Meetup Reminder"
        meta="5 min ago"
        body="Your Bangalore chai meetup starts in 40 minutes. 12 people confirmed."
      />
      <InfoCard
        title="New Message Request"
        meta="18 min ago"
        body="A member from Lucknow wants to connect about a flat near HSR Layout."
      />
      <InfoCard
        title="Community Update"
        meta="Today"
        body="Pune food walk registrations just opened for this Saturday evening."
      />
    </NotificationsShell>
  );
}
