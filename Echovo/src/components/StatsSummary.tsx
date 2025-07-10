import React from 'react';
import type { RecordItem } from '../types/interview';

interface Props {
    records: RecordItem[];
}

const average = (arr: number[]) =>
    arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '0';

const StatsSummary: React.FC<Props> = ({ records }) => {
    const durations = records.map(r => r.duration || 0);
    const lengths = records.map(r => r.answer?.length || 0);
    const scores = records.map(r => r.score || 0);

    return (
        <div className="p-4 bg-white rounded shadow flex flex-col gap-4">
            <div>
                <h4 className="text-gray-700 font-semibold">⏱ 평균 응답 시간</h4>
                <p className="text-xl">{average(durations)}초</p>
            </div>
            <div>
                <h4 className="text-gray-700 font-semibold">✍️ 평균 답변 길이</h4>
                <p className="text-xl">{average(lengths)}자</p>
            </div>
            <div>
                <h4 className="text-gray-700 font-semibold">📈 평균 점수</h4>
                <p className="text-xl">{average(scores)} / 5</p>
            </div>
        </div>
    );
};

export default StatsSummary;
