import React from "react";
import { Card } from '../ui/card'; // Assuming this import is correct

export default function DashboardStats({ stats }) { // Added stats prop

  //If data is not available, display a fallback
  if (!stats) {
    return <p>Loading stats...</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-4">
        <h3>Contacts</h3>
        <p>{stats.totalContacts || 0}</p> {/*Using original data fields if available*/}
      </Card>
      <Card className="p-4">
        <h3>Campaigns</h3>
        <p>{stats.activeCampaigns || 0}</p> {/*Using original data fields if available*/}
      </Card>
      {/*Adding more cards based on available data in 'stats' object.  This is an assumption.*/}
      <Card className="p-4">
        <h3>Messages Delivered</h3>
        <p>{stats.messageDelivery || "0%"}</p>
      </Card>
      <Card className="p-4">
        <h3>Form Submissions</h3>
        <p>{stats.formSubmissions || 0}</p>
      </Card>

    </div>
  );
}