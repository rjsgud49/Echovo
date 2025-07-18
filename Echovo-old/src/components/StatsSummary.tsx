import React, { useEffect, useState } from 'react';
import { calculateStats, generateCareerLevelPrompt, getCareerLevelFromAI } from '../utils/openai';
import type { RecordItem } from '../types/interview';

interface Props {
    records: RecordItem[];
}

type CareerLevel = 'beginner' | 'intermediate' | 'advanced';

interface GoalSetting {
    scoreGoal: number;
    durationGoal: number;
    lengthGoal: number;
    sessionGoal: number;
}

const goalPresets: Record<CareerLevel, GoalSetting> = {
    beginner: { scoreGoal: 3.0, durationGoal: 10, lengthGoal: 80, sessionGoal: 3 },
    intermediate: { scoreGoal: 4.0, durationGoal: 15, lengthGoal: 100, sessionGoal: 5 },
    advanced: { scoreGoal: 4.5, durationGoal: 20, lengthGoal: 120, sessionGoal: 7 },
};

// const levelLabel: Record<CareerLevel, string> = {
//     beginner: '초보자',
//     intermediate: '중급자',
//     advanced: '경력자',
// };

const average = (arr: number[]) =>
    arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '0';

const StatsSummary: React.FC<Props> = ({ records }) => {
    // const [setCareerLevel] = useState<CareerLevel>('beginner');
    const [goal, setGoal] = useState<GoalSetting>(goalPresets.beginner);
    const [loading, setLoading] = useState(true);

    const durations = records.map(r => r.duration || 0);
    const lengths = records.map(r => r.answer?.length || 0);
    const scores = records.map(r => r.score || 0);

    useEffect(() => {
        const logs = JSON.parse(localStorage.getItem('interviewLogs') || '[]') as RecordItem[];
        if (logs.length === 0) {
            setLoading(false);
            return;
        }

        const stats = calculateStats(logs);
        const prompt = generateCareerLevelPrompt(stats);

        getCareerLevelFromAI(prompt).then((res) => {
            try {
                const parsed = JSON.parse(res);
                const level = parsed.level as CareerLevel;
                if (goalPresets[level]) {
                    // setCareerLevel(level);
                    setGoal(goalPresets[level]);
                }
            } catch (e) {
                console.error('❌ GPT 응답 파싱 오류:', e);
            } finally {
                setLoading(false);
            }
        });
    }, []);

    if (loading) {
        return <div className="text-gray-500 p-4">⏳ 목표를 불러오는 중입니다...</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* 평균 점수 */}
            <div className="bg-white shadow rounded-lg p-4 text-center">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500">🎯 목표 점수</p>
                        <p className="text-2xl font-bold text-purple-400">{goal.scoreGoal} / 5</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500">📈 평균 점수</p>
                        <p className="text-2xl font-bold text-purple-600">{average(scores)} / 5</p>
                    </div>
                </div>
            </div>

            {/* 답변 길이 */}
            <div className="bg-white shadow rounded-lg p-4 text-center">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500">🎯 목표 길이</p>
                        <p className="text-2xl font-bold text-green-400">{goal.lengthGoal}자</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500">✍️ 평균 길이</p>
                        <p className="text-2xl font-bold text-green-600">{average(lengths)}자</p>
                    </div>
                </div>
            </div>

            {/* 응답 시간 */}
            <div className="bg-white shadow rounded-lg p-4 text-center">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-gray-500">🎯 목표 시간</p>
                        <p className="text-2xl font-bold text-yellow-400">{goal.durationGoal}초</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-500">🕒 평균 시간</p>
                        <p className="text-2xl font-bold text-yellow-500">{average(durations)}초</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsSummary;
