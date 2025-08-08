import React, { useState } from 'react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, LineChart } from 'recharts';
import { useDarkMode } from '@/contexts/DarkModeContext';

export interface LoginActivityPoint {
  login_date: string; // YYYY-MM-DD
  count: number;
}

interface LoginActivityChartProps {
  activity: LoginActivityPoint[];
  title?: string;
}

const LoginActivityChart: React.FC<LoginActivityChartProps> = ({ activity, title = 'Login Activity (per day)' }) => {
  const { darkMode } = useDarkMode();
  const [showTrend, setShowTrend] = useState(true);

  // Build a 3-day window BEFORE today, zero-filled if missing
  const mapByDate = new Map(
    (activity || []).map((row) => [
      new Date(row.login_date).toISOString().slice(0, 10),
      Number((row as any).count) || 0,
    ])
  );
  const today = new Date();
  const last3 = [3, 2, 1].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    const key = d.toISOString().slice(0, 10);
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' }),
      sortKey: key,
      logins: mapByDate.get(key) || 0,
    };
  });
  const data = last3;

  const colors = {
    grid: darkMode ? '#374151' : '#E5E7EB',
    tick: darkMode ? '#D1D5DB' : '#374151',
    label: darkMode ? '#E5E7EB' : '#111827',
    barStart: darkMode ? '#60A5FA' : '#6366F1',
    barEnd: darkMode ? '#A78BFA' : '#8B5CF6',
    barStroke: darkMode ? '#93C5FD' : '#818CF8',
    tooltipBg: darkMode ? '#111827' : '#ffffff',
    tooltipBorder: darkMode ? '#374151' : '#E5E7EB',
    neonStart: '#22D3EE', // cyan-400
    neonEnd: '#A78BFA',   // violet-400
  } as const;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const value = payload[0].value;
    return (
      <div
        style={{
          background: colors.tooltipBg,
          border: `1px solid ${colors.tooltipBorder}`,
          borderRadius: 10,
          padding: '10px 12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ fontSize: 12, color: colors.tick, marginBottom: 4 }}>{label}</div>
        <div style={{ fontWeight: 700, color: colors.label, fontSize: 14 }}>{value} logins</div>
      </div>
    );
  };

  const renderBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
      <text x={x + width / 2} y={y - 6} textAnchor="middle" fill={colors.tick} fontSize={12} fontWeight={600}>
        {value}
      </text>
    );
  };

  return (
    <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
        <div className="flex items-center gap-3">
          <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Trend:</label>
          <select
            value={showTrend ? 'show' : 'hide'}
            onChange={(e) => setShowTrend(e.target.value === 'show')}
            className={`px-3 py-2 rounded-md text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'}`}
          >
            <option value="show">Show</option>
            <option value="hide">Hide</option>
          </select>
        </div>
      </div>
      {data.length === 0 ? (
        <div className={`h-72 flex items-center justify-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          No login activity yet.
        </div>
      ) : (
      <>
      {/* Single Line Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 32 }}>
          <defs>
            <linearGradient id="loginLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={colors.neonStart} />
              <stop offset="100%" stopColor={colors.neonEnd} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={colors.grid} />
          <XAxis dataKey="date" angle={-45} textAnchor="end" height={64} fontSize={12} tick={{ fill: colors.tick }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: colors.tick }} allowDecimals={false} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: colors.tick, marginTop: 8 }} />
          {showTrend && (
            <>
              <Line type="monotone" dataKey="logins" name="Login trend" stroke="url(#loginLineGradient)" strokeOpacity={0.35} strokeWidth={9} dot={false} isAnimationActive legendType="none" />
              <Line type="monotone" dataKey="logins" name="Login trend" stroke="url(#loginLineGradient)" strokeWidth={3} dot={{ r: 4, stroke: colors.neonEnd, strokeWidth: 1, fill: '#fff' }} activeDot={{ r: 6 }} isAnimationActive />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Removed duplicate second graph */}
      </>
      )}
    </div>
  );
};

export default LoginActivityChart;


