// src/components/DailyViewsChart.jsx
import { useEffect, useState } from 'react';
import { VictoryChart, VictoryAxis, VictoryLine, VictoryTooltip, VictoryVoronoiContainer } from 'victory';
import { fetchDailyViews } from '../api';

export default function DailyViewsChart({ postId, days = 14, height = 240 }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!postId) return;
    fetchDailyViews(postId, days)
      .then(list => {
        setData(
          list.map(r => ({
            // force a real Date at midnight UTC to avoid timezone drift
            x: new Date(`${r.date}T00:00:00Z`),
            y: r.count
          }))
        );
      })
      .catch(() => setData([]));
  }, [postId, days]);

  if (!postId) return null;

  return (
    <div className="w-full">
      <VictoryChart
        height={height}
        scale={{ x: 'time' }}
        containerComponent={<VictoryVoronoiContainer />}
      >
        <VictoryAxis
          fixLabelOverlap
          tickFormat={(t) => new Date(t).toLocaleDateString()}
        />
        <VictoryAxis dependentAxis />
        <VictoryLine
          data={data}
          labels={({ datum }) =>
            `${new Date(datum.x).toISOString().slice(0, 10)} • ${datum.y}`
          }
          labelComponent={<VictoryTooltip />}
        />
      </VictoryChart>
    </div>
  );
}
