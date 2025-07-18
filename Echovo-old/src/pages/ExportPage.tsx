import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import font from '../fonts/NanumGothic.js';
import type { RecordItem } from '../types/interview';
import PdfSidebarList from '../components/PdfSidebarList';
import PdfRecordViewer from '../components/PdfRecordViewer';

jsPDF.API.events.push(['addFonts', () => {
    jsPDF.API.addFileToVFS('NanumGothic.ttf', font);
    jsPDF.API.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
}]);

const ExportPage: React.FC = () => {
    const [records, setRecords] = useState<RecordItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [includeAnswer, setIncludeAnswer] = useState(true);
    const [includeModelAnswer, setIncludeModelAnswer] = useState(true);
    const [includeFeedback, setIncludeFeedback] = useState(true);
    const [includeScore, setIncludeScore] = useState(true);

    useEffect(() => {
        const logs = JSON.parse(localStorage.getItem('interviewLogs') || '[]');
        setRecords(logs);
    }, []);

    const handleUpdateField = (id: string, key: keyof RecordItem, value: string | number) => {
        const updatedList = records.map((r) =>
            r.id === id ? { ...r, [key]: value } : r
        );
        setRecords(updatedList);
        localStorage.setItem('interviewLogs', JSON.stringify(updatedList));
    };

    const exportToPDF = () => {
        const selectedRecords = records.filter(r => selectedIds.includes(r.id));
        if (selectedRecords.length === 0) return;

        const doc = new jsPDF();
        doc.addFileToVFS('NanumGothic.ttf', font);
        doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
        doc.setFont('NanumGothic');
        doc.setFontSize(16);
        doc.text('📄 면접 기록 모음', 14, 20);

        selectedRecords.forEach((record, index) => {
            if (index !== 0) doc.addPage(); // 각 record마다 새 페이지

            let offsetY = 40;

            doc.setFontSize(13);
            doc.text(`📌 질문`, 14, offsetY);
            doc.setFontSize(11);
            const questionLines = doc.splitTextToSize(record.question || '-', 180);
            offsetY += 7;
            doc.text(questionLines, 14, offsetY);
            offsetY += questionLines.length * 6 + 10;

            if (includeAnswer) {
                doc.setFontSize(13);
                doc.text(`🧑 내 답변`, 14, offsetY);
                doc.setFontSize(11);
                const answerLines = doc.splitTextToSize(record.answer || '-', 180);
                offsetY += 7;
                doc.text(answerLines, 14, offsetY);
                offsetY += answerLines.length * 6 + 10;
            }

            if (includeModelAnswer && record.modelAnswer) {
                doc.setFontSize(13);
                doc.text(`🟢 모범답안`, 14, offsetY);
                doc.setFontSize(11);
                const modelLines = doc.splitTextToSize(record.modelAnswer, 180);
                offsetY += 7;
                doc.text(modelLines, 14, offsetY);
                offsetY += modelLines.length * 6 + 10;
            }

            if (includeScore) {
                doc.setFontSize(13);
                doc.text(`📊 점수: ${record.score ?? '-'}`, 14, offsetY);
                offsetY += 10;
            }

            if (includeFeedback) {
                doc.setFontSize(13);
                doc.text(`💬 피드백`, 14, offsetY);
                doc.setFontSize(11);
                const feedbackLines = doc.splitTextToSize(record.feedback || '-', 180);
                offsetY += 7;
                doc.text(feedbackLines, 14, offsetY);
                offsetY += feedbackLines.length * 6 + 10;
            }

            // 마지막 라인
            doc.setDrawColor(180);
            doc.line(14, offsetY, 195, offsetY);
        });

        doc.save(' 면접.pdf');
    };


    return (
        <div className="flex h-screen bg-white">\
            <PdfSidebarList
                records={records}
                selectedIds={selectedIds}
                onToggleSelect={(id) => {
                    setSelectedIds((prev) =>
                        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                    );
                }}
            />

            <main className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                    ✏️ 선택한 면접 기록
                </h2>

                <div className="flex flex-wrap gap-4 mb-6 items-center text-sm bg-gray-50 p-4 rounded border">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={includeAnswer} onChange={() => setIncludeAnswer(!includeAnswer)} /> 내 답변
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={includeModelAnswer} onChange={() => setIncludeModelAnswer(!includeModelAnswer)} /> 모범답안
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={includeFeedback} onChange={() => setIncludeFeedback(!includeFeedback)} /> 피드백
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={includeScore} onChange={() => setIncludeScore(!includeScore)} /> 점수
                    </label>
                </div>

                {selectedIds.length > 0 ? (
                    <>
                        <PdfRecordViewer
                            selectedRecords={selectedIds
                                .map(id => records.find(r => r.id === id))
                                .filter((r): r is RecordItem => !!r)
                                .reverse()
                            }
                            editingId={editingId}
                            setEditingId={setEditingId}
                            onUpdateField={handleUpdateField}
                        />

                        <div className="text-right mt-8">
                            <button
                                onClick={exportToPDF}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded shadow hover:bg-blue-700 transition"
                            >
                                📤 PDF로 저장
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500 text-sm">왼쪽에서 하나 이상의 기록을 선택하세요.</p>
                )}
            </main>
        </div>
    );
};

export default ExportPage;
