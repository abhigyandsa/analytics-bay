// src/components/Leadgen.js
import React, { useEffect, useState } from "react";
import AnalyticsBlock from "./AnalyticsBlock";

const Leadgen = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const res = await fetch("/api/leadgen");
      const json = await res.json();
      setRawData(json);
      setLoading(false);
    };
    loadData();
  }, []);

  return loading ? (
    <p>Loading leadgen data...</p>
  ) : (
    <AnalyticsBlock title="Leadgen" rawData={rawData} />
  );
};

export default Leadgen;
