import React from "react";
import OutreachAnalytics from "./components/OutreachAnalytics";
import LeadgenAnalytics from "./components/LeadgenAnalytics";

function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>📊 Analytics Dashboard</h1>
      <OutreachAnalytics />
      <hr style={{ margin: "3rem 0" }} />
      <LeadgenAnalytics />
    </div>
  );
}

export default App;

