import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API, { fetchDailyViews } from '../api';
import usePostView from '../hooks/usePostView';
import { VictoryChart, VictoryAxis, VictoryLine, VictoryTooltip, VictoryVoronoiContainer } from 'victory';

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [totalViews, setTotalViews] = useState(0);
  const [series, setSeries] = useState([]);
  const [error, setError] = useState('');

  usePostView(id); // logs one view/day per user

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get(`/posts/${id}`);
        setPost(data);
      } catch (e) {
        console.error(e);
        setError('Could not load post.');
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchDailyViews(id, 14)
      .then(rows => {
        setTotalViews(rows.reduce((s, r) => s + (r.count || 0), 0));
        setSeries(rows.map(r => ({ x: new Date(`${r.date}T00:00:00Z`), y: r.count })));
      })
      .catch(err => {
        console.error(err);
        setTotalViews(0);
        setSeries([]);
      });
  }, [id]);

  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!post) return <div className="p-6">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="text-sm opacity-80">Total views: {totalViews}</p>

      <div className="prose">
        <div dangerouslySetInnerHTML={{ __html: (post.content || '').replace(/\n/g, '<br/>') }} />
      </div>

      <div className="mt-6 border rounded-xl p-4">
        <h2 className="text-lg font-semibold">Daily views (last 14 days)</h2>
        {series.length === 0 ? (
          <div className="text-sm opacity-70">No data yet.</div>
        ) : (
          <VictoryChart height={240} scale={{ x: 'time' }} containerComponent={<VictoryVoronoiContainer />}>
            <VictoryAxis
              fixLabelOverlap
              tickFormat={(t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            />
            <VictoryAxis dependentAxis />
            <VictoryLine
              data={series}
              labels={({ datum }) => `${new Date(datum.x).toISOString().slice(0, 10)} • ${datum.y}`}
              labelComponent={<VictoryTooltip />}
            />
          </VictoryChart>
        )}
      </div>
    </div>
  );
}
