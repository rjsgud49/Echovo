import React from 'react';
import type { RecordItem } from '../types/interview';

interface Props {
    record: RecordItem;
    onClose: () => void;
}

const RecordModal: React.FC<Props> = ({ record, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/30 animate-fade-in flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📄 면접 기록 상세</h2>

                <div className="space-y-4 text-sm text-gray-700">
                    <div>
                        <p className="font-semibold text-gray-600">🗓️ 날짜</p>
                        <p>{record.date}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-600">📝 질문</p>
                        <p className="whitespace-pre-wrap">{record.question}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-600">📘 요약</p>
                        <p className="whitespace-pre-wrap text-gray-800">{record.summary}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-600">🗣️ 내 답변</p>
                        <p className="whitespace-pre-wrap text-gray-900">{record.answer}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-600">💡 피드백</p>
                        <p className="whitespace-pre-wrap text-blue-800">{record.feedback}</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <p><strong>📈 점수:</strong> <span className="text-green-700 font-bold">{record.score}점</span></p>
                        <p><strong>⏱️ 시간:</strong> {record.duration}초</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-600">📚 모범답안</p>
                        <p className="whitespace-pre-wrap text-gray-700">{record.modelAnswer}</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecordModal;
