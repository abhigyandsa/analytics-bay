import React, { useState } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Customized,
} from "recharts";
import { beta as jBeta } from "jstat";

// Compute quantiles
const getQuantiles = ({ employee, alpha, beta }) => ({
    employee,
    q05: jBeta.inv(0.05, alpha, beta),
    q25: jBeta.inv(0.25, alpha, beta),
    q50: jBeta.inv(0.5, alpha, beta),
    q75: jBeta.inv(0.75, alpha, beta),
    q95: jBeta.inv(0.95, alpha, beta),
});

// Tooltip UI
const HoverTooltip = ({ x, y, data }) => {
    if (!data) return null;

    return (
        <foreignObject x={x} y={y - 80} width={180} height={100}>
            <div style={{ background: "#fff", border: "1px solid #ccc", padding: "10px", pointerEvents: "none" }}>
                <strong>{data.employee}</strong>
                <div>median: {(data.q50 * 100).toFixed(1)}%</div>
            </div>
        </foreignObject>
    );
};

const BoxPlot = ({ data, xAxisMap, yAxisMap, xAxisId = "0", yAxisId = "0", setHover }) => {
    const xScale = xAxisMap[xAxisId].scale;
    const yScale = yAxisMap[yAxisId].scale;

    return (
        <g>
            {data.map((d) => {
                const centerY = yScale(d.employee);
                const height = 20;

                const x05 = xScale(d.q05);
                const x25 = xScale(d.q25);
                const x50 = xScale(d.q50);
                const x75 = xScale(d.q75);
                const x95 = xScale(d.q95);

                return (
                    <g
                        key={d.employee}
                        transform={`translate(0, ${centerY - height / 2})`}
                        onMouseEnter={() => setHover({ x: x50, y: centerY, data: d })}
                        onMouseLeave={() => setHover(null)}
                    >
                        {/* Whiskers */}
                        <line x1={x05} x2={x95} y1={height / 2} y2={height / 2} stroke="#666" strokeWidth={2} />
                        <line x1={x05} x2={x05} y1={4} y2={height - 4} stroke="#666" strokeWidth={2} />
                        <line x1={x95} x2={x95} y1={4} y2={height - 4} stroke="#666" strokeWidth={2} />
                        {/* Box */}
                        <rect
                            x={x25}
                            y={0}
                            width={x75 - x25}
                            height={height}
                            fill="#8884d8"
                            stroke="#333"
                        />
                        {/* Median */}
                        <line
                            x1={x50}
                            x2={x50}
                            y1={0}
                            y2={height}
                            stroke="#000"
                            strokeWidth={2}
                        />
                    </g>
                );
            })}
        </g>
    );
};

const BetaDistributionChart = ({ data }) => {
    const quantileData = data.map(getQuantiles);
    const chartHeight = Math.max(300, quantileData.length * 50);

    const [hover, setHover] = useState(null);

    return (
        <div style={{ marginTop: "4rem" }}>
            <h2>Reply Rates Distributions</h2>
            <ResponsiveContainer width="100%" height={chartHeight}>
                <ComposedChart
                    layout="vertical"
                    data={quantileData}
                    margin={{ top: 20, right: 60, bottom: 20, left: 100 }}
                >
                    <CartesianGrid stroke="#ccc" />
                    <XAxis
                        type="number"
                        domain={[0, 0.3]}
                        dataKey="q50"
                        tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    />
                    <YAxis type="category" dataKey="employee" width={100} />
                    <Customized component={(props) => (
                        <>
                            <BoxPlot {...props} data={quantileData} setHover={setHover} />
                            <HoverTooltip x={hover?.x} y={hover?.y} data={hover?.data} />
                        </>
                    )} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BetaDistributionChart;
