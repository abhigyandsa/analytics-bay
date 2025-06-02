import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const parseDate = (str) => {
  if (!str || typeof str !== "string") {
    console.warn("Invalid date input:", str);
    return new Date("Invalid");
  }

  const [day, month, year] = str.split("/").map(Number);
  const d = new Date(year, month - 1, day);

  if (isNaN(d)) {
    console.warn("Invalid parsed date:", str);
  }

  return d;
};

const formatDate = (d) => {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const AnalyticsBlock = ({ title, rawData }) => {
  const [selectedEmployees, setSelectedEmployees] = useState(["Total"]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeList, setEmployeeList] = useState([]);

  useEffect(() => {
    const employees = Array.from(new Set(rawData.map(d => d.employee)));
    setEmployeeList(["Total", "Average", ...employees]);

    const allDates = rawData
      .filter(d => d.date)
      .map(d => parseDate(d.date))
      .sort((a, b) => a - b);
    if (allDates.length) {
      setStartDate(allDates[0].toISOString().slice(0, 10));
      setEndDate(allDates[allDates.length - 1].toISOString().slice(0, 10));
    }
  }, [rawData]);

  const filteredData = rawData.filter(d => {
    if (!d.date) return false;
    const dateObj = parseDate(d.date);
    return dateObj >= new Date(startDate) && dateObj <= new Date(endDate);
  });

  // Group by date and employee
  const grouped = {};
  filteredData.forEach(d => {
    const dateObj = parseDate(d.date);
    const dateStr = formatDate(dateObj);

    if (!grouped[dateStr]) grouped[dateStr] = {};
    if (!grouped[dateStr][d.employee]) grouped[dateStr][d.employee] = 0;

    grouped[dateStr][d.employee]++;
  });

  const chartData = Object.entries(grouped).map(([dateStr, counts]) => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const empCount = Object.keys(counts).length;
    const avg = empCount === 0 ? 0 : total / empCount;

    return {
      date: dateStr,
      Total: total,
      Average: Math.round(avg * 100) / 100,
      ...counts
    };
  }).sort((a, b) => parseDate(a.date) - parseDate(b.date));

  const usingTotalOrAverage = selectedEmployees.includes("Total") || selectedEmployees.includes("Average");

  const totalCount = usingTotalOrAverage
    ? filteredData.length
    : selectedEmployees.reduce((sum, emp) =>
        sum + filteredData.filter(d => d.employee === emp).length, 0);

  const uniqueProfiles = usingTotalOrAverage
    ? new Set(filteredData.map(d => d.profile_link)).size
    : new Set(filteredData
        .filter(d => selectedEmployees.includes(d.employee))
        .map(d => d.profile_link)).size;

  const cardLabel = usingTotalOrAverage ? "Total" : "Sum";

  const handleCheckboxChange = (employee) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employee)) {
        return prev.filter(e => e !== employee);
      } else {
        return [...prev, employee];
      }
    });
  };

  const handleResetFilters = () => {
    const allDates = rawData
      .filter(d => d.date)
      .map(d => parseDate(d.date))
      .sort((a, b) => a - b);
    setStartDate(allDates[0].toISOString().slice(0, 10));
    setEndDate(allDates[allDates.length - 1].toISOString().slice(0, 10));
    setSelectedEmployees(["Total"]);
  };

  return (
    <div style={{ marginBottom: "3rem" }}>
      <h2>{title}</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div>
          <label>Start Date: </label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date: </label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <label>Employees: </label><br />
          {employeeList.map(emp => (
            <label key={emp} style={{ marginRight: "0.75rem" }}>
              <input
                type="checkbox"
                checked={selectedEmployees.includes(emp)}
                onChange={() => handleCheckboxChange(emp)}
              />
              {" "}{emp}
            </label>
          ))}
        </div>
        <div>
          <button onClick={handleResetFilters}>Reset Filters</button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", minWidth: "200px" }}>
          <h2>{totalCount}</h2>
          <p>{cardLabel} {title === "Replies" ? "Replies" : "Messages"}</p>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", minWidth: "200px" }}>
          <h2>{uniqueProfiles}</h2>
          <p>{cardLabel} Unique Profiles</p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ maxWidth: "75%", margin: "0 auto" }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            {selectedEmployees.map(emp => (
              <Line
                key={emp}
                type="monotone"
                dataKey={emp}
                stroke={emp === "Total" ? "#8884d8" : emp === "Average" ? "#82ca9d" : "#ffc658"}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsBlock;

