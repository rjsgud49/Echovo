import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import type { RecordItem } from '../types/interview';

interface Props {
  records: RecordItem[];
}

const StatsCharts: React.FC<Props> = ({ records }) => {
  const recentCount = 10;

  // 평균 구하는 함수
  const average = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  // 날짜, 점수, 응답 시간, 답변 길이 처리
  const byDate = [...records]
    .map((r) => {
      let raw = r.date ?? '날짜 없음';
      if (raw.includes('초')) {
        raw = raw.replace(/(\d{1,2})초$/, '').trim();
      }

      return {
        date: raw,
        score: r.score ?? 0,
        length: r.answer?.length ?? 0,
        duration: r.duration ?? 0,
      };
    })
    .reverse()
    .slice(0, recentCount);

  const allScoresZero = byDate.every((d) => d.score === 0);
  const allDurationsZero = byDate.every((d) => d.duration === 0);
  const allLengthsZero = byDate.every((d) => d.length === 0);

  // 평균값 계산용 배열
  const scores = byDate.map(d => d.score);
  const durations = byDate.map(d => d.duration);
  const lengths = byDate.map(d => d.length);

  // 목표값 하드코딩 예시 (백엔드에서 받아올 수도 있음)
  const goal = {
    scoreGoal: 4.0,
    durationGoal: 15,
    lengthGoal: 100,
  };

  const radarData = [
    {
      subject: '점수',
      목표: goal.scoreGoal,
      평균: parseFloat(average(scores).toFixed(1)),
    },
    {
      subject: '응답 시간',
      목표: goal.durationGoal,
      평균: parseFloat(average(durations).toFixed(1)),
    },
    {
      subject: '답변 길이',
      목표: goal.lengthGoal,
      평균: parseFloat(average(lengths).toFixed(1)),
    },
  ];

  return (
    <div className="space-y-8">
      {/* 가로 카드 2개 */}
      <div className="flex gap-4 mb-6 min-h-[250px] mt-4">
        {/* 응답 시간 */}
        <div className="bg-white p-4 shadow rounded-lg min-w-[300px] flex-1">
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

        {/* 답변 길이 */}
        <div className="bg-white p-4 shadow rounded-lg min-w-[300px] flex-1">
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

      <div className="flex gap-4 mb-6 min-h-[250px] mt-4">
      {/* 날짜별 점수 변화 */}
        <div className="bg-white p-4 shadow rounded-lg min-w-[300px] flex-1">
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

      {/* 레이더 차트 */}
      <div className="bg-white shadow rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-2 min-w-[500px] flex-1">📡 목표 vs 평균 비교</h4>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart outerRadius={120} data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis domain={[0, 'auto']} />
            <Radar name="목표" dataKey="목표" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} />
            <Radar name="평균" dataKey="평균" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.4} />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>

    </div>
  );
};

export default StatsCharts;
