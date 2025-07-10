import React, { useEffect, useState } from 'react';
import RecordSidebar from '../components/RecordSidebar';
import StatsSummary from '../components/StatsSummary';
import StatsCharts from '../components/StatsCharts';
import GoalTracker from '../components/GoalTracker';
import type { RecordItem } from '../types/interview';

const StatisticsPage: React.FC = () => {
    const [records, setRecords] = useState<RecordItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('interviewLogs');
        if (saved) setRecords(JSON.parse(saved));
    }, []);

    return (
        <div className="flex h-screen">
            <RecordSidebar records={records} />
            <main className="flex-grow p-6 overflow-y-auto bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 면접 통계</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <GoalTracker />
                    <StatsSummary records={records} />
                </div>
                <StatsCharts records={records} />
            </main>
        </div>
    );
};

export default StatisticsPage;
