import React, { useEffect, useState } from 'react';
import RecordSidebar from '../components/RecordSidebar';
import InterviewBox from '../components/InterviewBox';
import RecordModal from '../components/RecordModal';
import type { RecordItem } from '../types/interview';

const InterviewPage: React.FC = () => {
    const saved = localStorage.getItem('interviewUserInfo');
    const userInfo = saved ? JSON.parse(saved) : { field: '', stack: '' };

    const [records, setRecords] = useState<RecordItem[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

    // 최초 로드 시 기록 가져오기
    useEffect(() => {
        const stored = localStorage.getItem('interviewLogs');
        if (stored) {
            setRecords(JSON.parse(stored));
        }
    }, []);

    // InterviewBox에서 기록이 저장될 때 호출됨
    const handleLogUpdated = () => {
        const updated = localStorage.getItem('interviewLogs');
        if (updated) {
            setRecords(JSON.parse(updated));
        }
    };

    return (
        <div className="flex h-screen">
            <RecordSidebar records={records} onSelect={setSelectedRecord} />
            <div className="flex items-center justify-center flex-grow p-6 overflow-y-auto bg-gray-50">
                <InterviewBox
                    field={userInfo.field}
                    stack={userInfo.stack}
                    onLogUpdated={handleLogUpdated}
                />
            </div>


            {selectedRecord && (
                <RecordModal
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                />
            )}
        </div>
    );
};

export default InterviewPage;
