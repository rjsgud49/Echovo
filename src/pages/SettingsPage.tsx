import React, { useEffect, useState } from 'react';
import RecordSidebar from '../components/RecordSidebar';
import MicTestWithSTT from '../components/MicTest';
import RecordModal from '../components/RecordModal'; // ✅ 모달 import
import type { RecordItem } from '../types/interview';

const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState({ field: '', stack: '', old: '' });
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null); // ✅ 모달 상태 추가

  useEffect(() => {
    const saved = localStorage.getItem('interviewUserInfo');
    if (saved) setProfile(JSON.parse(saved));

    const savedLogs = localStorage.getItem('interviewLogs');
    if (savedLogs) setRecords(JSON.parse(savedLogs));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('interviewUserInfo', JSON.stringify(profile));
    alert('✅ 면접 기본 정보가 저장되었습니다.');
  };

  return (
    <div className="flex h-screen bg-gray-50" style={{ userSelect: 'none' }}>
      {/* ✅ onSelect 추가 */}
      <RecordSidebar records={records} onSelect={setSelectedRecord} />

      <main className="flex-grow p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⚙️ 설정 페이지</h2>

          {/* 면접 기본 정보 */}
          <section className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold mb-4">👤 면접 기본 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">면접 분야</label>
                <input
                  name="field"
                  placeholder="예: 프론트엔드, 백엔드"
                  value={profile.field}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">주 사용 스택</label>
                <input
                  name="stack"
                  placeholder="예: React, Node.js"
                  value={profile.stack}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">경력</label>
                <input
                  name="old"
                  placeholder="예: 2년, 신입"
                  value={profile.old}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSave}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold shadow"
              >
                저장하기
              </button>
            </div>
          </section>

          {/* 마이크 테스트 */}
          <section className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold mb-4">🎙️ 마이크 테스트</h3>
            <MicTestWithSTT />
          </section>
        </div>
      </main>

      {/* ✅ 선택된 기록 있을 경우 모달 표시 */}
      {selectedRecord && (
        <RecordModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

export default SettingsPage;
