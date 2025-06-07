import React, { useEffect, useState } from "react";
import AnalyticsBlock from "./AnalyticsBlock";
import { matchRepliesWithOutreach } from "../utils/matchRepliesWithOutreach";
import BetaDistributionChart from "./BetaDistributionChart";
import { computeBetaDistributions } from "../utils/computeBetaDistributions";

const OutreachAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [outreachData, setOutreachData] = useState([]);
  const [repliesData, setRepliesData] = useState([]);
  const [betaDistributions, setBetaDistributions] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const res = await fetch("/api/outreach");
      const json = await res.json();

      const repliesRes = await fetch("/api/replies");
      const repliesJson = await repliesRes.json();

      const enrichedReplies = matchRepliesWithOutreach(json, repliesJson);

      setOutreachData(json);
      setRepliesData(enrichedReplies);

      const betaDistributions = computeBetaDistributions(json, enrichedReplies);
      setBetaDistributions(betaDistributions);

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
          <hr style={{ margin: "3rem 0" }} />
          <AnalyticsBlock title="Replies" rawData={repliesData} />
          <hr style={{ margin: "3rem 0" }} />
          <BetaDistributionChart data={betaDistributions} />
        </>
      )}
    </div>
  );
};

export default OutreachAnalytics;

