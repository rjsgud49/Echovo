import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from 'recharts';
import type { RecordItem } from '../types/interview';

interface Props {
  records: RecordItem[];
}

const StatsCharts: React.FC<Props> = ({ records }) => {
  const byDate = [...records].map(r => ({
    date: r.date ?? '날짜 없음',
    score: r.score ?? 0,
    length: r.answer?.length ?? 0,
    duration: r.duration ?? 0,
  })).reverse();

  const allScoresZero = byDate.every(d => d.score === 0);
  const allDurationsZero = byDate.every(d => d.duration === 0);
  const allLengthsZero = byDate.every(d => d.length === 0);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">📅 날짜별 점수 변화</h4>
        {allScoresZero ? (
          <p className="text-gray-500">점수 데이터가 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={byDate}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">🕒 응답 시간 (초)</h4>
        {allDurationsZero ? (
          <p className="text-gray-500">응답 시간 데이터가 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byDate}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="duration" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">✍️ 답변 길이 (문자 수)</h4>
        {allLengthsZero ? (
          <p className="text-gray-500">답변 데이터가 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byDate}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="length" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default StatsCharts;
