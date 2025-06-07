import React, { useEffect, useState } from "react";
import AnalyticsBlock from "./AnalyticsBlock";
import { matchRepliesWithOutreach } from "../utils/matchRepliesWithOutreach";

const OutreachAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [outreachData, setOutreachData] = useState([]);
  const [repliesData, setRepliesData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const res = await fetch("/api/outreach");
      const json = await res.json();

      const repliesRes = await fetch("/api/replies");
      const repliesJson = await repliesRes.json();

      const enrichedReplies = matchRepliesWithOutreach(json, repliesJson);
      console.log("enriched");
      console.log(enrichedReplies);

      setOutreachData(json);
      setRepliesData(enrichedReplies);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>📊 Outreach Dashboard</h1>
      {loading ? (
        <p>Loading outreach and replies data...</p>
      ) : (
        <>
          <AnalyticsBlock title="Outreach" rawData={outreachData} />
          <AnalyticsBlock title="Replies" rawData={repliesData} />
        </>
      )}
    </div>
  );
};

export default OutreachAnalytics;

