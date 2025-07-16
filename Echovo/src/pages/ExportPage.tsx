    import React, { useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import jsPDF from 'jspdf';
    import autoTable from 'jspdf-autotable';
    import font from '../fonts/NanumGothic.js'; // base64 폰트

    import type { RecordItem } from '../types/interview';

    jsPDF.API.events.push(['addFonts', () => {
        jsPDF.API.addFileToVFS('NanumGothic.ttf', font);
        jsPDF.API.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
    }]);

    const ExportPage: React.FC = () => {
        const navigate = useNavigate();
        const [records, setRecords] = useState<RecordItem[]>([]);
        const [selected, setSelected] = useState<RecordItem | null>(null);

        useEffect(() => {
            const logs = JSON.parse(localStorage.getItem('interviewLogs') || '[]');
            setRecords(logs);
        }, []);

        const handleUpdate = (key: keyof RecordItem, value: string | number) => {
            if (!selected) return;
            const updated = { ...selected, [key]: value };
            setSelected(updated);
            const newList = records.map(r => (r.id === updated.id ? updated : r));
            setRecords(newList);
            localStorage.setItem('interviewLogs', JSON.stringify(newList));
        };

        const exportToPDF = () => {
            if (!selected) return;

            const doc = new jsPDF();
            doc.setFont('NanumGothic');
            doc.setFontSize(14);
            doc.text('📄 면접 기록 요약', 14, 20);

            autoTable(doc, {
                body: [
                    ['질문', selected.question || ''],
                    ['답변', selected.answer || ''],
                    ['점수', selected.score?.toString() || '-'],
                    ['피드백', selected.feedback || '-'],
                ],
                theme: 'grid',
                styles: { font: 'NanumGothic', fontSize: 12 },
                startY: 30,
                columnStyles: { 0: { cellWidth: 30 } },
            });

            doc.save(`면접기록_${selected.id}.pdf`);
        };

        return (
            <div className="flex h-screen">
                {/* 왼쪽 사이드바 */}
                <aside className="w-64 p-4 border-r bg-gray-100">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-600 font-semibold mb-4 block"
                    >
                        ← 뒤로가기
                    </button>
                    <div className="space-y-2">
                        {records.map((record) => (
                            <div
                                key={record.id}
                                className={`p-3 rounded cursor-pointer shadow-sm hover:bg-blue-100 ${selected?.id === record.id ? 'bg-blue-200' : 'bg-white'
                                    }`}
                                onClick={() => setSelected(record)}
                            >
                                <p className="text-sm font-semibold truncate">
                                    {record.question?.slice(0, 30) || '질문 없음'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {record.answer?.slice(0, 40) || '답변 없음'}
                                </p>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* 오른쪽 세부내용 */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {selected ? (
                        <div className="space-y-4 max-w-2xl">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                ✏️ 면접 기록 편집
                            </h2>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600">질문</label>
                                <textarea
                                    value={selected.question}
                                    onChange={(e) => handleUpdate('question', e.target.value)}
                                    className="w-full p-2 border rounded text-sm"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600">답변</label>
                                <textarea
                                    value={selected.answer}
                                    onChange={(e) => handleUpdate('answer', e.target.value)}
                                    className="w-full p-2 border rounded text-sm"
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600">점수</label>
                                    <input
                                        type="number"
                                        value={selected.score}
                                        onChange={(e) => handleUpdate('score', parseFloat(e.target.value))}
                                        className="w-full border rounded px-2 py-1 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-600">피드백</label>
                                    <input
                                        type="text"
                                        value={selected.feedback}
                                        onChange={(e) => handleUpdate('feedback', e.target.value)}
                                        className="w-full border rounded px-2 py-1 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="text-right mt-4">
                                <button
                                    onClick={exportToPDF}
                                    className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
                                >
                                    📤 PDF로 저장
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">왼쪽 목록에서 로그를 선택하세요.</p>
                    )}
                </main>
            </div>
        );
    };

    export default ExportPage;
