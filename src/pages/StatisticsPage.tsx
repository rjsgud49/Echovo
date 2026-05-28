import React, { useEffect, useState } from 'react';
import RecordSidebar from '../components/RecordSidebar';
import StatsSummary from '../components/StatsSummary';
import StatsCharts from '../components/StatsCharts';
import RecordModal from '../components/RecordModal'; // ✅ 모달 추가
import type { RecordItem } from '../types/interview';

const StatisticsPage: React.FC = () => {
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null); // ✅ 모달 상태

    useEffect(() => {
        const saved = localStorage.getItem('interviewLogs');
        if (saved) setRecords(JSON.parse(saved));
    }, []);

    return (
        <div className="flex h-screen" style={{ userSelect: 'none' }}>
            {/* ✅ 모달 연결 */}
            <RecordSidebar records={records} onSelect={setSelectedRecord} />

            <main className="flex-grow p-5 overflow-y-auto bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 면접 통계</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* <GoalTracker /> */}
                </div>

                <StatsSummary records={records} />
                <StatsCharts records={records} />
            </main>

            {/* ✅ 모달 표시 */}
            {selectedRecord && (
                <RecordModal
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                />
            )}
        </div>
    );
};

export default StatisticsPage;
