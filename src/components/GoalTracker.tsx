import React, { useEffect, useState } from 'react';
import { calculateStats, generateCareerLevelPrompt, getCareerLevelFromAI } from '../utils/openai';
import type { RecordItem } from '../types/interview';

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

const levelLabel: Record<CareerLevel, string> = {
    beginner: '초보자',
    intermediate: '중급자',
    advanced: '경력자',
};

const GoalTracker: React.FC = () => {
    const [careerLevel, setCareerLevel] = useState<CareerLevel>('beginner');
    const [goal, setGoal] = useState(goalPresets.beginner);
    const [loading, setLoading] = useState(true);

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
                    setCareerLevel(level);
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
        return <div className="p-4 bg-white rounded shadow text-gray-600">⏳ AI가 실력을 분석 중입니다...</div>;
    }

    return (
        <div className="p-4 bg-white rounded shadow">
            <h4 className="text-lg font-semibold mb-2">🎯 이번 주 목표 ({levelLabel[careerLevel]})</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>✅ 평균 점수 {goal.scoreGoal} 이상</li>
                <li>⏱ 평균 응답 시간 {goal.durationGoal}초 이상</li>
                <li>✍️ 답변 길이 평균 {goal.lengthGoal}자 이상</li>
                <li>📅 연습 횟수 {goal.sessionGoal}회 이상</li>
            </ul>
        </div>
    );
};

export default GoalTracker;
