    import React from 'react';
    import type { RecordItem } from '../types/interview';

    interface PdfRecordViewerProps {
        selectedRecords: RecordItem[];
        editingId: string | null;
        setEditingId: (id: string | null) => void;
        onUpdateField: (id: string, key: keyof RecordItem, value: string | number) => void;
    }

    const PdfRecordViewer: React.FC<PdfRecordViewerProps> = ({
        selectedRecords,
        editingId,
        setEditingId,
        onUpdateField
    }) => {
        return (
            <>
                {selectedRecords.map((record) => {
                    const isEditing = editingId === record.id;

                    return (
                        <div
                            key={record.id}
                            className="bg-white shadow rounded-lg p-4 mb-4 border border-gray-200"
                        >
                            {isEditing ? (
                                <>
                                    <h3 className="text-base font-semibold text-gray-800 mb-3">
                                        📝 질문 편집 - {record.question?.slice(0, 20) || '질문 없음'}
                                    </h3>

                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">질문</label>
                                        <textarea
                                            value={record.question}
                                            onChange={(e) => onUpdateField(record.id, 'question', e.target.value)}
                                            className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">답변</label>
                                        <textarea
                                            value={record.answer}
                                            onChange={(e) => onUpdateField(record.id, 'answer', e.target.value)}
                                            className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">점수</label>
                                            <input
                                                type="number"
                                                value={record.score}
                                                onChange={(e) => onUpdateField(record.id, 'score', parseFloat(e.target.value))}
                                                className="w-full p-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">피드백</label>
                                            <input
                                                type="text"
                                                value={record.feedback}
                                                onChange={(e) => onUpdateField(record.id, 'feedback', e.target.value)}
                                                className="w-full p-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                                        >
                                            저장 및 닫기
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3 text-sm text-gray-800">
                                    <div>
                                        <p className="font-semibold text-gray-600 text-xs">📌 질문</p>
                                        <p>{record.question || '-'}</p>
                                    </div>

                                    <div>
                                        <p className="font-semibold text-gray-600 text-xs">🧑 내 답변</p>
                                        <p className="bg-gray-50 p-2 rounded-md whitespace-pre-wrap border border-gray-200">
                                            {record.answer || '-'}
                                        </p>
                                    </div>

                                    {record.modelAnswer && (
                                        <div className="bg-green-50 border border-green-300 p-2 rounded-md text-sm">
                                            <p className="font-semibold text-green-700 mb-1 text-xs">🟢 모범답안</p>
                                            <p className="text-gray-800 whitespace-pre-wrap">{record.modelAnswer}</p>
                                        </div>
                                    )}

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                        <p><span className="font-semibold">💬 피드백:</span> {record.feedback || '-'}</p>
                                        <p><span className="font-semibold">📊 점수:</span> {record.score ?? '-'}</p>
                                    </div>

                                    <div className="text-right">
                                        <button
                                            onClick={() => setEditingId(record.id)}
                                            className="text-sm text-blue-600 font-semibold hover:underline"
                                        >
                                            ✏️ 수정하기
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
  
                    );
                })}
            </>
        );
    };

    export default PdfRecordViewer;
